import { useEffect, useMemo, useRef, useState } from "react";
import type { Supplier } from "../../types";
import type { ProductSupplierLink } from "../../types";
import { ErrorBanner } from "../ui";
import "./AddSupplierModal.css";

interface AddSupplierModalProps {
  suppliers: Supplier[];
  linkedSuppliers: ProductSupplierLink[];
  isAdding: boolean;
  addError: string | null;
  onAdd: (supplierId: string) => void;
  onClose: () => void;
}

export default function AddSupplierModal({
  suppliers,
  linkedSuppliers,
  isAdding,
  addError,
  onAdd,
  onClose,
}: AddSupplierModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const linkedIds = useMemo(
    () => new Set(linkedSuppliers.map((ls) => ls.supplier_id)),
    [linkedSuppliers]
  );

  const available = useMemo(
    () => suppliers.filter((s) => !linkedIds.has(s.id)),
    [suppliers, linkedIds]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter((s) =>
      [s.name, s.contact_name, s.contact_email]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [query, available]);

  return (
    <div className="add-supplier-modal__overlay" onClick={onClose}>
      <div
        className="add-supplier-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-supplier-modal__header">
          <span className="add-supplier-modal__title">Add supplier</span>
          <button
            className="add-supplier-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="add-supplier-modal__search">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search suppliers..."
            className="add-supplier-modal__input"
            disabled={isAdding}
          />
        </div>

        {addError && <ErrorBanner message={addError} />}

        <div className="add-supplier-modal__list">
          {available.length === 0 ? (
            <div className="add-supplier-modal__empty">
              All suppliers are already linked to this product.
            </div>
          ) : filtered.length === 0 ? (
            <div className="add-supplier-modal__empty">
              No matching suppliers
            </div>
          ) : (
            filtered.map((supplier) => (
              <button
                key={supplier.id}
                className="add-supplier-modal__item"
                disabled={isAdding}
                onClick={() => onAdd(supplier.id)}
              >
                <span className="add-supplier-modal__item-name">
                  {supplier.name}
                </span>
                {supplier.contact_email && (
                  <span className="add-supplier-modal__item-meta">
                    {supplier.contact_email}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
