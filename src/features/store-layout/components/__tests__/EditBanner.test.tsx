import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditBanner from "../EditBanner";
import type { Cell } from "../../../../shared/types";

describe("EditBanner", () => {
  const cells: Cell[] = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
  ];

  const defaultProps = {
    name: "Electronics",
    cells,
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the item name", () => {
    render(<EditBanner {...defaultProps} />);
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("shows the cell count", () => {
    render(<EditBanner {...defaultProps} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onSave when Done is clicked", async () => {
    const onSave = vi.fn();
    render(<EditBanner {...defaultProps} onSave={onSave} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Done"));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(<EditBanner {...defaultProps} onCancel={onCancel} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("disables buttons when isSaving", () => {
    render(<EditBanner {...defaultProps} isSaving />);
    expect(screen.getByText("Saving…")).toBeDisabled();
    expect(screen.getByText("Cancel")).toBeDisabled();
  });

  it("shows 'Saving…' text when saving", () => {
    render(<EditBanner {...defaultProps} isSaving />);
    expect(screen.getByText("Saving…")).toBeInTheDocument();
  });

  it("disables Done when no cells", () => {
    render(<EditBanner {...defaultProps} cells={[]} />);
    expect(screen.getByText("Done")).toBeDisabled();
  });
});
