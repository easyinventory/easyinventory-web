import { memo } from "react";
import "./LayoutObjectsPanel.css";

const LayoutObjectsPanel = memo(function LayoutObjectsPanel() {
  return (
    <div className="layout-objects-panel">
      <div className="layout-objects-panel__header">
        <span className="layout-objects-panel__title">Layout Objects</span>
        <span className="layout-objects-panel__count">0</span>
      </div>
      <div className="layout-objects-panel__section-label">INVENTORY ZONES</div>
      <div className="layout-objects-panel__empty">No zones added yet.</div>
      <div className="layout-objects-panel__section-label layout-objects-panel__section-label--gap">
        FIXTURES &amp; STRUCTURES
      </div>
      <div className="layout-objects-panel__empty">No fixtures added yet.</div>
    </div>
  );
});

export default LayoutObjectsPanel;
