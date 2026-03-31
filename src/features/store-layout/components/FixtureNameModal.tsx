import { useState } from "react";
import { FIXTURE_TYPES } from "../constants";
import type { Cell, FixtureType } from "../../../shared/types";
import "./layout-modal.css";

interface FixtureNameModalProps {
  cells: Cell[];
  onConfirm: (name: string, fixtureType: FixtureType, cells: Cell[]) => void;
  onCancel: () => void;
}

export default function FixtureNameModal({
  cells,
  onConfirm,
  onCancel,
}: FixtureNameModalProps) {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<FixtureType>(
    FIXTURE_TYPES[0].type,
  );

  const canSubmit = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(name.trim(), selectedType, cells);
  }

  return (
    <div className="layout-modal-overlay" onClick={onCancel}>
      <form
        className="layout-modal-dialog"
        style={{ width: 420 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fixture-name-modal-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onCancel();
          }
        }}
        onSubmit={handleSubmit}
      >
        <h3 id="fixture-name-modal-title" className="layout-modal-title">Add Fixture</h3>

        <div className="layout-modal-section">
          <label className="layout-modal-label" htmlFor="fixture-name-input">
            Fixture Name
          </label>
          <input
            id="fixture-name-input"
            className="layout-modal-input"
            type="text"
            placeholder="e.g. Main Entrance, Checkout 1…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
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
                  selectedType === ft.type ? " layout-modal-type-btn--selected" : ""
                }`}
                onClick={() => setSelectedType(ft.type)}
              >
                <span className="layout-modal-type-icon">{ft.icon}</span>
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        <div className="layout-modal-actions layout-modal-actions--right">
          <button
            type="button"
            className="layout-modal-btn layout-modal-btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="layout-modal-btn layout-modal-btn--primary"
            disabled={!canSubmit}
          >
            Add Fixture
          </button>
        </div>
      </form>
    </div>
  );
}
