import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LayoutGrid from "../LayoutGrid";
import type { LayoutZone, LayoutFixture } from "../../../../shared/types";
import { ZONE_COLORS } from "../../constants";

const zone: LayoutZone = {
  id: "z1",
  layout_version_id: "lv1",
  name: "Produce",
  color: ZONE_COLORS[0].hex,
  cells: [{ row: 0, col: 0 }],
  is_freeform: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const fixture: LayoutFixture = {
  id: "f1",
  layout_version_id: "lv1",
  name: "Main Door",
  fixture_type: "DOOR",
  cells: [{ row: 1, col: 1 }],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const baseProps = {
  rows: 3,
  cols: 3,
  zones: [] as LayoutZone[],
  fixtures: [] as LayoutFixture[],
  placementMode: "none" as const,
  freeformCells: [],
  onFreeformCellsChange: vi.fn(),
  editingId: null,
  editingType: null,
  editingCells: [],
  onEditingCellsChange: vi.fn(),
  selectedItemId: null,
  onItemClick: vi.fn(),
  onItemDoubleClick: vi.fn(),
};

describe("LayoutGrid", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the correct number of cells", () => {
    render(<LayoutGrid {...baseProps} />);
    // 3x3 = 9 cells, each has a coord span like "0,0"
    const coords = screen.getAllByText(/^\d,\d$/);
    expect(coords).toHaveLength(9);
  });

  it("displays coordinates when showCoords is true", () => {
    render(<LayoutGrid {...baseProps} showCoords />);
    expect(screen.getByText("0,0")).toBeInTheDocument();
    expect(screen.getByText("2,2")).toBeInTheDocument();
  });

  it("hides coordinates when showCoords is false", () => {
    render(<LayoutGrid {...baseProps} showCoords={false} />);
    expect(screen.queryByText("0,0")).not.toBeInTheDocument();
  });

  it("renders zone name within zone cells", () => {
    render(<LayoutGrid {...baseProps} zones={[zone]} />);
    expect(screen.getByText("Produce")).toBeInTheDocument();
  });

  it("renders fixture name within fixture cells", () => {
    render(<LayoutGrid {...baseProps} fixtures={[fixture]} />);
    expect(screen.getByText("Main Door")).toBeInTheDocument();
  });

  it("calls onItemClick when a zone cell is clicked in view mode", async () => {
    const onItemClick = vi.fn();
    render(
      <LayoutGrid {...baseProps} zones={[zone]} onItemClick={onItemClick} />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("Produce"));
    expect(onItemClick).toHaveBeenCalledWith("zone", "z1");
  });

  it("calls onItemClick when a fixture cell is clicked in view mode", async () => {
    const onItemClick = vi.fn();
    render(
      <LayoutGrid
        {...baseProps}
        fixtures={[fixture]}
        onItemClick={onItemClick}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("Main Door"));
    expect(onItemClick).toHaveBeenCalledWith("fixture", "f1");
  });

  it("calls onItemDoubleClick when a zone cell is double-clicked", async () => {
    const onItemDoubleClick = vi.fn();
    render(
      <LayoutGrid
        {...baseProps}
        zones={[zone]}
        onItemDoubleClick={onItemDoubleClick}
      />,
    );
    const user = userEvent.setup();
    await user.dblClick(screen.getByText("Produce"));
    expect(onItemDoubleClick).toHaveBeenCalledWith("zone", "z1");
  });

  it("does not call onItemClick in placement mode", async () => {
    const onItemClick = vi.fn();
    render(
      <LayoutGrid
        {...baseProps}
        zones={[zone]}
        placementMode="zone"
        onItemClick={onItemClick}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("Produce"));
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("shows plus signs for empty cells in placement mode", () => {
    render(<LayoutGrid {...baseProps} placementMode="zone" />);
    const plusSigns = screen.getAllByText("+");
    // 9 empty cells should all show "+"
    expect(plusSigns).toHaveLength(9);
  });

  it("does not show plus signs for occupied cells in placement mode", () => {
    render(
      <LayoutGrid
        {...baseProps}
        zones={[zone]}
        placementMode="zone"
      />,
    );
    const plusSigns = screen.getAllByText("+");
    // 9 cells minus 1 occupied = 8 plus signs
    expect(plusSigns).toHaveLength(8);
  });

  it("sets CSS custom properties for grid dimensions", () => {
    const { container } = render(<LayoutGrid {...baseProps} rows={4} cols={6} />);
    const gridEl = container.firstChild as HTMLElement;
    expect(gridEl.style.getPropertyValue("--layout-cols")).toBe("6");
    expect(gridEl.style.getPropertyValue("--layout-rows")).toBe("4");
  });
});
