import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZoneNameModal from "../ZoneNameModal";
import { ZONE_COLORS } from "../../constants";
import type { Cell } from "../../../../shared/types";

describe("ZoneNameModal", () => {
  const cells: Cell[] = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
  ];

  const defaultProps = {
    cells,
    isFreeform: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the title", () => {
    render(<ZoneNameModal {...defaultProps} />);
    expect(screen.getByText("Name this Zone")).toBeInTheDocument();
  });

  it("renders a name input", () => {
    render(<ZoneNameModal {...defaultProps} />);
    expect(screen.getByLabelText("Zone Name")).toBeInTheDocument();
  });

  it("renders all color swatches", () => {
    render(<ZoneNameModal {...defaultProps} />);
    for (const c of ZONE_COLORS) {
      expect(screen.getByTitle(c.name)).toBeInTheDocument();
    }
  });

  it("disables Create Zone when name is empty", () => {
    render(<ZoneNameModal {...defaultProps} />);
    expect(screen.getByText("Create Zone")).toBeDisabled();
  });

  it("enables Create Zone when name is entered", async () => {
    render(<ZoneNameModal {...defaultProps} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Zone Name"), "Produce");
    expect(screen.getByText("Create Zone")).toBeEnabled();
  });

  it("calls onConfirm with name, color, cells, and isFreeform", async () => {
    const onConfirm = vi.fn();
    render(<ZoneNameModal {...defaultProps} onConfirm={onConfirm} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Zone Name"), "Electronics");
    await user.click(screen.getByText("Create Zone"));
    expect(onConfirm).toHaveBeenCalledWith(
      "Electronics",
      ZONE_COLORS[0].hex,
      cells,
      false,
    );
  });

  it("allows selecting a different color", async () => {
    const onConfirm = vi.fn();
    render(<ZoneNameModal {...defaultProps} onConfirm={onConfirm} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Zone Name"), "Dairy");
    await user.click(screen.getByTitle(ZONE_COLORS[2].name));
    await user.click(screen.getByText("Create Zone"));
    expect(onConfirm).toHaveBeenCalledWith(
      "Dairy",
      ZONE_COLORS[2].hex,
      cells,
      false,
    );
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<ZoneNameModal {...defaultProps} onCancel={onCancel} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("passes isFreeform correctly", async () => {
    const onConfirm = vi.fn();
    render(
      <ZoneNameModal {...defaultProps} isFreeform onConfirm={onConfirm} />,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Zone Name"), "A");
    await user.click(screen.getByText("Create Zone"));
    expect(onConfirm).toHaveBeenCalledWith(
      "A",
      ZONE_COLORS[0].hex,
      cells,
      true,
    );
  });
});
