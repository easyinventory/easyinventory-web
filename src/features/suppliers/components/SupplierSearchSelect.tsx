import { useEffect, useMemo, useRef, useState } from "react";
import type { Supplier } from "../api/supplierApi";
import "./SupplierSearchSelect.css";

interface SupplierSearchSelectProps {
  suppliers: Supplier[];
  selectedSupplierId: string | null;
  disabled?: boolean;
  onSelectSupplier: (supplierId: string) => void;
}

export default function SupplierSearchSelect({
  suppliers,
  selectedSupplierId,
  disabled = false,
  onSelectSupplier,
}: SupplierSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null,
    [selectedSupplierId, suppliers]
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredSuppliers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      return [supplier.name, supplier.contact_name, supplier.contact_email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    });
  }, [query, suppliers]);

  return (
    <div className="supplier-search-select" ref={containerRef}>
      <label htmlFor="supplier-combobox" className="supplier-search-select__label">
        Supplier
      </label>
      <input
        id="supplier-combobox"
        className="supplier-search-select__input"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={
          suppliers.length === 0
            ? "No suppliers"
            : selectedSupplier?.name || "Search suppliers"
        }
        disabled={disabled}
        autoComplete="off"
      />

      {isOpen && !disabled && (
        <div className="supplier-search-select__menu">
          {filteredSuppliers.length === 0 ? (
            <div className="supplier-search-select__empty">No matching suppliers</div>
          ) : (
            filteredSuppliers.map((supplier) => (
              <button
                key={supplier.id}
                type="button"
                className="supplier-search-select__option"
                onClick={() => {
                  onSelectSupplier(supplier.id);
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                <span className="supplier-search-select__name">{supplier.name}</span>
                {supplier.contact_email && (
                  <span className="supplier-search-select__meta">{supplier.contact_email}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}