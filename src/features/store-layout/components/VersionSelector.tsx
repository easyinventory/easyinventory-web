import { memo, useMemo, useState } from "react";
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
  const [open, setOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...layouts].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [layouts],
  );

  const activeIndex = sorted.findIndex((l) => l.is_active);
  const active = sorted[activeIndex] ?? sorted[0];
  const others = sorted.filter((l) => l.id !== active?.id);

  if (!active) return null;

  return (
    <div className="version-selector">
      <button
        className="version-selector__toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="version-selector__active-info">
          <span className="version-selector__active-badge">Active</span>
          <span className="version-selector__version-label">
            Version {activeIndex + 1}
          </span>
          <span className="version-selector__dims">
            {active.rows} rows &times; {active.cols} columns
          </span>
          {(active as StoreLayout & { zones?: unknown[]; fixtures?: unknown[] })
            .zones &&
            (active as StoreLayout & { zones?: unknown[]; fixtures?: unknown[] })
              .fixtures && (
              <span className="version-selector__dims">
                &middot; {(active.zones ?? []).length} zones &middot;{" "}
                {(active.fixtures ?? []).length} fixtures
              </span>
            )}
        </div>
        <div className="version-selector__toggle-right">
          <span className="version-selector__date">
            Created {formatDate(active.created_at)}
          </span>
          {others.length > 0 && (
            <span
              className={`version-selector__chevron${
                open ? " version-selector__chevron--open" : ""
              }`}
            >
              ▾
            </span>
          )}
        </div>
      </button>

      {open && others.length > 0 && (
        <div className="version-selector__dropdown">
          {others.map((layout) => {
            const versionNum =
              sorted.findIndex((l) => l.id === layout.id) + 1;
            return (
              <div key={layout.id} className="version-selector__dropdown-row">
                <span className="version-selector__version-label">
                  Version {versionNum}
                </span>
                <span className="version-selector__dims">
                  {layout.rows} rows &times; {layout.cols} columns
                </span>
                <span className="version-selector__date">
                  Created {formatDate(layout.created_at)}
                </span>
                <button
                  className="version-selector__activate-btn"
                  onClick={() => {
                    onActivate(layout.id);
                    setOpen(false);
                  }}
                  disabled={isActivating}
                >
                  Activate
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default VersionSelector;
