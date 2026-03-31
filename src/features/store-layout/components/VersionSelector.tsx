import { memo } from "react";
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
  return (
    <div className="version-selector">
      <div className="version-selector__label">Layout versions</div>
      <div className="version-selector__list">
        {layouts.map((layout) => (
          <div
            key={layout.id}
            className={`version-selector__item${layout.is_active ? " version-selector__item--active" : ""}`}
          >
            <div className="version-selector__item-dims">
              {layout.rows} × {layout.cols}
            </div>
            <div className="version-selector__item-date">
              {formatDate(layout.created_at)}
            </div>
            {layout.is_active ? (
              <span className="version-selector__active-badge">Active</span>
            ) : (
              <button
                className="version-selector__activate-btn"
                onClick={() => onActivate(layout.id)}
                disabled={isActivating}
              >
                Activate
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default VersionSelector;
