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
import type { StoreLayout, Cell, FixtureType } from "../../../shared/types";
import { useLayoutEditor } from "../hooks";
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
import "./StoreLayoutPage.css";

export default function StoreLayoutPage() {
  const { selectedStoreId, selectedStoreName } = useStore();
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);

  /* ── Layout data ── */
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
  const zoneList = activeLayout?.zones ?? [];
  const fixtureList = activeLayout?.fixtures ?? [];

  /* ── Editor state (hook) ── */
  const editor = useLayoutEditor(zoneList, fixtureList);

  /* ── Layout version actions ── */
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

  /* ── Zone CRUD ── */
  const createZoneAction = useAsyncAction(
    async (name: string, color: string, cells: Cell[], isFreeform: boolean) => {
      await createZone(selectedStoreId!, activeLayout!.id, {
        name,
        color,
        cells,
        is_freeform: isFreeform,
      });
      editor.resetAfterCreate();
      refetchLayouts();
    },
  );

  const updateZoneAction = useAsyncAction(
    async (zoneId: string, updates: { name?: string; color?: string }) => {
      await updateZone(selectedStoreId!, activeLayout!.id, zoneId, updates);
      editor.closeDetailAfterUpdate("zone");
      refetchLayouts();
    },
  );

  const deleteZoneAction = useAsyncAction(async (zoneId: string) => {
    await deleteZone(selectedStoreId!, activeLayout!.id, zoneId);
    editor.resetAfterDelete();
    refetchLayouts();
  });

  /* ── Fixture CRUD ── */
  const createFixtureAction = useAsyncAction(
    async (name: string, fixtureType: FixtureType, cells: Cell[]) => {
      await createFixture(selectedStoreId!, activeLayout!.id, {
        name,
        fixture_type: fixtureType,
        cells,
      });
      editor.resetAfterCreate();
      refetchLayouts();
    },
  );

  const updateFixtureAction = useAsyncAction(
    async (
      fixtureId: string,
      updates: { name?: string; fixture_type?: FixtureType },
    ) => {
      await updateFixture(selectedStoreId!, activeLayout!.id, fixtureId, updates);
      editor.closeDetailAfterUpdate("fixture");
      refetchLayouts();
    },
  );

  const deleteFixtureAction = useAsyncAction(async (fixtureId: string) => {
    await deleteFixture(selectedStoreId!, activeLayout!.id, fixtureId);
    editor.resetAfterDelete();
    refetchLayouts();
  });

  /* ── Edit-shape save ── */
  const saveShapeAction = useAsyncAction(async () => {
    if (!editor.editingId || !editor.editingType) return;
    if (editor.editingType === "zone") {
      await updateZone(selectedStoreId!, activeLayout!.id, editor.editingId, {
        cells: editor.editingCells,
      });
    } else {
      await updateFixture(selectedStoreId!, activeLayout!.id, editor.editingId, {
        cells: editor.editingCells,
      });
    }
    editor.handleCancelEditShape();
    refetchLayouts();
  });

  /* ── Aggregate error ── */
  const actionError =
    createZoneAction.error ||
    updateZoneAction.error ||
    deleteZoneAction.error ||
    createFixtureAction.error ||
    updateFixtureAction.error ||
    deleteFixtureAction.error ||
    saveShapeAction.error;

  /* ── Render ── */
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
                      placementMode={editor.placementMode}
                      onPlacementModeChange={editor.handlePlacementModeChange}
                      disabled={editor.editingId !== null}
                    />

                    {editor.editingId && (
                      <EditBanner
                        name={editor.editingName}
                        cells={editor.editingCells}
                        onSave={() => void saveShapeAction.execute()}
                        onCancel={editor.handleCancelEditShape}
                        isSaving={saveShapeAction.isLoading}
                      />
                    )}

                    {editor.placementMode !== "none" && !editor.editingId && (
                      <FreeformBar
                        cells={editor.freeformCells}
                        placementType={editor.placementMode as "zone" | "fixture"}
                        onDone={editor.handleFreeformDone}
                        onCancel={editor.handleFreeformCancel}
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
                          {editor.hintText}
                        </span>
                      </div>
                      <div className="store-layout-page__grid-scroll">
                        <LayoutGrid
                          rows={activeLayout.rows}
                          cols={activeLayout.cols}
                          zones={zoneList}
                          fixtures={fixtureList}
                          placementMode={editor.placementMode}
                          freeformCells={editor.freeformCells}
                          onFreeformCellsChange={editor.setFreeformCells}
                          editingId={editor.editingId}
                          editingType={editor.editingType}
                          editingCells={editor.editingCells}
                          onEditingCellsChange={editor.setEditingCells}
                          editingColor={editor.editingColor}
                          editingLabel={editor.editingName}
                          selectedItemId={editor.selectedItemId}
                          onItemClick={editor.handleItemClick}
                          onItemDoubleClick={editor.handleItemOpen}
                        />
                      </div>
                    </div>
                    <LayoutObjectsPanel
                      zones={zoneList}
                      fixtures={fixtureList}
                      selectedItemId={editor.selectedItemId}
                      onItemClick={editor.handleItemClick}
                      onItemDoubleClick={editor.handleItemOpen}
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

      {/* ── Creation modals ── */}
      {editor.showZoneModal && editor.pendingCells && (
        <ZoneNameModal
          cells={editor.pendingCells}
          isFreeform={editor.pendingIsFreeform}
          onConfirm={(name, color, cells, isFreeform) =>
            void createZoneAction.execute(name, color, cells, isFreeform)
          }
          onCancel={editor.handleCancelCreationModal}
        />
      )}

      {editor.showFixtureModal && editor.pendingCells && (
        <FixtureNameModal
          cells={editor.pendingCells}
          onConfirm={(name, fixtureType, cells) =>
            void createFixtureAction.execute(name, fixtureType, cells)
          }
          onCancel={editor.handleCancelCreationModal}
        />
      )}

      {/* ── Detail modals ── */}
      {editor.showZoneDetail && editor.selectedZone && (
        <ZoneDetailModal
          zone={editor.selectedZone}
          onUpdate={(zoneId, updates) =>
            void updateZoneAction.execute(zoneId, updates)
          }
          onEditShape={(zoneId) => editor.handleEnterEditShape("zone", zoneId)}
          onDelete={(zoneId) => void deleteZoneAction.execute(zoneId)}
          onClose={editor.closeZoneDetail}
        />
      )}

      {editor.showFixtureDetail && editor.selectedFixture && (
        <FixtureDetailModal
          fixture={editor.selectedFixture}
          onUpdate={(fixtureId, updates) =>
            void updateFixtureAction.execute(fixtureId, updates)
          }
          onEditShape={(fixtureId) =>
            editor.handleEnterEditShape("fixture", fixtureId)
          }
          onDelete={(fixtureId) =>
            void deleteFixtureAction.execute(fixtureId)
          }
          onClose={editor.closeFixtureDetail}
        />
      )}
    </div>
  );
}
