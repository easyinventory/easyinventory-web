import { useState } from "react";
import { FIXTURE_TYPES, findFixtureType } from "../constants";
import type { LayoutFixture, FixtureType } from "../../../shared/types";
import "./layout-modal.css";

interface FixtureDetailModalProps {
  fixture: LayoutFixture;
  onUpdate: (
    fixtureId: string,
    updates: { name?: string; fixture_type?: FixtureType },
  ) => void;
  onEditShape: (fixtureId: string) => void;
  onDelete: (fixtureId: string) => void;
  onClose: () => void;
}

export default function FixtureDetailModal({
  fixture,
  onUpdate,
  onEditShape,
  onDelete,
  onClose,
}: FixtureDetailModalProps) {
  const [name, setName] = useState(fixture.name);
  const [fixtureType, setFixtureType] = useState<FixtureType>(
    fixture.fixture_type,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentDef = findFixtureType(fixture.fixture_type);
  const hasChanges =
    name !== fixture.name || fixtureType !== fixture.fixture_type;
  const canSave = name.trim().length > 0 && hasChanges;

  function handleSave() {
    const updates: { name?: string; fixture_type?: FixtureType } = {};
    if (name.trim() !== fixture.name) updates.name = name.trim();
    if (fixtureType !== fixture.fixture_type)
      updates.fixture_type = fixtureType;
    onUpdate(fixture.id, updates);
  }

  return (
    <div className="layout-modal-overlay" onClick={onClose}>
      <div
        className="layout-modal-dialog"
        style={{ width: 420 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fixture-detail-modal-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
        }}
      >
        <div className="layout-modal-header">
          <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>
            {currentDef.icon}
          </span>
          <h3 id="fixture-detail-modal-title" className="layout-modal-title">{fixture.name}</h3>
          <button className="layout-modal-close" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="layout-modal-stats">
          <span className="layout-modal-stat">
            <strong>{fixture.cells.length}</strong> cells
          </span>
          <span className="layout-modal-stat">{currentDef.label}</span>
        </div>

        <div className="layout-modal-section">
          <label className="layout-modal-label" htmlFor="fixture-detail-name">
            Name
          </label>
          <input
            id="fixture-detail-name"
            className="layout-modal-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="layout-modal-section">
          <span className="layout-modal-label">Fixture Type</span>
          <div className="layout-modal-type-grid">
            {FIXTURE_TYPES.map((ft) => (
              <button
                key={ft.type}
                type="button"
                className={`layout-modal-type-btn${
                  fixtureType === ft.type ? " layout-modal-type-btn--selected" : ""
                }`}
                onClick={() => setFixtureType(ft.type)}
              >
                <span className="layout-modal-type-icon">{ft.icon}</span>
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        {!showDeleteConfirm && (
          <div className="layout-modal-actions">
            <button
              className="layout-modal-btn layout-modal-btn--edit-shape"
              onClick={() => onEditShape(fixture.id)}
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
              Delete <strong>{fixture.name}</strong>? This cannot be undone.
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
                onClick={() => onDelete(fixture.id)}
              >
                Delete Fixture
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
