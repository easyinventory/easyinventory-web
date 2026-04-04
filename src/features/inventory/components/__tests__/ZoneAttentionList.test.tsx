import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZoneAttentionList from "../ZoneAttentionList";
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
      total_items: 3,
      total_quantity: 50,
      low_stock_count: 1,
      out_of_stock_count: 0,
      items: [],
    },
    {
      zone_id: "z2",
      zone_name: "Frozen",
      zone_color: "#8B5CF6",
      cells: [{ row: 1, col: 0 }],
      total_items: 3,
      total_quantity: 5,
      low_stock_count: 1,
      out_of_stock_count: 2,
      items: [],
    },
    {
      zone_id: "z3",
      zone_name: "Dairy",
      zone_color: "#3B82F6",
      cells: [{ row: 2, col: 0 }],
      total_items: 2,
      total_quantity: 40,
      low_stock_count: 0,
      out_of_stock_count: 0,
      items: [],
    },
  ],
  fixtures: [],
  unzoned_summary: {
    total_items: 0,
    total_quantity: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
  },
};

describe("ZoneAttentionList", () => {
  it("renders only zones with stock issues", () => {
    render(
      <ZoneAttentionList
        data={mockData}
        selectedZoneId={null}
        onZoneClick={() => {}}
      />,
    );
    expect(screen.getByText("Frozen")).toBeInTheDocument();
    expect(screen.getByText("Produce")).toBeInTheDocument();
    expect(screen.queryByText("Dairy")).not.toBeInTheDocument();
  });

  it("sorts worst zone first", () => {
    render(
      <ZoneAttentionList
        data={mockData}
        selectedZoneId={null}
        onZoneClick={() => {}}
      />,
    );
    const buttons = screen.getAllByRole("button");
    // Frozen (severity 1.0) should be first, Produce (0.33) second
    expect(buttons[0]).toHaveTextContent("Frozen");
    expect(buttons[1]).toHaveTextContent("Produce");
  });

  it("calls onZoneClick when a row is clicked", async () => {
    const onZoneClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ZoneAttentionList
        data={mockData}
        selectedZoneId={null}
        onZoneClick={onZoneClick}
      />,
    );

    await user.click(screen.getByText("Frozen"));
    expect(onZoneClick).toHaveBeenCalledWith("z2");
  });

  it("returns null when no zones have issues", () => {
    const healthyData = {
      ...mockData,
      zones: mockData.zones.map((z) => ({
        ...z,
        low_stock_count: 0,
        out_of_stock_count: 0,
      })),
    };

    const { container } = render(
      <ZoneAttentionList
        data={healthyData}
        selectedZoneId={null}
        onZoneClick={() => {}}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("highlights the selected zone row", () => {
    render(
      <ZoneAttentionList
        data={mockData}
        selectedZoneId="z2"
        onZoneClick={() => {}}
      />,
    );
    const frozenRow = screen.getByText("Frozen").closest("button");
    expect(frozenRow?.className).toContain("--selected");
  });
});
