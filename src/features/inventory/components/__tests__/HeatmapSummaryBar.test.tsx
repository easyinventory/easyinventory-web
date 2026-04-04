import { render, screen } from "@testing-library/react";
import HeatmapSummaryBar from "../HeatmapSummaryBar";
import type { ZoneInventorySummaryResponse } from "../../../analytics/api/analyticsTypes";

const mockData: ZoneInventorySummaryResponse = {
  layout_id: "l1",
  layout_version: 1,
  rows: 5,
  cols: 5,
  zones: [
    {
      zone_id: "z1",
      zone_name: "Produce",
      zone_color: "#22C55E",
      cells: [{ row: 0, col: 0 }],
      total_items: 5,
      total_quantity: 100,
      low_stock_count: 1,
      out_of_stock_count: 1,
      items: [],
    },
    {
      zone_id: "z2",
      zone_name: "Dairy",
      zone_color: "#3B82F6",
      cells: [{ row: 1, col: 0 }],
      total_items: 3,
      total_quantity: 50,
      low_stock_count: 0,
      out_of_stock_count: 0,
      items: [],
    },
  ],
  fixtures: [],
  unzoned_summary: {
    total_items: 2,
    total_quantity: 20,
    low_stock_count: 1,
    out_of_stock_count: 0,
  },
};

describe("HeatmapSummaryBar", () => {
  it("renders correct total items across zones + unzoned", () => {
    render(<HeatmapSummaryBar data={mockData} />);
    expect(screen.getByText("10")).toBeInTheDocument(); // 5 + 3 + 2
  });

  it("renders correct low stock count", () => {
    render(<HeatmapSummaryBar data={mockData} />);
    expect(screen.getByText("2")).toBeInTheDocument(); // 1 + 0 + 1
  });

  it("renders correct out of stock count", () => {
    render(<HeatmapSummaryBar data={mockData} />);
    expect(screen.getByText("1")).toBeInTheDocument(); // 1 + 0 + 0
  });

  it("renders all four labels", () => {
    render(<HeatmapSummaryBar data={mockData} />);
    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });
});
