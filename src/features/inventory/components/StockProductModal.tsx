import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../../../shared/types";
import type { LayoutZone } from "../../../shared/types";
import { stockProduct, assignZone } from "../api/inventoryApi";
import { useAsyncAction } from "../../../shared/hooks/useAsyncAction";
import { ErrorBanner } from "../../../shared/components/ui";
import "./StockProductModal.css";

interface StockProductModalProps {
  storeId: string;
  /** All org products — modal filters out already-stocked ones */
  allProducts: Product[];
  /** IDs of products already in this store's inventory */
  stockedProductIds: Set<string>;
  /** Available zones from the store's active layout */
  availableZones: LayoutZone[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function StockProductModal({
  storeId,
  allProducts,
  stockedProductIds,
  availableZones,
  onSuccess,
  onClose,
}: StockProductModalProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");
  const [threshold, setThreshold] = useState("");
  const [zoneId, setZoneId] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── Close on Escape key ── */
  const stableOnClose = useCallback(() => onClose(), [onClose]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") stableOnClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stableOnClose]);

  /* ── Available (unstocked) products ── */
  const available = useMemo(
    () => allProducts.filter((p) => !stockedProductIds.has(p.id)),
    [allProducts, stockedProductIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter((p) =>
      [p.name, p.sku]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [query, available]);

  const selectedProduct = useMemo(
    () => available.find((p) => p.id === selectedId) ?? null,
    [available, selectedId],
  );

  const handleSelect = (product: Product) => {
    setSelectedId(product.id);
    setQuery(product.name + (product.sku ? ` (${product.sku})` : ""));
    setDropdownOpen(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedId("");
    setDropdownOpen(true);
  };

  /* ── Submit ── */
  const { execute, isLoading, error } = useAsyncAction(
    async () => {
      const entry = await stockProduct(storeId, {
        product_id: selectedId,
        quantity: 0,
        unit_price: unitPrice ? unitPrice : undefined,
        low_stock_threshold: threshold ? Number(threshold) : undefined,
      });

      // If a zone was selected, assign immediately
      if (zoneId) {
        await assignZone(storeId, entry.id, { active_zone_id: zoneId });
      }

      onSuccess();
      onClose();
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    execute().catch(() => {});
  };

  return (
    <div className="stock-modal__overlay" onClick={onClose}>
      <div
        className="stock-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-product-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="stock-modal__header">
          <span id="stock-product-modal-title" className="stock-modal__title">Stock a Product</span>
          <button
            className="stock-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="stock-modal__body">
            {error && <ErrorBanner message={error} />}

            {/* ── Searchable product dropdown ── */}
            <div className="stock-modal__field" ref={dropdownRef}>
              <label className="stock-modal__label">Select Product</label>
              <input
                ref={inputRef}
                className="stock-modal__input"
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search by name or SKU..."
                disabled={isLoading}
                autoComplete="off"
              />
              {dropdownOpen && (
                <div className="stock-modal__dropdown">
                  {filtered.length === 0 ? (
                    <div className="stock-modal__dropdown-empty">
                      {available.length === 0
                        ? "All products are already stocked."
                        : "No matching products found."}
                    </div>
                  ) : (
                    filtered.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`stock-modal__dropdown-item ${
                          p.id === selectedId ? "stock-modal__dropdown-item--selected" : ""
                        }`}
                        onClick={() => handleSelect(p)}
                      >
                        <span className="stock-modal__dropdown-name">{p.name}</span>
                        {p.sku && (
                          <span className="stock-modal__dropdown-sku">{p.sku}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
              {selectedProduct && (
                <p className="stock-modal__selected-hint">
                  Selected: <strong>{selectedProduct.name}</strong>
                  {selectedProduct.sku ? ` (${selectedProduct.sku})` : ""}
                </p>
              )}
            </div>

            <div className="stock-modal__row">
              <div className="stock-modal__field">
                <label className="stock-modal__label">
                  Sell Price ($)
                  <span className="stock-modal__optional"> — optional</span>
                </label>
                <input
                  className="stock-modal__input"
                  type="number"
                  step="0.01"
                  min={0}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
              <div className="stock-modal__field">
                <label className="stock-modal__label">
                  Low Stock Threshold
                  <span className="stock-modal__optional"> — optional</span>
                </label>
                <input
                  className="stock-modal__input"
                  type="number"
                  min={0}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* ── Zone select ── */}
            <div className="stock-modal__field">
              <label className="stock-modal__label">
                Assign Zone
                <span className="stock-modal__optional"> — optional</span>
              </label>
              <select
                className="stock-modal__input stock-modal__select"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                disabled={isLoading}
              >
                <option value="">No zone</option>
                {availableZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="stock-modal__hint">
              The product will be added with 0 quantity. Use "Record Receipt" to add initial stock.
            </p>
          </div>

          <div className="stock-modal__footer">
            <button
              type="button"
              className="stock-modal__btn stock-modal__btn--secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="stock-modal__btn stock-modal__btn--primary"
              disabled={!selectedId || isLoading}
            >
              {isLoading ? "Stocking..." : "Stock Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
