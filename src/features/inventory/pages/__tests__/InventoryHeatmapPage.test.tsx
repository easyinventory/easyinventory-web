import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InventoryHeatmapPage from "../InventoryHeatmapPage";

/* ── Mocks ── */

const mockUseStore = vi.fn();
vi.mock("../../../store-layout/context/useStore", () => ({
  useStore: () => mockUseStore(),
}));

const mockGetZoneInventorySummary = vi.fn();
vi.mock("../../../analytics/api/analyticsApi", () => ({
  getZoneInventorySummary: (...args: unknown[]) => mockGetZoneInventorySummary(...args),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <InventoryHeatmapPage />
    </MemoryRouter>,
  );
}

/* ── Tests ── */

describe("InventoryHeatmapPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows empty state when no store is selected", () => {
    mockUseStore.mockReturnValue({
      selectedStoreId: null,
      selectedStoreName: null,
    });

    renderPage();
    expect(
      screen.getByText("Select a store to view the inventory heatmap."),
    ).toBeInTheDocument();
  });

  it("shows loading state while fetching", () => {
    mockUseStore.mockReturnValue({
      selectedStoreId: "s1",
      selectedStoreName: "Test Store",
    });
    mockGetZoneInventorySummary.mockReturnValue(new Promise(() => {}));

    renderPage();
    expect(screen.getByText("Loading heatmap data...")).toBeInTheDocument();
  });

  it("shows error banner when fetch fails", async () => {
    mockUseStore.mockReturnValue({
      selectedStoreId: "s1",
      selectedStoreName: "Test Store",
    });
    mockGetZoneInventorySummary.mockRejectedValue(new Error("Network error"));

    renderPage();
    expect(
      await screen.findByTestId("error-banner"),
    ).toBeInTheDocument();
  });

  it("shows empty state when no zones exist", async () => {
    mockUseStore.mockReturnValue({
      selectedStoreId: "s1",
      selectedStoreName: "Test Store",
    });
    mockGetZoneInventorySummary.mockResolvedValue({
      layout_id: "l1",
      layout_version: 1,
      rows: 5,
      cols: 5,
      zones: [],
      fixtures: [],
      unzoned_summary: {
        total_items: 0,
        total_quantity: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
      },
    });

    renderPage();
    expect(
      await screen.findByText(/No zones defined/),
    ).toBeInTheDocument();
  });

  it("renders the heatmap grid when data is available", async () => {
    mockUseStore.mockReturnValue({
      selectedStoreId: "s1",
      selectedStoreName: "Test Store",
    });
    mockGetZoneInventorySummary.mockResolvedValue({
      layout_id: "l1",
      layout_version: 1,
      rows: 3,
      cols: 3,
      zones: [
        {
          zone_id: "z1",
          zone_name: "Produce",
          zone_color: "#3B82F6",
          cells: [{ row: 0, col: 0 }],
          total_items: 2,
          total_quantity: 50,
          low_stock_count: 1,
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
    });

    renderPage();

    // Legend should be visible
    expect(await screen.findByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Low / Out of Stock")).toBeInTheDocument();

    // Detail panel empty state
    expect(
      screen.getByText("Click a zone to view inventory details"),
    ).toBeInTheDocument();
  });

  it("renders page header with back link to inventory", () => {
    mockUseStore.mockReturnValue({
      selectedStoreId: "s1",
      selectedStoreName: "Test Store",
    });
    mockGetZoneInventorySummary.mockReturnValue(new Promise(() => {}));

    renderPage();
    expect(screen.getByText("Inventory Heatmap")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument(); // back link
  });
});
