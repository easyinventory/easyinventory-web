import { useCallback, useEffect, useState } from "react";
import type { StoreInventoryItem } from "../../../shared/types";
import { recordReceipt } from "../api/inventoryApi";
import { useAsyncAction } from "../../../shared/hooks/useAsyncAction";
import { ErrorBanner } from "../../../shared/components/ui";
import "./RecordMovementModal.css";

interface RecordReceiptModalProps {
  storeId: string;
  item: StoreInventoryItem;
  onSuccess: () => void;
  onClose: () => void;
}

export default function RecordReceiptModal({
  storeId,
  item,
  onSuccess,
  onClose,
}: RecordReceiptModalProps) {
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  /* ── Close on Escape key ── */
  const stableOnClose = useCallback(() => onClose(), [onClose]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") stableOnClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stableOnClose]);

  const { execute, isLoading, error } = useAsyncAction(
    async () => {
      const qty = parseInt(quantity, 10);
      await recordReceipt(storeId, item.id, {
        quantity: qty,
        unit_cost: unitCost || undefined,
        reference_number: referenceNumber || undefined,
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    },
  );

  const isValid = () => {
    const qty = parseInt(quantity, 10);
    return !isNaN(qty) && qty > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    execute().catch(() => {});
  };

  return (
    <div className="movement-modal__overlay" onClick={onClose}>
      <div
        className="movement-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-receipt-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="movement-modal__header">
          <span id="record-receipt-modal-title" className="movement-modal__title">Record Receipt</span>
          <button
            className="movement-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="movement-modal__body">
            {error && <ErrorBanner message={error} />}

            <div className="movement-modal__context">
              <div className="movement-modal__context-name">
                {item.product.name}
              </div>
              <div className="movement-modal__context-meta">
                Current qty: {item.quantity} | SKU: {item.product.sku || "—"}
              </div>
            </div>

            <div className="movement-modal__field">
              <label className="movement-modal__label">Quantity Received</label>
              <input
                className="movement-modal__input"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity..."
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="movement-modal__field">
              <label className="movement-modal__label">
                Unit Cost ($)
                <span className="movement-modal__optional"> — price paid per unit</span>
              </label>
              <input
                className="movement-modal__input"
                type="number"
                step="0.01"
                min={0}
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>

            <div className="movement-modal__field">
              <label className="movement-modal__label">
                Reference Number
                <span className="movement-modal__optional"> — optional</span>
              </label>
              <input
                className="movement-modal__input"
                type="text"
                maxLength={100}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. PO-2026-001"
                disabled={isLoading}
              />
            </div>

            <div className="movement-modal__field">
              <label className="movement-modal__label">
                Notes
                <span className="movement-modal__optional"> — optional</span>
              </label>
              <input
                className="movement-modal__input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Weekly shipment from supplier"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="movement-modal__footer">
            <button
              type="button"
              className="movement-modal__btn movement-modal__btn--secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="movement-modal__btn movement-modal__btn--success"
              disabled={!isValid() || isLoading}
            >
              {isLoading ? "Recording..." : "+ Record Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
