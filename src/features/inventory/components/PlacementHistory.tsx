import { useCallback } from "react";
import { listPlacements } from "../api/inventoryApi";
import type { InventoryPlacement } from "../../../shared/types";
import { useApiData } from "../../../shared/hooks/useApiData";
import { ErrorBanner, LoadingState } from "../../../shared/components/ui";
import { formatDate } from "../../../shared/utils";
import "./PlacementHistory.css";

interface PlacementHistoryProps {
  storeId: string;
  inventoryId: string;
}

export default function PlacementHistory({
  storeId,
  inventoryId,
}: PlacementHistoryProps) {
  const fetchPlacements = useCallback(
    () => listPlacements(storeId, inventoryId),
    [storeId, inventoryId],
  );

  const { data, isLoading, error } = useApiData<InventoryPlacement[]>(fetchPlacements);
  const placements = data ?? [];

  if (isLoading) return <LoadingState text="Loading placement history..." />;
  if (error) return <ErrorBanner message={error} />;

  if (placements.length === 0) {
    return (
      <div className="placement-history__empty">
        No placement history. Assign this product to a zone to start tracking.
      </div>
    );
  }

  return (
    <div className="placement-history__list">
      {placements.map((pl) => {
        const isCurrent = !pl.ended_at;
        return (
          <div key={pl.id} className="placement-history__row">
            <div
              className={`placement-history__icon ${
                isCurrent ? "placement-history__icon--current" : ""
              }`}
            >
              {isCurrent ? "◉" : "○"}
            </div>
            <div className="placement-history__details">
              <div className="placement-history__zone">
                {pl.zone_name}
                {isCurrent && (
                  <span className="placement-history__current-badge">
                    Current
                  </span>
                )}
              </div>
              <div className="placement-history__meta">
                {formatDate(pl.started_at)} → {pl.ended_at ? formatDate(pl.ended_at) : "Present"}
              </div>
            </div>
            <div className="placement-history__duration">
              {pl.duration_display || "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
