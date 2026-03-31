import { useState } from "react";
import { ZONE_COLORS } from "../constants";
import type { LayoutZone } from "../../../shared/types";
import "./layout-modal.css";

interface ZoneDetailModalProps {
  zone: LayoutZone;
  onUpdate: (zoneId: string, updates: { name?: string; color?: string }) => void;
  onEditShape: (zoneId: string) => void;
  onDelete: (zoneId: string) => void;
  onClose: () => void;
}

export default function ZoneDetailModal({
  zone,
  onUpdate,
  onEditShape,
  onDelete,
  onClose,
}: ZoneDetailModalProps) {
  const [name, setName] = useState(zone.name);
  const [color, setColor] = useState(zone.color);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasChanges = name !== zone.name || color !== zone.color;
  const canSave = name.trim().length > 0 && hasChanges;

  function handleSave() {
    const updates: { name?: string; color?: string } = {};
    if (name.trim() !== zone.name) updates.name = name.trim();
    if (color !== zone.color) updates.color = color;
    onUpdate(zone.id, updates);
  }

  return (
    <div className="layout-modal-overlay" onClick={onClose}>
      <div
        className="layout-modal-dialog"
        style={{ width: 400 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zone-detail-modal-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
        }}
      >
        <div className="layout-modal-header">
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: zone.color,
            }}
          />
          <h3 id="zone-detail-modal-title" className="layout-modal-title">{zone.name}</h3>
          <button className="layout-modal-close" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="layout-modal-stats">
          <span className="layout-modal-stat">
            <strong>{zone.cells.length}</strong> cells
          </span>
          <span className="layout-modal-stat">
            {zone.is_freeform ? "Freeform" : "Rectangle"}
          </span>
        </div>

        <div className="layout-modal-section">
          <label className="layout-modal-label" htmlFor="zone-detail-name">
            Name
          </label>
          <input
            id="zone-detail-name"
            className="layout-modal-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="layout-modal-section">
          <span className="layout-modal-label">Color</span>
          <div className="layout-modal-colors">
            {ZONE_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`layout-modal-swatch${
                  color === c.hex ? " layout-modal-swatch--selected" : ""
                }`}
                style={{ backgroundColor: c.hex, width: 28, height: 28 }}
                title={c.name}
                onClick={() => setColor(c.hex)}
              />
            ))}
          </div>
        </div>

        {!showDeleteConfirm && (
          <div className="layout-modal-actions">
            <button
              className="layout-modal-btn layout-modal-btn--edit-shape"
              onClick={() => onEditShape(zone.id)}
            >
              ✏️ Edit Shape
            </button>
            <button
              className="layout-modal-btn layout-modal-btn--danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑️ Delete
            </button>
            {hasChanges && (
              <button
                className="layout-modal-btn layout-modal-btn--save"
                onClick={handleSave}
                disabled={!canSave}
              >
                Save Changes
              </button>
            )}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="layout-modal-delete-confirm">
            <p className="layout-modal-delete-text">
              Delete <strong>{zone.name}</strong>? This cannot be undone.
            </p>
            <div className="layout-modal-delete-actions">
              <button
                className="layout-modal-btn layout-modal-btn--cancel-delete"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="layout-modal-btn layout-modal-btn--confirm-delete"
                onClick={() => onDelete(zone.id)}
              >
                Delete Zone
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
