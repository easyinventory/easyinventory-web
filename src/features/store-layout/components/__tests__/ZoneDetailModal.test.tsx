import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZoneDetailModal from "../ZoneDetailModal";
import { ZONE_COLORS } from "../../constants";
import type { LayoutZone } from "../../../../shared/types";

const zone: LayoutZone = {
  id: "z1",
  layout_version_id: "lv1",
  name: "Electronics",
  color: ZONE_COLORS[0].hex,
  cells: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
  ],
  is_freeform: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("ZoneDetailModal", () => {
  const defaultProps = {
    zone,
    onUpdate: vi.fn(),
    onEditShape: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays the zone name in the header", () => {
    render(<ZoneDetailModal {...defaultProps} />);
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("displays the cell count", () => {
    render(<ZoneDetailModal {...defaultProps} />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("displays Rectangle when not freeform", () => {
    render(<ZoneDetailModal {...defaultProps} />);
    expect(screen.getByText("Rectangle")).toBeInTheDocument();
  });

  it("displays Freeform when is_freeform", () => {
    const freeformZone = { ...zone, is_freeform: true };
    render(<ZoneDetailModal {...defaultProps} zone={freeformZone} />);
    expect(screen.getByText("Freeform")).toBeInTheDocument();
  });

  it("shows the name input with current zone name", () => {
    render(<ZoneDetailModal {...defaultProps} />);
    expect(screen.getByLabelText("Name")).toHaveValue("Electronics");
  });

  it("does not show Save Changes by default", () => {
    render(<ZoneDetailModal {...defaultProps} />);
    expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
  });

  it("shows Save Changes when name is changed", async () => {
    render(<ZoneDetailModal {...defaultProps} />);
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Grocery");
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("shows Save Changes when color is changed", async () => {
    render(<ZoneDetailModal {...defaultProps} />);
    const user = userEvent.setup();
    await user.click(screen.getByTitle(ZONE_COLORS[3].name));
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("calls onUpdate with only changed fields", async () => {
    const onUpdate = vi.fn();
    render(<ZoneDetailModal {...defaultProps} onUpdate={onUpdate} />);
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Grocery");
    await user.click(screen.getByText("Save Changes"));
    expect(onUpdate).toHaveBeenCalledWith("z1", { name: "Grocery" });
  });

  it("calls onEditShape", async () => {
    const onEditShape = vi.fn();
    render(<ZoneDetailModal {...defaultProps} onEditShape={onEditShape} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/Edit Shape/));
    expect(onEditShape).toHaveBeenCalledWith("z1");
  });

  it("shows delete confirmation on delete click", async () => {
    render(<ZoneDetailModal {...defaultProps} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/Delete/));
    expect(
      screen.getByText(/This cannot be undone/),
    ).toBeInTheDocument();
    expect(screen.getByText("Delete Zone")).toBeInTheDocument();
  });

  it("calls onDelete when confirmed", async () => {
    const onDelete = vi.fn();
    render(<ZoneDetailModal {...defaultProps} onDelete={onDelete} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/Delete/));
    await user.click(screen.getByText("Delete Zone"));
    expect(onDelete).toHaveBeenCalledWith("z1");
  });

  it("cancels delete confirmation", async () => {
    render(<ZoneDetailModal {...defaultProps} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/Delete/));
    expect(screen.getByText("Delete Zone")).toBeInTheDocument();
    // Find the cancel button within the delete confirm section
    const cancelButtons = screen.getAllByText("Cancel");
    await user.click(cancelButtons[0]);
    expect(screen.queryByText("Delete Zone")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<ZoneDetailModal {...defaultProps} onClose={onClose} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
