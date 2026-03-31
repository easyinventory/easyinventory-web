import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModeToolbar from "../ModeToolbar";

describe("ModeToolbar", () => {
  const defaultProps = {
    placementMode: "none" as const,
    onPlacementModeChange: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders both placement buttons", () => {
    render(<ModeToolbar {...defaultProps} />);
    expect(screen.getByText(/Inventory Zone/)).toBeInTheDocument();
    expect(screen.getByText(/Wall \/ Fixture/)).toBeInTheDocument();
  });

  it("renders the Place label", () => {
    render(<ModeToolbar {...defaultProps} />);
    expect(screen.getByText("Place:")).toBeInTheDocument();
  });

  it("calls onPlacementModeChange with 'zone' when zone button clicked", async () => {
    const onChange = vi.fn();
    render(
      <ModeToolbar {...defaultProps} onPlacementModeChange={onChange} />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/Inventory Zone/));
    expect(onChange).toHaveBeenCalledWith("zone");
  });

  it("calls onPlacementModeChange with 'fixture' when fixture button clicked", async () => {
    const onChange = vi.fn();
    render(
      <ModeToolbar {...defaultProps} onPlacementModeChange={onChange} />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/Wall \/ Fixture/));
    expect(onChange).toHaveBeenCalledWith("fixture");
  });

  it("toggles off when clicking the active zone button", async () => {
    const onChange = vi.fn();
    render(
      <ModeToolbar
        {...defaultProps}
        placementMode="zone"
        onPlacementModeChange={onChange}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/Inventory Zone/));
    expect(onChange).toHaveBeenCalledWith("none");
  });

  it("toggles off when clicking the active fixture button", async () => {
    const onChange = vi.fn();
    render(
      <ModeToolbar
        {...defaultProps}
        placementMode="fixture"
        onPlacementModeChange={onChange}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/Wall \/ Fixture/));
    expect(onChange).toHaveBeenCalledWith("none");
  });

  it("disables buttons when disabled prop is true", () => {
    render(<ModeToolbar {...defaultProps} disabled />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
