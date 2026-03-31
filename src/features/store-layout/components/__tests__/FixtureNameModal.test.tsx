import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FixtureNameModal from "../FixtureNameModal";
import { FIXTURE_TYPES } from "../../constants";
import type { Cell } from "../../../../shared/types";

describe("FixtureNameModal", () => {
  const cells: Cell[] = [
    { row: 1, col: 1 },
    { row: 1, col: 2 },
  ];

  const defaultProps = {
    cells,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the title", () => {
    render(<FixtureNameModal {...defaultProps} />);
    expect(screen.getByText("Add Fixture", { selector: "h3" })).toBeInTheDocument();
  });

  it("renders a name input", () => {
    render(<FixtureNameModal {...defaultProps} />);
    expect(screen.getByLabelText("Fixture Name")).toBeInTheDocument();
  });

  it("renders all fixture type buttons", () => {
    render(<FixtureNameModal {...defaultProps} />);
    for (const ft of FIXTURE_TYPES) {
      expect(screen.getByText(ft.label)).toBeInTheDocument();
    }
  });

  it("disables Add Fixture when name is empty", () => {
    render(<FixtureNameModal {...defaultProps} />);
    expect(screen.getByText("Add Fixture", { selector: "button[type='submit']" })).toBeDisabled();
  });

  it("enables Add Fixture when name is entered", async () => {
    render(<FixtureNameModal {...defaultProps} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Fixture Name"), "Main Entrance");
    expect(screen.getByText("Add Fixture", { selector: "button[type='submit']" })).toBeEnabled();
  });

  it("calls onConfirm with name, type, and cells", async () => {
    const onConfirm = vi.fn();
    render(<FixtureNameModal {...defaultProps} onConfirm={onConfirm} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Fixture Name"), "Checkout 1");
    await user.click(screen.getByText("Add Fixture", { selector: "button[type='submit']" }));
    expect(onConfirm).toHaveBeenCalledWith(
      "Checkout 1",
      FIXTURE_TYPES[0].type,
      cells,
    );
  });

  it("allows selecting a different fixture type", async () => {
    const onConfirm = vi.fn();
    render(<FixtureNameModal {...defaultProps} onConfirm={onConfirm} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Fixture Name"), "Wall");
    await user.click(screen.getByText(FIXTURE_TYPES[1].label));
    await user.click(screen.getByText("Add Fixture", { selector: "button[type='submit']" }));
    expect(onConfirm).toHaveBeenCalledWith(
      "Wall",
      FIXTURE_TYPES[1].type,
      cells,
    );
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(<FixtureNameModal {...defaultProps} onCancel={onCancel} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
