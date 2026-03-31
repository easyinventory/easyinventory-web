import { renderHook, act } from "@testing-library/react";
import { useLayoutEditor } from "../useLayoutEditor";
import type { LayoutZone, LayoutFixture } from "../../../../shared/types";

/* ── Test fixtures ── */

function makeZone(overrides: Partial<LayoutZone> = {}): LayoutZone {
  return {
    id: "zone-1",
    layout_version_id: "lv-1",
    name: "Electronics",
    color: "#3B82F6",
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    is_freeform: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeFixture(overrides: Partial<LayoutFixture> = {}): LayoutFixture {
  return {
    id: "fix-1",
    layout_version_id: "lv-1",
    name: "Main Entrance",
    fixture_type: "DOOR",
    cells: [{ row: 5, col: 5 }],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const emptyZones: LayoutZone[] = [];
const emptyFixtures: LayoutFixture[] = [];

describe("useLayoutEditor", () => {
  describe("initial state", () => {
    it("starts with no placement mode active", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );
      expect(result.current.placementMode).toBe("none");
      expect(result.current.freeformCells).toEqual([]);
    });

    it("starts with no selection", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );
      expect(result.current.selectedItemId).toBeNull();
      expect(result.current.selectedZone).toBeNull();
      expect(result.current.selectedFixture).toBeNull();
    });

    it("starts with no editing state", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );
      expect(result.current.editingId).toBeNull();
      expect(result.current.editingType).toBeNull();
      expect(result.current.editingCells).toEqual([]);
      expect(result.current.editingName).toBe("");
      expect(result.current.editingColor).toBeUndefined();
    });

    it("starts with all modals closed", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );
      expect(result.current.showZoneModal).toBe(false);
      expect(result.current.showFixtureModal).toBe(false);
      expect(result.current.showZoneDetail).toBe(false);
      expect(result.current.showFixtureDetail).toBe(false);
      expect(result.current.pendingCells).toBeNull();
    });

    it("shows default hint text", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );
      expect(result.current.hintText).toBe(
        "Click a zone or fixture to select",
      );
    });
  });

  describe("placement mode", () => {
    it("changes to zone placement mode", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      act(() => result.current.handlePlacementModeChange("zone"));
      expect(result.current.placementMode).toBe("zone");
      expect(result.current.hintText).toBe(
        "Click cells to paint, then press Done",
      );
    });

    it("changes to fixture placement mode", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      act(() => result.current.handlePlacementModeChange("fixture"));
      expect(result.current.placementMode).toBe("fixture");
    });

    it("clears selection when entering placement mode", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      // Select a zone first
      act(() => result.current.handleItemClick("zone", "zone-1"));
      expect(result.current.selectedItemId).toBe("zone-1");

      // Enter placement mode
      act(() => result.current.handlePlacementModeChange("zone"));
      expect(result.current.selectedItemId).toBeNull();
    });

    it("clears freeform cells when switching placement mode", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      // Enter zone mode and paint some cells
      act(() => result.current.handlePlacementModeChange("zone"));
      act(() =>
        result.current.setFreeformCells([
          { row: 0, col: 0 },
          { row: 0, col: 1 },
        ]),
      );
      expect(result.current.freeformCells).toHaveLength(2);

      // Switch to fixture mode
      act(() => result.current.handlePlacementModeChange("fixture"));
      expect(result.current.freeformCells).toEqual([]);
    });
  });

  describe("freeform done / cancel", () => {
    it("does nothing when freeform cells are empty", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      act(() => result.current.handlePlacementModeChange("zone"));
      act(() => result.current.handleFreeformDone());

      expect(result.current.showZoneModal).toBe(false);
      expect(result.current.pendingCells).toBeNull();
    });

    it("opens zone creation modal for zone placement", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      // Enter zone placement and paint cells (a rectangle: should be non-freeform)
      act(() => result.current.handlePlacementModeChange("zone"));
      act(() =>
        result.current.setFreeformCells([
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 1, col: 0 },
          { row: 1, col: 1 },
        ]),
      );
      act(() => result.current.handleFreeformDone());

      expect(result.current.showZoneModal).toBe(true);
      expect(result.current.pendingCells).toHaveLength(4);
      expect(result.current.pendingIsFreeform).toBe(false);
    });

    it("opens fixture creation modal for fixture placement", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      act(() => result.current.handlePlacementModeChange("fixture"));
      act(() =>
        result.current.setFreeformCells([{ row: 0, col: 0 }]),
      );
      act(() => result.current.handleFreeformDone());

      expect(result.current.showFixtureModal).toBe(true);
      expect(result.current.pendingCells).toHaveLength(1);
    });

    it("detects freeform (non-rectangular) shapes", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      // L-shaped selection
      act(() => result.current.handlePlacementModeChange("zone"));
      act(() =>
        result.current.setFreeformCells([
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 1, col: 0 },
        ]),
      );
      act(() => result.current.handleFreeformDone());

      expect(result.current.pendingIsFreeform).toBe(true);
    });

    it("cancels freeform painting and resets placement mode", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      act(() => result.current.handlePlacementModeChange("zone"));
      act(() =>
        result.current.setFreeformCells([{ row: 0, col: 0 }]),
      );
      act(() => result.current.handleFreeformCancel());

      expect(result.current.freeformCells).toEqual([]);
      expect(result.current.placementMode).toBe("none");
    });
  });

  describe("selection", () => {
    it("selects a zone by click", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      act(() => result.current.handleItemClick("zone", "zone-1"));
      expect(result.current.selectedItemId).toBe("zone-1");
      expect(result.current.selectedZone).toEqual(zones[0]);
      expect(result.current.selectedFixture).toBeNull();
    });

    it("selects a fixture by click", () => {
      const fixtures = [makeFixture()];
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, fixtures),
      );

      act(() => result.current.handleItemClick("fixture", "fix-1"));
      expect(result.current.selectedItemId).toBe("fix-1");
      expect(result.current.selectedFixture).toEqual(fixtures[0]);
      expect(result.current.selectedZone).toBeNull();
    });

    it("returns null for non-existent item", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      act(() => result.current.handleItemClick("zone", "non-existent"));
      expect(result.current.selectedZone).toBeNull();
    });
  });

  describe("item open (double-click)", () => {
    it("opens zone detail modal", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      act(() => result.current.handleItemOpen("zone", "zone-1"));
      expect(result.current.showZoneDetail).toBe(true);
      expect(result.current.showFixtureDetail).toBe(false);
      expect(result.current.selectedItemId).toBe("zone-1");
    });

    it("opens fixture detail modal", () => {
      const fixtures = [makeFixture()];
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, fixtures),
      );

      act(() => result.current.handleItemOpen("fixture", "fix-1"));
      expect(result.current.showFixtureDetail).toBe(true);
      expect(result.current.showZoneDetail).toBe(false);
      expect(result.current.selectedItemId).toBe("fix-1");
    });

    it("closes zone detail when opening fixture detail", () => {
      const zones = [makeZone()];
      const fixtures = [makeFixture()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, fixtures),
      );

      act(() => result.current.handleItemOpen("zone", "zone-1"));
      expect(result.current.showZoneDetail).toBe(true);

      act(() => result.current.handleItemOpen("fixture", "fix-1"));
      expect(result.current.showZoneDetail).toBe(false);
      expect(result.current.showFixtureDetail).toBe(true);
    });
  });

  describe("edit shape", () => {
    it("enters edit shape mode for a zone", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      act(() => result.current.handleEnterEditShape("zone", "zone-1"));
      expect(result.current.editingId).toBe("zone-1");
      expect(result.current.editingType).toBe("zone");
      expect(result.current.editingCells).toEqual(zones[0].cells);
      expect(result.current.editingName).toBe("Electronics");
      expect(result.current.editingColor).toBeDefined();
      expect(result.current.hintText).toBe(
        "Click cells to add or remove from shape",
      );
    });

    it("enters edit shape mode for a fixture", () => {
      const fixtures = [makeFixture()];
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, fixtures),
      );

      act(() => result.current.handleEnterEditShape("fixture", "fix-1"));
      expect(result.current.editingId).toBe("fix-1");
      expect(result.current.editingType).toBe("fixture");
      expect(result.current.editingCells).toEqual(fixtures[0].cells);
      expect(result.current.editingName).toBe("Main Entrance");
    });

    it("closes all detail modals when entering edit shape", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      // Open detail first
      act(() => result.current.handleItemOpen("zone", "zone-1"));
      expect(result.current.showZoneDetail).toBe(true);

      // Enter edit shape
      act(() => result.current.handleEnterEditShape("zone", "zone-1"));
      expect(result.current.showZoneDetail).toBe(false);
    });

    it("resets placement mode when entering edit shape", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      act(() => result.current.handlePlacementModeChange("zone"));
      act(() => result.current.handleEnterEditShape("zone", "zone-1"));
      expect(result.current.placementMode).toBe("none");
    });

    it("does nothing for a non-existent item", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      act(() =>
        result.current.handleEnterEditShape("zone", "non-existent"),
      );
      expect(result.current.editingId).toBeNull();
    });

    it("cancels edit shape mode", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      act(() => result.current.handleEnterEditShape("zone", "zone-1"));
      act(() => result.current.handleCancelEditShape());
      expect(result.current.editingId).toBeNull();
      expect(result.current.editingType).toBeNull();
      expect(result.current.editingCells).toEqual([]);
    });

    it("provides editing color for zones", () => {
      const zones = [makeZone({ color: "#3B82F6" })];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      act(() => result.current.handleEnterEditShape("zone", "zone-1"));
      expect(result.current.editingColor).toEqual({
        bg: "#DBEAFE",
        hex: "#3B82F6",
      });
    });

    it("provides editing color for fixtures", () => {
      const fixtures = [makeFixture({ fixture_type: "DOOR" })];
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, fixtures),
      );

      act(() =>
        result.current.handleEnterEditShape("fixture", "fix-1"),
      );
      expect(result.current.editingColor).toEqual({
        bg: "#dcfce7",
        hex: "#16a34a",
      });
    });
  });

  describe("creation modal cancel", () => {
    it("closes creation modals and clears pending cells", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      // Trigger zone modal open
      act(() => result.current.handlePlacementModeChange("zone"));
      act(() =>
        result.current.setFreeformCells([{ row: 0, col: 0 }]),
      );
      act(() => result.current.handleFreeformDone());
      expect(result.current.showZoneModal).toBe(true);

      // Cancel
      act(() => result.current.handleCancelCreationModal());
      expect(result.current.showZoneModal).toBe(false);
      expect(result.current.showFixtureModal).toBe(false);
      expect(result.current.pendingCells).toBeNull();
    });
  });

  describe("reset helpers", () => {
    it("resetAfterCreate closes modals and resets placement state", () => {
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, emptyFixtures),
      );

      // Set up state as if creation is in progress
      act(() => result.current.handlePlacementModeChange("zone"));
      act(() =>
        result.current.setFreeformCells([{ row: 0, col: 0 }]),
      );
      act(() => result.current.handleFreeformDone());

      // Reset
      act(() => result.current.resetAfterCreate());
      expect(result.current.showZoneModal).toBe(false);
      expect(result.current.showFixtureModal).toBe(false);
      expect(result.current.pendingCells).toBeNull();
      expect(result.current.freeformCells).toEqual([]);
      expect(result.current.placementMode).toBe("none");
    });

    it("resetAfterDelete closes details and clears selection", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      // Open detail
      act(() => result.current.handleItemOpen("zone", "zone-1"));

      // Reset
      act(() => result.current.resetAfterDelete());
      expect(result.current.showZoneDetail).toBe(false);
      expect(result.current.selectedItemId).toBeNull();
    });

    it("closeDetailAfterUpdate closes zone detail", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      act(() => result.current.handleItemOpen("zone", "zone-1"));
      expect(result.current.showZoneDetail).toBe(true);

      act(() => result.current.closeDetailAfterUpdate("zone"));
      expect(result.current.showZoneDetail).toBe(false);
    });

    it("closeDetailAfterUpdate closes fixture detail", () => {
      const fixtures = [makeFixture()];
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, fixtures),
      );

      act(() => result.current.handleItemOpen("fixture", "fix-1"));
      expect(result.current.showFixtureDetail).toBe(true);

      act(() => result.current.closeDetailAfterUpdate("fixture"));
      expect(result.current.showFixtureDetail).toBe(false);
    });
  });

  describe("close detail helpers", () => {
    it("closeZoneDetail closes zone modal", () => {
      const zones = [makeZone()];
      const { result } = renderHook(() =>
        useLayoutEditor(zones, emptyFixtures),
      );

      act(() => result.current.handleItemOpen("zone", "zone-1"));
      act(() => result.current.closeZoneDetail());
      expect(result.current.showZoneDetail).toBe(false);
    });

    it("closeFixtureDetail closes fixture modal", () => {
      const fixtures = [makeFixture()];
      const { result } = renderHook(() =>
        useLayoutEditor(emptyZones, fixtures),
      );

      act(() => result.current.handleItemOpen("fixture", "fix-1"));
      act(() => result.current.closeFixtureDetail());
      expect(result.current.showFixtureDetail).toBe(false);
    });
  });
});
