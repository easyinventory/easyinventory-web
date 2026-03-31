import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FreeformBar from "../FreeformBar";
import type { Cell } from "../../../../shared/types";

describe("FreeformBar", () => {
  const defaultProps = {
    cells: [{ row: 0, col: 0 }] as Cell[],
    placementType: "zone" as const,
    onDone: vi.fn(),
    onCancel: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the cell count and placement type", () => {
    render(<FreeformBar {...defaultProps} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText(/Creating zone/)).toBeInTheDocument();
  });

  it("pluralizes cells correctly", () => {
    render(
      <FreeformBar
        {...defaultProps}
        cells={[
          { row: 0, col: 0 },
          { row: 0, col: 1 },
        ]}
      />,
    );
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/cells selected/)).toBeInTheDocument();
  });

  it("shows singular 'cell' for 1 cell", () => {
    render(<FreeformBar {...defaultProps} />);
    expect(screen.getByText(/cell selected/)).toBeInTheDocument();
  });

  it("disables Done when no cells", () => {
    render(<FreeformBar {...defaultProps} cells={[]} />);
    expect(screen.getByText("Done")).toBeDisabled();
  });

  it("enables Done when cells exist", () => {
    render(<FreeformBar {...defaultProps} />);
    expect(screen.getByText("Done")).not.toBeDisabled();
  });

  it("calls onDone when Done is clicked", async () => {
    const onDone = vi.fn();
    render(<FreeformBar {...defaultProps} onDone={onDone} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Done"));
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(<FreeformBar {...defaultProps} onCancel={onCancel} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows fixture placement type", () => {
    render(<FreeformBar {...defaultProps} placementType="fixture" />);
    expect(screen.getByText(/Creating fixture/)).toBeInTheDocument();
  });
});
