import { memo, useMemo } from "react";
import type { StoreLayout } from "../../../shared/types";
import "./VersionSelector.css";

interface VersionSelectorProps {
  layouts: StoreLayout[];
  onActivate: (layoutId: string) => void;
  isActivating: boolean;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const VersionSelector = memo(function VersionSelector({
  layouts,
  onActivate,
  isActivating,
}: VersionSelectorProps) {
  // Sort by created_at ascending to assign stable version numbers
  const sorted = useMemo(
    () =>
      [...layouts].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [layouts]
  );

  return (
    <div className="version-selector">
      {sorted.map((layout, index) => (
        <div
          key={layout.id}
          className={`version-selector__row${
            layout.is_active ? " version-selector__row--active" : ""
          }`}
        >
          <div className="version-selector__row-left">
            {layout.is_active && (
              <span className="version-selector__active-badge">Active</span>
            )}
            <span className="version-selector__version-label">
              Version {index + 1}
            </span>
            <span className="version-selector__dims">
              {layout.rows} rows × {layout.cols} columns
            </span>
          </div>
          <div className="version-selector__row-right">
            <span className="version-selector__date">
              Created {formatDate(layout.created_at)}
            </span>
            {!layout.is_active && (
              <button
                className="version-selector__activate-btn"
                onClick={() => onActivate(layout.id)}
                disabled={isActivating}
              >
                Activate
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default VersionSelector;
