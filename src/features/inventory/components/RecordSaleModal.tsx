import { useState } from "react";
import type { StoreInventoryItem } from "../../../shared/types";
import { recordSale } from "../api/inventoryApi";
import { useAsyncAction } from "../../../shared/hooks/useAsyncAction";
import { ErrorBanner } from "../../../shared/components/ui";
import "./RecordMovementModal.css";

interface RecordSaleModalProps {
  storeId: string;
  item: StoreInventoryItem;
  onSuccess: () => void;
  onClose: () => void;
}

export default function RecordSaleModal({
  storeId,
  item,
  onSuccess,
  onClose,
}: RecordSaleModalProps) {
  const defaultPrice = item.unit_price ? parseFloat(item.unit_price).toFixed(2) : "";
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState(defaultPrice);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const { execute, isLoading, error } = useAsyncAction(
    async () => {
      const qty = parseInt(quantity, 10);
      await recordSale(storeId, item.id, {
        quantity: qty,
        unit_price: unitPrice || undefined,
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
      <div className="movement-modal" onClick={(e) => e.stopPropagation()}>
        <div className="movement-modal__header">
          <span className="movement-modal__title">Record Sale</span>
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
              <label className="movement-modal__label">Quantity Sold</label>
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
                Unit Price ($)
                <span className="movement-modal__optional"> — auto-filled from default</span>
              </label>
              <input
                className="movement-modal__input"
                type="number"
                step="0.01"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
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
                placeholder="e.g. INV-2026-042"
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
                placeholder="e.g. Walk-in customer"
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
              className="movement-modal__btn movement-modal__btn--primary"
              disabled={!isValid() || isLoading}
            >
              {isLoading ? "Recording..." : "Record Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
