import { useState } from "react";
import { ZONE_COLORS } from "../constants";
import type { LayoutZone } from "../../../shared/types";
import "./ZoneDetailModal.css";

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

  function handleEditShape() {
    onEditShape(zone.id);
  }

  function handleDelete() {
    onDelete(zone.id);
  }

  return (
    <div className="zone-detail-modal__overlay" onClick={onClose}>
      <div
        className="zone-detail-modal__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="zone-detail-modal__header">
          <span
            className="zone-detail-modal__color-dot"
            style={{ backgroundColor: zone.color }}
          />
          <h3 className="zone-detail-modal__title">{zone.name}</h3>
          <button className="zone-detail-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="zone-detail-modal__stats">
          <span className="zone-detail-modal__stat">
            <strong>{zone.cells.length}</strong> cells
          </span>
          <span className="zone-detail-modal__stat">
            {zone.is_freeform ? "Freeform" : "Rectangle"}
          </span>
        </div>

        <div className="zone-detail-modal__section">
          <label className="zone-detail-modal__label" htmlFor="zone-detail-name">
            Name
          </label>
          <input
            id="zone-detail-name"
            className="zone-detail-modal__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="zone-detail-modal__section">
          <span className="zone-detail-modal__label">Color</span>
          <div className="zone-detail-modal__colors">
            {ZONE_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`zone-detail-modal__swatch${
                  color === c.hex
                    ? " zone-detail-modal__swatch--selected"
                    : ""
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                onClick={() => setColor(c.hex)}
              />
            ))}
          </div>
        </div>

        {!showDeleteConfirm && (
          <div className="zone-detail-modal__actions">
            <button
              className="zone-detail-modal__btn zone-detail-modal__btn--edit-shape"
              onClick={handleEditShape}
            >
              ✏️ Edit Shape
            </button>
            <button
              className="zone-detail-modal__btn zone-detail-modal__btn--delete"
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑️ Delete
            </button>
            {hasChanges && (
              <button
                className="zone-detail-modal__btn zone-detail-modal__btn--save"
                onClick={handleSave}
                disabled={!canSave}
              >
                Save Changes
              </button>
            )}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="zone-detail-modal__delete-confirm">
            <p className="zone-detail-modal__delete-text">
              Delete <strong>{zone.name}</strong>? This cannot be undone.
            </p>
            <div className="zone-detail-modal__delete-actions">
              <button
                className="zone-detail-modal__btn zone-detail-modal__btn--cancel-delete"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="zone-detail-modal__btn zone-detail-modal__btn--confirm-delete"
                onClick={handleDelete}
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
