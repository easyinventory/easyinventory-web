import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LayoutObjectsPanel from "../LayoutObjectsPanel";
import type { LayoutZone, LayoutFixture } from "../../../../shared/types";

const zones: LayoutZone[] = [
  {
    id: "z1",
    layout_version_id: "lv1",
    name: "Produce",
    color: "#22C55E",
    cells: [{ row: 0, col: 0 }],
    is_freeform: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "z2",
    layout_version_id: "lv1",
    name: "Electronics",
    color: "#3B82F6",
    cells: [
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    is_freeform: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const fixtures: LayoutFixture[] = [
  {
    id: "f1",
    layout_version_id: "lv1",
    name: "Main Door",
    fixture_type: "DOOR",
    cells: [{ row: 0, col: 3 }],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

describe("LayoutObjectsPanel", () => {
  const defaultProps = {
    zones,
    fixtures,
    selectedItemId: null,
    onItemClick: vi.fn(),
    onItemDoubleClick: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays the total object count", () => {
    render(<LayoutObjectsPanel {...defaultProps} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("displays zone names", () => {
    render(<LayoutObjectsPanel {...defaultProps} />);
    expect(screen.getByText("Produce")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("displays fixture names", () => {
    render(<LayoutObjectsPanel {...defaultProps} />);
    expect(screen.getByText("Main Door")).toBeInTheDocument();
  });

  it("shows Freeform badge for freeform zones", () => {
    render(<LayoutObjectsPanel {...defaultProps} />);
    expect(screen.getByText("Freeform")).toBeInTheDocument();
  });

  it("shows empty message when no zones", () => {
    render(<LayoutObjectsPanel {...defaultProps} zones={[]} />);
    expect(screen.getByText("No zones added yet.")).toBeInTheDocument();
  });

  it("shows empty message when no fixtures", () => {
    render(<LayoutObjectsPanel {...defaultProps} fixtures={[]} />);
    expect(screen.getByText("No fixtures added yet.")).toBeInTheDocument();
  });

  it("calls onItemClick when a zone is clicked", async () => {
    const onItemClick = vi.fn();
    render(<LayoutObjectsPanel {...defaultProps} onItemClick={onItemClick} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Produce"));
    expect(onItemClick).toHaveBeenCalledWith("zone", "z1");
  });

  it("calls onItemClick when a fixture is clicked", async () => {
    const onItemClick = vi.fn();
    render(<LayoutObjectsPanel {...defaultProps} onItemClick={onItemClick} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Main Door"));
    expect(onItemClick).toHaveBeenCalledWith("fixture", "f1");
  });

  it("calls onItemDoubleClick when a zone is double-clicked", async () => {
    const onItemDoubleClick = vi.fn();
    render(
      <LayoutObjectsPanel
        {...defaultProps}
        onItemDoubleClick={onItemDoubleClick}
      />,
    );
    const user = userEvent.setup();
    await user.dblClick(screen.getByText("Electronics"));
    expect(onItemDoubleClick).toHaveBeenCalledWith("zone", "z2");
  });

  it("displays cell counts for each item", () => {
    render(<LayoutObjectsPanel {...defaultProps} />);
    // z1 has 1 cell, z2 has 2 cells, f1 has 1 cell
    const ones = screen.getAllByText("1");
    expect(ones.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders section labels", () => {
    render(<LayoutObjectsPanel {...defaultProps} />);
    expect(screen.getByText("INVENTORY ZONES")).toBeInTheDocument();
    // The second label uses &amp; in JSX which renders as &
    expect(screen.getByText("FIXTURES & STRUCTURES")).toBeInTheDocument();
  });
});
