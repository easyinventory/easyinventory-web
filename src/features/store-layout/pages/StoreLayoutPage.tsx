import { useCallback, useState } from "react";
import { useStore } from "../context/useStore";
import {
  listLayouts,
  createLayout,
  activateLayout,
  createZone,
  updateZone,
  deleteZone,
  createFixture,
  updateFixture,
  deleteFixture,
} from "../api/storeApi";
import type {
  StoreLayout,
  Cell,
  FixtureType,
} from "../../../shared/types";
import type { PlacementMode } from "../components/LayoutGrid";
import {
  CreateLayoutForm,
  EditBanner,
  FixtureDetailModal,
  FixtureNameModal,
  FreeformBar,
  LayoutGrid,
  LayoutObjectsPanel,
  ModeToolbar,
  VersionSelector,
  ZoneDetailModal,
  ZoneNameModal,
} from "../components";
import PageHeader from "../../../shared/components/layout/PageHeader";
import { ErrorBanner, LoadingState } from "../../../shared/components/ui";
import { useApiData, useAsyncAction } from "../../../shared/hooks";
import { isRectangle } from "../utils";
import "./StoreLayoutPage.css";

export default function StoreLayoutPage() {
  const { selectedStoreId, selectedStoreName } = useStore();
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);

  /* ── Layout data (zones & fixtures are eagerly loaded) ── */
  const fetchLayouts = useCallback(
    (): Promise<StoreLayout[]> =>
      selectedStoreId ? listLayouts(selectedStoreId) : Promise.resolve([]),
    [selectedStoreId],
  );
  const {
    data: layouts,
    isLoading,
    error,
    refetch: refetchLayouts,
  } = useApiData(fetchLayouts, [selectedStoreId]);

  const activeLayout =
    layouts?.find((l) => l.is_active) ?? layouts?.[0] ?? null;
  const hasLayouts = layouts && layouts.length > 0;

  /* Derive zones & fixtures directly from the active layout */
  const zoneList = activeLayout?.zones ?? [];
  const fixtureList = activeLayout?.fixtures ?? [];

  /* ── Layout CRUD actions ── */
  const createLayoutAction = useAsyncAction(
    async (rows: number, cols: number) => {
      await createLayout(selectedStoreId!, rows, cols);
      setShowNewVersionForm(false);
      refetchLayouts();
    },
    { successTimeout: 3000 },
  );

  const activateAction = useAsyncAction(
    async (layoutId: string) => {
      await activateLayout(selectedStoreId!, layoutId);
      refetchLayouts();
    },
    { successTimeout: 2000 },
  );

  /* ── Editor state ── */
  const [placementMode, setPlacementMode] = useState<PlacementMode>("none");
  const [freeformCells, setFreeformCells] = useState<Cell[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "zone" | "fixture" | null
  >(null);

  /* Edit-shape state */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"zone" | "fixture" | null>(
    null,
  );
  const [editingCells, setEditingCells] = useState<Cell[]>([]);

  /* Modal state */
  const [pendingCells, setPendingCells] = useState<Cell[] | null>(null);
  const [pendingIsFreeform, setPendingIsFreeform] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showFixtureModal, setShowFixtureModal] = useState(false);

  /* Detail modal targets */
  const selectedZone =
    selectedItemType === "zone"
      ? zoneList.find((z) => z.id === selectedItemId) ?? null
      : null;
  const selectedFixture =
    selectedItemType === "fixture"
      ? fixtureList.find((f) => f.id === selectedItemId) ?? null
      : null;
  const [showZoneDetail, setShowZoneDetail] = useState(false);
  const [showFixtureDetail, setShowFixtureDetail] = useState(false);

  /* Edit-shape name for banner */
  const editingName = (() => {
    if (!editingId) return "";
    if (editingType === "zone") {
      return zoneList.find((z) => z.id === editingId)?.name ?? "Zone";
    }
    return fixtureList.find((f) => f.id === editingId)?.name ?? "Fixture";
  })();

  /* ── Hint text ── */
  const hintText = (() => {
    if (editingId) return "Click cells to add or remove from shape";
    if (placementMode === "none") return "Click a zone or fixture to select";
    return "Click cells to paint, then press Done";
  })();

  /* ── Handlers ── */

  function handlePlacementModeChange(mode: PlacementMode) {
    setPlacementMode(mode);
    setFreeformCells([]);
    setSelectedItemId(null);
    setSelectedItemType(null);
    setShowZoneDetail(false);
    setShowFixtureDetail(false);
  }

  // Freeform "Done" → open creation modal
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

  // Item click in grid — highlight only
  function handleItemClick(type: "zone" | "fixture", id: string) {
    setSelectedItemId(id);
    setSelectedItemType(type);
  }

  // Item double-click in grid or panel click — open detail modal
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

  /* ── Zone CRUD actions ── */
  const createZoneAction = useAsyncAction(
    async (name: string, color: string, cells: Cell[], isFreeform: boolean) => {
      await createZone(selectedStoreId!, activeLayout!.id, {
        name,
        color,
        cells,
        is_freeform: isFreeform,
      });
      setShowZoneModal(false);
      setPendingCells(null);
      setFreeformCells([]);
      setPlacementMode("none");
      refetchLayouts();
    },
  );

  const updateZoneAction = useAsyncAction(
    async (zoneId: string, updates: { name?: string; color?: string }) => {
      await updateZone(selectedStoreId!, activeLayout!.id, zoneId, updates);
      setShowZoneDetail(false);
      refetchLayouts();
    },
  );

  const deleteZoneAction = useAsyncAction(async (zoneId: string) => {
    await deleteZone(selectedStoreId!, activeLayout!.id, zoneId);
    setShowZoneDetail(false);
    setSelectedItemId(null);
    setSelectedItemType(null);
    refetchLayouts();
  });

  /* ── Fixture CRUD actions ── */
  const createFixtureAction = useAsyncAction(
    async (name: string, fixtureType: FixtureType, cells: Cell[]) => {
      await createFixture(selectedStoreId!, activeLayout!.id, {
        name,
        fixture_type: fixtureType,
        cells,
      });
      setShowFixtureModal(false);
      setPendingCells(null);
      setFreeformCells([]);
      setPlacementMode("none");
      refetchLayouts();
    },
  );

  const updateFixtureAction = useAsyncAction(
    async (
      fixtureId: string,
      updates: { name?: string; fixture_type?: FixtureType },
    ) => {
      await updateFixture(
        selectedStoreId!,
        activeLayout!.id,
        fixtureId,
        updates,
      );
      setShowFixtureDetail(false);
      refetchLayouts();
    },
  );

  const deleteFixtureAction = useAsyncAction(async (fixtureId: string) => {
    await deleteFixture(selectedStoreId!, activeLayout!.id, fixtureId);
    setShowFixtureDetail(false);
    setSelectedItemId(null);
    setSelectedItemType(null);
    refetchLayouts();
  });

  /* ── Edit-shape handlers ── */

  function handleEnterEditShape(
    type: "zone" | "fixture",
    id: string,
  ) {
    const item =
      type === "zone"
        ? zoneList.find((z) => z.id === id)
        : fixtureList.find((f) => f.id === id);
    if (!item) return;
    setEditingId(id);
    setEditingType(type);
    setEditingCells([...item.cells]);
    setShowZoneDetail(false);
    setShowFixtureDetail(false);
    setPlacementMode("none");
  }

  const saveShapeAction = useAsyncAction(async () => {
    if (!editingId || !editingType) return;
    if (editingType === "zone") {
      await updateZone(selectedStoreId!, activeLayout!.id, editingId, {
        cells: editingCells,
      });
      refetchLayouts();
    } else {
      await updateFixture(selectedStoreId!, activeLayout!.id, editingId, {
        cells: editingCells,
      });
      refetchLayouts();
    }
    setEditingId(null);
    setEditingType(null);
    setEditingCells([]);
  });

  function handleCancelEditShape() {
    setEditingId(null);
    setEditingType(null);
    setEditingCells([]);
  }

  /* ── Cancel creation modals ── */
  function handleCancelZoneModal() {
    setShowZoneModal(false);
    setPendingCells(null);
  }

  function handleCancelFixtureModal() {
    setShowFixtureModal(false);
    setPendingCells(null);
  }

  /* ── Aggregate error ── */
  const actionError =
    createZoneAction.error ||
    updateZoneAction.error ||
    deleteZoneAction.error ||
    createFixtureAction.error ||
    updateFixtureAction.error ||
    deleteFixtureAction.error ||
    saveShapeAction.error;

  return (
    <div className="store-layout-page">
      <PageHeader
        title="Store Layout"
        subtitle={
          selectedStoreName
            ? `${selectedStoreName} · Design and manage your store zones and fixtures`
            : "Design and manage your store zones and fixtures"
        }
      >
        {hasLayouts && (
          <button
            className="store-layout-page__new-version-btn"
            onClick={() => setShowNewVersionForm((v) => !v)}
          >
            {showNewVersionForm ? "Cancel" : "+ New Version"}
          </button>
        )}
      </PageHeader>

      {isLoading && <LoadingState text="Loading layouts..." />}
      {error && <ErrorBanner message={error} />}
      {actionError && <ErrorBanner message={actionError} />}

      {!isLoading && !error && (
        <>
          {hasLayouts ? (
            <>
              <VersionSelector
                layouts={layouts}
                onActivate={(id) => void activateAction.execute(id)}
                isActivating={activateAction.isLoading}
              />
              {activateAction.error && (
                <ErrorBanner message={activateAction.error} />
              )}

              {showNewVersionForm && (
                <CreateLayoutForm
                  variant="panel"
                  onSubmit={(rows, cols) =>
                    void createLayoutAction.execute(rows, cols)
                  }
                  isLoading={createLayoutAction.isLoading}
                  error={createLayoutAction.error}
                  onCancel={() => setShowNewVersionForm(false)}
                />
              )}

              {activeLayout && (
                <>
                  <div className="store-layout-page__toolbar-area">
                    <ModeToolbar
                      placementMode={placementMode}
                      onPlacementModeChange={handlePlacementModeChange}
                      disabled={editingId !== null}
                    />

                    {editingId && (
                      <EditBanner
                        name={editingName}
                        cells={editingCells}
                        onSave={() => void saveShapeAction.execute()}
                        onCancel={handleCancelEditShape}
                        isSaving={saveShapeAction.isLoading}
                      />
                    )}

                    {placementMode !== "none" &&
                      !editingId && (
                        <FreeformBar
                          cells={freeformCells}
                          placementType={placementMode as "zone" | "fixture"}
                          onDone={handleFreeformDone}
                          onCancel={handleFreeformCancel}
                        />
                      )}
                  </div>

                  <div className="store-layout-page__editor-layout">
                    <div className="store-layout-page__grid-card">
                      <div className="store-layout-page__grid-card-header">
                        <span className="store-layout-page__grid-card-title">
                          Grid Editor
                        </span>
                        <span className="store-layout-page__grid-card-hint">
                          {hintText}
                        </span>
                      </div>
                      <div className="store-layout-page__grid-scroll">
                        <LayoutGrid
                          rows={activeLayout.rows}
                          cols={activeLayout.cols}
                          zones={zoneList}
                          fixtures={fixtureList}
                          placementMode={placementMode}
                          freeformCells={freeformCells}
                          onFreeformCellsChange={setFreeformCells}
                          editingId={editingId}
                          editingType={editingType}
                          editingCells={editingCells}
                          onEditingCellsChange={setEditingCells}
                          selectedItemId={selectedItemId}
                          onItemClick={handleItemClick}
                          onItemDoubleClick={handleItemOpen}
                        />
                      </div>
                    </div>
                    <LayoutObjectsPanel
                      zones={zoneList}
                      fixtures={fixtureList}
                      selectedItemId={selectedItemId}
                      onItemClick={handleItemOpen}
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <CreateLayoutForm
              variant="empty-state"
              onSubmit={(rows, cols) =>
                void createLayoutAction.execute(rows, cols)
              }
              isLoading={createLayoutAction.isLoading}
              error={createLayoutAction.error}
            />
          )}
        </>
      )}

      {/* ── Zone creation modal ── */}
      {showZoneModal && pendingCells && (
        <ZoneNameModal
          cells={pendingCells}
          isFreeform={pendingIsFreeform}
          onConfirm={(name, color, cells, isFreeform) =>
            void createZoneAction.execute(name, color, cells, isFreeform)
          }
          onCancel={handleCancelZoneModal}
        />
      )}

      {/* ── Fixture creation modal ── */}
      {showFixtureModal && pendingCells && (
        <FixtureNameModal
          cells={pendingCells}
          onConfirm={(name, fixtureType, cells) =>
            void createFixtureAction.execute(name, fixtureType, cells)
          }
          onCancel={handleCancelFixtureModal}
        />
      )}

      {/* ── Zone detail modal ── */}
      {showZoneDetail && selectedZone && (
        <ZoneDetailModal
          zone={selectedZone}
          onUpdate={(zoneId, updates) =>
            void updateZoneAction.execute(zoneId, updates)
          }
          onEditShape={(zoneId) => handleEnterEditShape("zone", zoneId)}
          onDelete={(zoneId) => void deleteZoneAction.execute(zoneId)}
          onClose={() => setShowZoneDetail(false)}
        />
      )}

      {/* ── Fixture detail modal ── */}
      {showFixtureDetail && selectedFixture && (
        <FixtureDetailModal
          fixture={selectedFixture}
          onUpdate={(fixtureId, updates) =>
            void updateFixtureAction.execute(fixtureId, updates)
          }
          onEditShape={(fixtureId) =>
            handleEnterEditShape("fixture", fixtureId)
          }
          onDelete={(fixtureId) =>
            void deleteFixtureAction.execute(fixtureId)
          }
          onClose={() => setShowFixtureDetail(false)}
        />
      )}
    </div>
  );
}