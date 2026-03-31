import { useState } from "react";
import { useStore } from "../../../features/store-layout/context/useStore";
import "./StoreSwitcher.css";

export default function StoreSwitcher() {
  const { stores, selectedStoreId, selectedStoreName, switchStore, isLoading, error } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const hasMultipleStores = stores.length > 1;

  // Close the dropdown when the stores list changes (e.g. after an org switch).
  // Render-time state adjustment — avoids useEffect + setState and ref access during render.
  const [prevStores, setPrevStores] = useState(stores);
  if (prevStores !== stores) {
    setPrevStores(stores);
    if (isOpen) setIsOpen(false);
  }

  const handleToggle = () => {
    if (hasMultipleStores) setIsOpen((o) => !o);
  };

  const handleSwitch = (storeId: string) => {
    switchStore(storeId);
    setIsOpen(false);
  };

  return (
    <div className="store-switcher">
      <button
        type="button"
        className={`store-switcher__current${hasMultipleStores ? " store-switcher__current--clickable" : ""}`}
        onClick={handleToggle}
        aria-expanded={hasMultipleStores ? isOpen : undefined}
        aria-haspopup={hasMultipleStores ? "listbox" : undefined}
        title={selectedStoreName ?? undefined}
        disabled={!hasMultipleStores}
      >
        <div className="store-switcher__icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="5" width="12" height="8" rx="1" />
            <path d="M1 5 L2.5 1 L11.5 1 L13 5" />
            <line x1="7" y1="5" x2="7" y2="13" />
          </svg>
        </div>
        <div className="store-switcher__details">
          {isLoading ? (
            <div className="store-switcher__skeleton" />
          ) : error ? (
            <div className="store-switcher__name store-switcher__name--error">Failed to load</div>
          ) : (
            <>
              <div className="store-switcher__name">{selectedStoreName ?? "No stores"}</div>
              <div className="store-switcher__label">Store</div>
            </>
          )}
        </div>
        {hasMultipleStores && (
          <span className={`store-switcher__chevron${isOpen ? " store-switcher__chevron--open" : ""}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4.5 L6 7.5 L9 4.5" />
            </svg>
          </span>
        )}
      </button>

      {isOpen && hasMultipleStores && (
        <div className="store-switcher__dropdown" role="listbox">
          {stores.map((s) => (
            <button
              key={s.id}
              role="option"
              aria-selected={s.id === selectedStoreId}
              className={`store-switcher__option${s.id === selectedStoreId ? " store-switcher__option--active" : ""}`}
              onClick={() => handleSwitch(s.id)}
            >
              <span className="store-switcher__option-check">
                {s.id === selectedStoreId ? "✓" : ""}
              </span>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

