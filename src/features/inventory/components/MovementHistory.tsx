import { useCallback } from "react";
import { listMovements } from "../api/inventoryApi";
import type { InventoryMovement } from "../../../shared/types";
import { useApiData } from "../../../shared/hooks/useApiData";
import { usePagination } from "../../../shared/hooks/usePagination";
import { ErrorBanner, LoadingState, Pagination } from "../../../shared/components/ui";
import { formatDate } from "../../../shared/utils";
import "./MovementHistory.css";

interface MovementHistoryProps {
  storeId: string;
  inventoryId: string;
}

function formatCurrency(value: string | null): string {
  if (!value) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  return `$${num.toFixed(2)}/unit`;
}

export default function MovementHistory({
  storeId,
  inventoryId,
}: MovementHistoryProps) {
  const fetchMovements = useCallback(
    () => listMovements(storeId, inventoryId),
    [storeId, inventoryId],
  );

  const { data, isLoading, error } = useApiData<InventoryMovement[]>(fetchMovements);
  const movements = data ?? [];

  const {
    paginatedItems,
    page,
    pageSize,
    pageSizeOptions,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination(movements);

  if (isLoading) return <LoadingState text="Loading movement history..." />;
  if (error) return <ErrorBanner message={error} />;

  if (movements.length === 0) {
    return (
      <div className="movement-history__empty">
        No movement history yet. Record a receipt or sale to start tracking.
      </div>
    );
  }

  return (
    <div>
      <div className="movement-history__list">
        {paginatedItems.map((m) => {
          const isReceipt = m.movement_type === "receipt";
          const delta = isReceipt ? m.quantity : -m.quantity;
          return (
            <div key={m.id} className="movement-history__row">
              <div
                className={`movement-history__icon ${
                  isReceipt ? "movement-history__icon--receipt" : "movement-history__icon--sale"
                }`}
              >
                {isReceipt ? "+" : "−"}
              </div>
              <div className="movement-history__details">
                <div className="movement-history__type">
                  {isReceipt ? "Receipt" : "Sale"}
                </div>
                <div className="movement-history__meta">
                  {formatDate(m.created_at)}
                  {m.reference_number && ` · ${m.reference_number}`}
                  {m.notes && ` · ${m.notes}`}
                </div>
              </div>
              <div className="movement-history__right">
                <div
                  className={`movement-history__qty ${
                    delta > 0 ? "movement-history__qty--positive" : "movement-history__qty--negative"
                  }`}
                >
                  {delta > 0 ? "+" : ""}{delta}
                </div>
                {isReceipt && m.unit_cost && (
                  <div className="movement-history__price">
                    Cost: {formatCurrency(m.unit_cost)}
                  </div>
                )}
                {!isReceipt && m.unit_price && (
                  <div className="movement-history__price">
                    Price: {formatCurrency(m.unit_price)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          inline
        />
      )}
    </div>
  );
}
