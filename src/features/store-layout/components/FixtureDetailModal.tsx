import { useState } from "react";
import { FIXTURE_TYPES, findFixtureType } from "../constants";
import type { LayoutFixture, FixtureType } from "../../../shared/types";
import "./FixtureDetailModal.css";

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

  function handleEditShape() {
    onEditShape(fixture.id);
  }

  function handleDelete() {
    onDelete(fixture.id);
  }

  return (
    <div className="fixture-detail-modal__overlay" onClick={onClose}>
      <div
        className="fixture-detail-modal__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fixture-detail-modal__header">
          <span className="fixture-detail-modal__icon">{currentDef.icon}</span>
          <h3 className="fixture-detail-modal__title">{fixture.name}</h3>
          <button className="fixture-detail-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="fixture-detail-modal__stats">
          <span className="fixture-detail-modal__stat">
            <strong>{fixture.cells.length}</strong> cells
          </span>
          <span className="fixture-detail-modal__stat">
            {currentDef.label}
          </span>
        </div>

        <div className="fixture-detail-modal__section">
          <label
            className="fixture-detail-modal__label"
            htmlFor="fixture-detail-name"
          >
            Name
          </label>
          <input
            id="fixture-detail-name"
            className="fixture-detail-modal__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="fixture-detail-modal__section">
          <span className="fixture-detail-modal__label">Fixture Type</span>
          <div className="fixture-detail-modal__type-grid">
            {FIXTURE_TYPES.map((ft) => (
              <button
                key={ft.type}
                type="button"
                className={`fixture-detail-modal__type-btn${
                  fixtureType === ft.type
                    ? " fixture-detail-modal__type-btn--selected"
                    : ""
                }`}
                onClick={() => setFixtureType(ft.type)}
              >
                <span className="fixture-detail-modal__type-icon">
                  {ft.icon}
                </span>
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        {!showDeleteConfirm && (
          <div className="fixture-detail-modal__actions">
            <button
              className="fixture-detail-modal__btn fixture-detail-modal__btn--edit-shape"
              onClick={handleEditShape}
            >
              ✏️ Edit Shape
            </button>
            <button
              className="fixture-detail-modal__btn fixture-detail-modal__btn--delete"
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑️ Delete
            </button>
            {hasChanges && (
              <button
                className="fixture-detail-modal__btn fixture-detail-modal__btn--save"
                onClick={handleSave}
                disabled={!canSave}
              >
                Save Changes
              </button>
            )}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixture-detail-modal__delete-confirm">
            <p className="fixture-detail-modal__delete-text">
              Delete <strong>{fixture.name}</strong>? This cannot be undone.
            </p>
            <div className="fixture-detail-modal__delete-actions">
              <button
                className="fixture-detail-modal__btn fixture-detail-modal__btn--cancel-delete"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="fixture-detail-modal__btn fixture-detail-modal__btn--confirm-delete"
                onClick={handleDelete}
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
