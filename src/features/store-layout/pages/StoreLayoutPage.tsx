import { useCallback } from "react";
import { useStore } from "../context/useStore";
import { listLayouts, createLayout, activateLayout } from "../api/storeApi";
import { CreateLayoutForm, LayoutGrid, VersionSelector } from "../components";
import PageHeader from "../../../shared/components/layout/PageHeader";
import { ErrorBanner, LoadingState } from "../../../shared/components/ui";
import { useApiData, useAsyncAction } from "../../../shared/hooks";
import "./StoreLayoutPage.css";

export default function StoreLayoutPage() {
  const { selectedStoreId } = useStore();

  const fetchLayouts = useCallback(
    () => listLayouts(selectedStoreId!),
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

  return (
    <div className="store-layout-page">
      <PageHeader
        title="Store Layout"
        subtitle="Design and manage your store floor plan grid"
      />

      {isLoading && <LoadingState text="Loading layouts..." />}
      {error && <ErrorBanner message={error} />}

      {!isLoading && !error && (
        <>
          {layouts && layouts.length > 0 ? (
            <>
              <VersionSelector
                layouts={layouts}
                onActivate={(id) => void activateAction.execute(id)}
                isActivating={activateAction.isLoading}
              />
              {activateAction.error && (
                <ErrorBanner message={activateAction.error} />
              )}
              {activeLayout && (
                <div className="store-layout-page__grid-wrapper">
                  <LayoutGrid
                    rows={activeLayout.rows}
                    cols={activeLayout.cols}
                  />
                  <p className="store-layout-page__grid-label">
                    {activeLayout.rows} rows × {activeLayout.cols} columns
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="store-layout-page__empty-hint">
              <p>No layouts yet. Create your first layout below.</p>
            </div>
          )}

          <CreateLayoutForm
            onSubmit={(rows, cols) => void createAction.execute(rows, cols)}
            isLoading={createAction.isLoading}
            error={createAction.error}
          />
        </>
      )}
    </div>
  );
}