import { useCallback, useState } from "react";
import { useStore } from "../context/useStore";
import { listLayouts, createLayout, activateLayout } from "../api/storeApi";
import type { StoreLayout } from "../../../shared/types";
import {
  CreateLayoutForm,
  LayoutGrid,
  LayoutObjectsPanel,
  VersionSelector,
} from "../components";
import PageHeader from "../../../shared/components/layout/PageHeader";
import { ErrorBanner, LoadingState } from "../../../shared/components/ui";
import { useApiData, useAsyncAction } from "../../../shared/hooks";
import "./StoreLayoutPage.css";

export default function StoreLayoutPage() {
  const { selectedStoreId, selectedStoreName } = useStore();
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);

  const fetchLayouts = useCallback(
    (): Promise<StoreLayout[]> =>
      selectedStoreId ? listLayouts(selectedStoreId) : Promise.resolve([]),
    [selectedStoreId]
  );

  const {
    data: layouts,
    isLoading,
    error,
    refetch,
  } = useApiData(fetchLayouts, [selectedStoreId]);

  const createAction = useAsyncAction(
    async (rows: number, cols: number) => {
      await createLayout(selectedStoreId!, rows, cols);
      setShowNewVersionForm(false);
      refetch();
    },
    { successTimeout: 3000 }
  );

  const activateAction = useAsyncAction(
    async (layoutId: string) => {
      await activateLayout(selectedStoreId!, layoutId);
      refetch();
    },
    { successTimeout: 2000 }
  );

  const activeLayout =
    layouts?.find((l) => l.is_active) ?? layouts?.[0] ?? null;

  const hasLayouts = layouts && layouts.length > 0;

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
                    void createAction.execute(rows, cols)
                  }
                  isLoading={createAction.isLoading}
                  error={createAction.error}
                  onCancel={() => setShowNewVersionForm(false)}
                />
              )}

              {activeLayout && (
                <div className="store-layout-page__editor-layout">
                  <div className="store-layout-page__grid-card">
                    <div className="store-layout-page__grid-card-header">
                      <span className="store-layout-page__grid-card-title">
                        Grid Editor
                      </span>
                      <span className="store-layout-page__grid-card-hint">
                        Click to select
                      </span>
                    </div>
                    <LayoutGrid
                      rows={activeLayout.rows}
                      cols={activeLayout.cols}
                    />
                  </div>
                  <LayoutObjectsPanel />
                </div>
              )}
            </>
          ) : (
            <CreateLayoutForm
              variant="empty-state"
              onSubmit={(rows, cols) => void createAction.execute(rows, cols)}
              isLoading={createAction.isLoading}
              error={createAction.error}
            />
          )}
        </>
      )}
    </div>
  );
}