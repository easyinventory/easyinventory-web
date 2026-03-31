import { memo } from "react";
import type { LayoutZone, LayoutFixture } from "../../../shared/types";
import { findFixtureType } from "../constants";
import "./LayoutObjectsPanel.css";

interface LayoutObjectsPanelProps {
  zones: LayoutZone[];
  fixtures: LayoutFixture[];
  selectedItemId: string | null;
  onItemClick: (type: "zone" | "fixture", id: string) => void;
}

const LayoutObjectsPanel = memo(function LayoutObjectsPanel({
  zones,
  fixtures,
  selectedItemId,
  onItemClick,
}: LayoutObjectsPanelProps) {
  const totalCount = zones.length + fixtures.length;

  return (
    <div className="layout-objects-panel">
      <div className="layout-objects-panel__header">
        <span className="layout-objects-panel__title">Layout Objects</span>
        <span className="layout-objects-panel__count">{totalCount}</span>
      </div>

      <div className="layout-objects-panel__section-label">
        INVENTORY ZONES
      </div>
      {zones.length === 0 ? (
        <div className="layout-objects-panel__empty">No zones added yet.</div>
      ) : (
        zones.map((z) => (
          <div
            key={z.id}
            className={`layout-objects-panel__item${
              selectedItemId === z.id
                ? " layout-objects-panel__item--selected"
                : ""
            }`}
            onClick={() => onItemClick("zone", z.id)}
          >
            <span
              className="layout-objects-panel__item-dot"
              style={{ backgroundColor: z.color }}
            />
            <span className="layout-objects-panel__item-name">{z.name}</span>
            {z.is_freeform && (
              <span className="layout-objects-panel__item-badge">Freeform</span>
            )}
            <span className="layout-objects-panel__item-cells">
              {z.cells.length}
            </span>
          </div>
        ))
      )}

      <div className="layout-objects-panel__section-label layout-objects-panel__section-label--gap">
        FIXTURES &amp; STRUCTURES
      </div>
      {fixtures.length === 0 ? (
        <div className="layout-objects-panel__empty">
          No fixtures added yet.
        </div>
      ) : (
        fixtures.map((f) => {
          const ftDef = findFixtureType(f.fixture_type);
          return (
            <div
              key={f.id}
              className={`layout-objects-panel__item${
                selectedItemId === f.id
                  ? " layout-objects-panel__item--selected"
                  : ""
              }`}
              onClick={() => onItemClick("fixture", f.id)}
            >
              <span className="layout-objects-panel__item-icon">
                {ftDef.icon}
              </span>
              <span className="layout-objects-panel__item-name">{f.name}</span>
              <span className="layout-objects-panel__item-cells">
                {f.cells.length}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
});

export default LayoutObjectsPanel;
