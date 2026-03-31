import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StoreLayoutPage from "../StoreLayoutPage";
import type { StoreLayout, LayoutZone, LayoutFixture } from "../../../../shared/types";

/* ── Mocks ── */

const mockUseStore = vi.fn();
vi.mock("../../context/useStore", () => ({
  useStore: () => mockUseStore(),
}));

const mockListLayouts = vi.fn();
vi.mock("../../api/storeApi", () => ({
  listLayouts: (...args: unknown[]) => mockListLayouts(...args),
  createLayout: vi.fn().mockResolvedValue({}),
  activateLayout: vi.fn().mockResolvedValue({}),
  createZone: vi.fn().mockResolvedValue({}),
  updateZone: vi.fn().mockResolvedValue({}),
  deleteZone: vi.fn().mockResolvedValue({}),
  createFixture: vi.fn().mockResolvedValue({}),
  updateFixture: vi.fn().mockResolvedValue({}),
  deleteFixture: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../../../shared/components/layout/PageHeader", () => ({
  default: ({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
    </div>
  ),
}));

vi.mock("../../../../shared/components/ui", () => ({
  ErrorBanner: ({ message }: { message: string }) => (
    <div data-testid="error-banner">{message}</div>
  ),
  LoadingState: ({ text }: { text: string }) => (
    <div data-testid="loading-state">{text}</div>
  ),
}));

/* ── Helpers ── */

const zoneList: LayoutZone[] = [
  {
    id: "z1",
    layout_version_id: "lv1",
    name: "Produce",
    color: "#22C55E",
    cells: [{ row: 0, col: 0 }],
    is_freeform: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const fixtureList: LayoutFixture[] = [
  {
    id: "f1",
    layout_version_id: "lv1",
    name: "Entrance",
    fixture_type: "DOOR",
    cells: [{ row: 1, col: 1 }],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

function makeLayout(overrides: Partial<StoreLayout> = {}): StoreLayout {
  return {
    id: "lv1",
    store_id: "s1",
    version_number: 1,
    rows: 5,
    cols: 8,
    is_active: true,
    created_at: "2024-06-01T12:00:00Z",
    updated_at: "2024-06-01T12:00:00Z",
    zones: zoneList,
    fixtures: fixtureList,
    ...overrides,
  };
}

function setupStore() {
  mockUseStore.mockReturnValue({
    stores: [{ id: "s1", name: "Test Store", org_id: "o1", created_at: "" }],
    selectedStoreId: "s1",
    selectedStoreName: "Test Store",
    switchStore: vi.fn(),
    isLoading: false,
    error: null,
  });
}

/* ── Tests ── */

describe("StoreLayoutPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state while fetching layouts", () => {
    setupStore();
    mockListLayouts.mockReturnValue(new Promise(() => {})); // never resolves
    render(<StoreLayoutPage />);
    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("shows error banner when fetch fails", async () => {
    setupStore();
    mockListLayouts.mockRejectedValue(new Error("Network error"));
    render(<StoreLayoutPage />);
    expect(
      await screen.findByTestId("error-banner"),
    ).toBeInTheDocument();
  });

  it("shows empty-state create form when no layouts exist", async () => {
    setupStore();
    mockListLayouts.mockResolvedValue([]);
    render(<StoreLayoutPage />);
    expect(
      await screen.findByText("Create Store Layout"),
    ).toBeInTheDocument();
  });

  it("shows the grid editor when layouts exist", async () => {
    setupStore();
    mockListLayouts.mockResolvedValue([makeLayout()]);
    render(<StoreLayoutPage />);
    expect(await screen.findByText("Grid Editor")).toBeInTheDocument();
  });

  it("renders the page header with store name", async () => {
    setupStore();
    mockListLayouts.mockResolvedValue([makeLayout()]);
    render(<StoreLayoutPage />);
    expect(await screen.findByText("Store Layout")).toBeInTheDocument();
    expect(
      screen.getByText(/Test Store/),
    ).toBeInTheDocument();
  });

  it("renders the VersionSelector when layouts exist", async () => {
    setupStore();
    mockListLayouts.mockResolvedValue([makeLayout()]);
    render(<StoreLayoutPage />);
    expect(await screen.findByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Version 1")).toBeInTheDocument();
  });

  it("renders the ModeToolbar", async () => {
    setupStore();
    mockListLayouts.mockResolvedValue([makeLayout()]);
    render(<StoreLayoutPage />);
    expect(
      await screen.findByText(/Inventory Zone/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Wall \/ Fixture/)).toBeInTheDocument();
  });

  it("renders the LayoutObjectsPanel with zones and fixtures", async () => {
    setupStore();
    mockListLayouts.mockResolvedValue([makeLayout()]);
    render(<StoreLayoutPage />);
    // Wait for layouts to load — use ModeToolbar text as anchor
    await screen.findByText(/Inventory Zone/);
    expect(screen.getByText("Layout Objects")).toBeInTheDocument();
    // Zone and fixture names appear in both the grid AND the panel,
    // so use getAllByText to confirm they exist at least once.
    expect(screen.getAllByText("Produce").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Entrance").length).toBeGreaterThanOrEqual(1);
  });

  it("shows + New Version button when layouts exist", async () => {
    setupStore();
    mockListLayouts.mockResolvedValue([makeLayout()]);
    render(<StoreLayoutPage />);
    expect(
      await screen.findByText("+ New Version"),
    ).toBeInTheDocument();
  });

  it("toggles new version form when clicking + New Version", async () => {
    setupStore();
    mockListLayouts.mockResolvedValue([makeLayout()]);
    render(<StoreLayoutPage />);
    const user = userEvent.setup();
    const btn = await screen.findByText("+ New Version");
    await user.click(btn);
    expect(screen.getByText("New layout version")).toBeInTheDocument();
    // The CreateLayoutForm panel variant has a Cancel button
    const cancelButtons = screen.getAllByText("Cancel");
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);
  });
});
