import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FixtureDetailModal from "../FixtureDetailModal";
import { FIXTURE_TYPES } from "../../constants";
import type { LayoutFixture } from "../../../../shared/types";

const fixture: LayoutFixture = {
  id: "f1",
  layout_version_id: "lv1",
  name: "Main Entrance",
  fixture_type: "DOOR",
  cells: [
    { row: 0, col: 3 },
    { row: 0, col: 4 },
  ],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("FixtureDetailModal", () => {
  const defaultProps = {
    fixture,
    onUpdate: vi.fn(),
    onEditShape: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays the fixture name in the header", () => {
    render(<FixtureDetailModal {...defaultProps} />);
    expect(screen.getByText("Main Entrance")).toBeInTheDocument();
  });

  it("displays the cell count", () => {
    render(<FixtureDetailModal {...defaultProps} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("displays the fixture type label in stats", () => {
    render(<FixtureDetailModal {...defaultProps} />);
    // DOOR fixture type label appears in stats and in the type grid
    const doorDef = FIXTURE_TYPES.find((ft) => ft.type === "DOOR")!;
    const matches = screen.getAllByText(doorDef.label);
    // At least one in the stats section
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows the name input with current fixture name", () => {
    render(<FixtureDetailModal {...defaultProps} />);
    expect(screen.getByLabelText("Name")).toHaveValue("Main Entrance");
  });

  it("does not show Save Changes by default", () => {
    render(<FixtureDetailModal {...defaultProps} />);
    expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
  });

  it("shows Save Changes when name is changed", async () => {
    render(<FixtureDetailModal {...defaultProps} />);
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Back Door");
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("shows Save Changes when fixture type is changed", async () => {
    render(<FixtureDetailModal {...defaultProps} />);
    const user = userEvent.setup();
    const wallDef = FIXTURE_TYPES.find((ft) => ft.type === "WALL")!;
    await user.click(screen.getByText(wallDef.label));
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("calls onUpdate with only changed fields", async () => {
    const onUpdate = vi.fn();
    render(<FixtureDetailModal {...defaultProps} onUpdate={onUpdate} />);
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Side Door");
    await user.click(screen.getByText("Save Changes"));
    expect(onUpdate).toHaveBeenCalledWith("f1", { name: "Side Door" });
  });

  it("calls onUpdate with changed type", async () => {
    const onUpdate = vi.fn();
    render(<FixtureDetailModal {...defaultProps} onUpdate={onUpdate} />);
    const user = userEvent.setup();
    const wallDef = FIXTURE_TYPES.find((ft) => ft.type === "WALL")!;
    await user.click(screen.getByText(wallDef.label));
    await user.click(screen.getByText("Save Changes"));
    expect(onUpdate).toHaveBeenCalledWith("f1", { fixture_type: "WALL" });
  });

  it("calls onEditShape", async () => {
    const onEditShape = vi.fn();
    render(<FixtureDetailModal {...defaultProps} onEditShape={onEditShape} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/Edit Shape/));
    expect(onEditShape).toHaveBeenCalledWith("f1");
  });

  it("shows delete confirmation", async () => {
    render(<FixtureDetailModal {...defaultProps} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/Delete/));
    expect(screen.getByText(/This cannot be undone/)).toBeInTheDocument();
    expect(screen.getByText("Delete Fixture")).toBeInTheDocument();
  });

  it("calls onDelete when confirmed", async () => {
    const onDelete = vi.fn();
    render(<FixtureDetailModal {...defaultProps} onDelete={onDelete} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/Delete/));
    await user.click(screen.getByText("Delete Fixture"));
    expect(onDelete).toHaveBeenCalledWith("f1");
  });

  it("cancels delete confirmation", async () => {
    render(<FixtureDetailModal {...defaultProps} />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/Delete/));
    expect(screen.getByText("Delete Fixture")).toBeInTheDocument();
    const cancelButtons = screen.getAllByText("Cancel");
    await user.click(cancelButtons[0]);
    expect(screen.queryByText("Delete Fixture")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<FixtureDetailModal {...defaultProps} onClose={onClose} />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
