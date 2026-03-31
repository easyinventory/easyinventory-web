import { useState, useMemo } from "react";
import type { Cell, LayoutZone, LayoutFixture } from "../../../shared/types";
import type { PlacementMode } from "../components/LayoutGrid";
import { findZoneColor, findFixtureType } from "../constants";
import { isRectangle } from "../utils";

/* ── Public interface ── */

export interface LayoutEditorState {
  /* Placement mode */
  placementMode: PlacementMode;
  freeformCells: Cell[];
  setFreeformCells: (cells: Cell[]) => void;
  handlePlacementModeChange: (mode: PlacementMode) => void;
  handleFreeformDone: () => void;
  handleFreeformCancel: () => void;

  /* Selection */
  selectedItemId: string | null;
  selectedZone: LayoutZone | null;
  selectedFixture: LayoutFixture | null;
  handleItemClick: (type: "zone" | "fixture", id: string) => void;
  handleItemOpen: (type: "zone" | "fixture", id: string) => void;

  /* Edit shape */
  editingId: string | null;
  editingType: "zone" | "fixture" | null;
  editingCells: Cell[];
  setEditingCells: (cells: Cell[]) => void;
  editingName: string;
  editingColor: { bg: string; hex: string } | undefined;
  handleEnterEditShape: (type: "zone" | "fixture", id: string) => void;
  handleCancelEditShape: () => void;

  /* Creation modals */
  showZoneModal: boolean;
  showFixtureModal: boolean;
  pendingCells: Cell[] | null;
  pendingIsFreeform: boolean;
  handleCancelCreationModal: () => void;

  /* Detail modals */
  showZoneDetail: boolean;
  showFixtureDetail: boolean;
  closeZoneDetail: () => void;
  closeFixtureDetail: () => void;

  /* Hint text */
  hintText: string;

  /* Reset helpers (called after CRUD success) */
  resetAfterCreate: () => void;
  resetAfterDelete: () => void;
  closeDetailAfterUpdate: (type: "zone" | "fixture") => void;
}

export function useLayoutEditor(
  zoneList: LayoutZone[],
  fixtureList: LayoutFixture[],
): LayoutEditorState {
  /* ── Placement state ── */
  const [placementMode, setPlacementMode] = useState<PlacementMode>("none");
  const [freeformCells, setFreeformCells] = useState<Cell[]>([]);

  /* ── Selection state ── */
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "zone" | "fixture" | null
  >(null);

  /* ── Edit-shape state ── */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"zone" | "fixture" | null>(
    null,
  );
  const [editingCells, setEditingCells] = useState<Cell[]>([]);

  /* ── Modal state ── */
  const [pendingCells, setPendingCells] = useState<Cell[] | null>(null);
  const [pendingIsFreeform, setPendingIsFreeform] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showFixtureModal, setShowFixtureModal] = useState(false);
  const [showZoneDetail, setShowZoneDetail] = useState(false);
  const [showFixtureDetail, setShowFixtureDetail] = useState(false);

  /* ── Derived values ── */

  const selectedZone = useMemo(
    () =>
      selectedItemType === "zone"
        ? zoneList.find((z) => z.id === selectedItemId) ?? null
        : null,
    [selectedItemType, selectedItemId, zoneList],
  );

  const selectedFixture = useMemo(
    () =>
      selectedItemType === "fixture"
        ? fixtureList.find((f) => f.id === selectedItemId) ?? null
        : null,
    [selectedItemType, selectedItemId, fixtureList],
  );

  const editingItem = useMemo(() => {
    if (!editingId) return null;
    if (editingType === "zone") {
      return zoneList.find((z) => z.id === editingId) ?? null;
    }
    return fixtureList.find((f) => f.id === editingId) ?? null;
  }, [editingId, editingType, zoneList, fixtureList]);

  const editingName = useMemo(() => {
    if (!editingItem) return "";
    return editingItem.name;
  }, [editingItem]);

  const editingColor = useMemo(() => {
    if (!editingItem || !editingType) return undefined;
    if (editingType === "zone") {
      const z = editingItem as LayoutZone;
      const cd = findZoneColor(z.color);
      return { bg: cd.bg, hex: cd.hex };
    }
    const f = editingItem as LayoutFixture;
    const fd = findFixtureType(f.fixture_type);
    return { bg: fd.bg, hex: fd.hex };
  }, [editingItem, editingType]);

  const hintText = useMemo(() => {
    if (editingId) return "Click cells to add or remove from shape";
    if (placementMode === "none") return "Click a zone or fixture to select";
    return "Click cells to paint, then press Done";
  }, [editingId, placementMode]);

  /* ── Internal helpers ── */

  function clearSelection() {
    setSelectedItemId(null);
    setSelectedItemType(null);
  }

  function closeAllDetails() {
    setShowZoneDetail(false);
    setShowFixtureDetail(false);
  }

  function clearEditShape() {
    setEditingId(null);
    setEditingType(null);
    setEditingCells([]);
  }

  /* ── Handlers ── */

  function handlePlacementModeChange(mode: PlacementMode) {
    setPlacementMode(mode);
    setFreeformCells([]);
    clearSelection();
    closeAllDetails();
  }

  function handleFreeformDone() {
    if (freeformCells.length === 0) return;
    setPendingCells(freeformCells);
    setPendingIsFreeform(!isRectangle(freeformCells));
    if (placementMode === "zone") {
      setShowZoneModal(true);
    } else if (placementMode === "fixture") {
      setShowFixtureModal(true);
    }
  }

  function handleFreeformCancel() {
    setFreeformCells([]);
    setPlacementMode("none");
  }

  function handleItemClick(type: "zone" | "fixture", id: string) {
    setSelectedItemId(id);
    setSelectedItemType(type);
  }

  function handleItemOpen(type: "zone" | "fixture", id: string) {
    setSelectedItemId(id);
    setSelectedItemType(type);
    if (type === "zone") {
      setShowZoneDetail(true);
      setShowFixtureDetail(false);
    } else {
      setShowFixtureDetail(true);
      setShowZoneDetail(false);
    }
  }

  function handleEnterEditShape(type: "zone" | "fixture", id: string) {
    const item =
      type === "zone"
        ? zoneList.find((z) => z.id === id)
        : fixtureList.find((f) => f.id === id);
    if (!item) return;
    setEditingId(id);
    setEditingType(type);
    setEditingCells([...item.cells]);
    closeAllDetails();
    setPlacementMode("none");
  }

  function handleCancelEditShape() {
    clearEditShape();
  }

  function handleCancelCreationModal() {
    setShowZoneModal(false);
    setShowFixtureModal(false);
    setPendingCells(null);
  }

  /* ── Reset helpers for CRUD callbacks ── */

  /** Called after a successful create (zone or fixture) */
  function resetAfterCreate() {
    setShowZoneModal(false);
    setShowFixtureModal(false);
    setPendingCells(null);
    setFreeformCells([]);
    setPlacementMode("none");
  }

  /** Called after a successful delete (zone or fixture) */
  function resetAfterDelete() {
    closeAllDetails();
    clearSelection();
  }

  /** Called after a successful update to close the detail modal */
  function closeDetailAfterUpdate(type: "zone" | "fixture") {
    if (type === "zone") setShowZoneDetail(false);
    else setShowFixtureDetail(false);
  }

  return {
    placementMode,
    freeformCells,
    setFreeformCells,
    handlePlacementModeChange,
    handleFreeformDone,
    handleFreeformCancel,

    selectedItemId,
    selectedZone,
    selectedFixture,
    handleItemClick,
    handleItemOpen,

    editingId,
    editingType,
    editingCells,
    setEditingCells,
    editingName,
    editingColor,
    handleEnterEditShape,
    handleCancelEditShape,

    showZoneModal,
    showFixtureModal,
    pendingCells,
    pendingIsFreeform,
    handleCancelCreationModal,

    showZoneDetail,
    showFixtureDetail,
    closeZoneDetail: () => setShowZoneDetail(false),
    closeFixtureDetail: () => setShowFixtureDetail(false),

    hintText,

    resetAfterCreate,
    resetAfterDelete,
    closeDetailAfterUpdate,
  };
}
