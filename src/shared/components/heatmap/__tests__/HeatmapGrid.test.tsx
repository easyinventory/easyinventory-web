import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeatmapGrid from "../HeatmapGrid";
import type { HeatmapZone, HeatmapFixture } from "../../../types";

const mockZone: HeatmapZone = {
  id: "z1",
  name: "Produce",
  color: "#3B82F6",
  cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
  heatValue: 0.3,
};

const mockFixture: HeatmapFixture = {
  id: "f1",
  name: "Wall",
  fixtureType: "WALL",
  cells: [{ row: 1, col: 0 }],
};

const defaultColorScale = () => "rgba(0, 128, 0, 0.5)";

describe("HeatmapGrid", () => {
  it("renders the correct number of cells", () => {
    const { container } = render(
      <HeatmapGrid
        config={{ rows: 2, cols: 2 }}
        zones={[mockZone]}
        fixtures={[mockFixture]}
        colorScale={defaultColorScale}
        selectedZoneId={null}
        onZoneClick={() => {}}
        renderDetail={() => null}
      />,
    );

    const cells = container.querySelectorAll(".heatmap-grid__cell");
    expect(cells.length).toBe(4); // 2x2 grid
  });

  it("calls onZoneClick when a zone cell is clicked", async () => {
    const onZoneClick = vi.fn();
    const user = userEvent.setup();

    render(
      <HeatmapGrid
        config={{ rows: 2, cols: 2 }}
        zones={[mockZone]}
        fixtures={[]}
        colorScale={defaultColorScale}
        selectedZoneId={null}
        onZoneClick={onZoneClick}
        renderDetail={() => null}
      />,
    );

    // Zone cells have role="button"
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    await user.click(buttons[0]);
    expect(onZoneClick).toHaveBeenCalledWith("z1");
  });

  it("renders the legend", () => {
    render(
      <HeatmapGrid
        config={{ rows: 2, cols: 2 }}
        zones={[]}
        fixtures={[]}
        colorScale={defaultColorScale}
        selectedZoneId={null}
        onZoneClick={() => {}}
        renderDetail={() => null}
        legendLowLabel="Good"
        legendHighLabel="Bad"
      />,
    );

    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("Bad")).toBeInTheDocument();
  });

  it("shows empty detail panel when no zone selected", () => {
    render(
      <HeatmapGrid
        config={{ rows: 2, cols: 2 }}
        zones={[]}
        fixtures={[]}
        colorScale={defaultColorScale}
        selectedZoneId={null}
        onZoneClick={() => {}}
        renderDetail={() => <div>Detail Content</div>}
        detailEmptyLabel="Select a zone"
      />,
    );

    expect(screen.getByText("Select a zone")).toBeInTheDocument();
  });
});
