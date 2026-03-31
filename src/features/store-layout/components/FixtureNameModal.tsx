import { useState } from "react";
import { FIXTURE_TYPES } from "../constants";
import type { Cell, FixtureType } from "../../../shared/types";
import "./FixtureNameModal.css";

interface FixtureNameModalProps {
  /** The selected cells for this fixture */
  cells: Cell[];
  /** Called with fixture details when the user confirms */
  onConfirm: (name: string, fixtureType: FixtureType, cells: Cell[]) => void;
  /** Called when the user cancels */
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
    <div className="fixture-name-modal__overlay" onClick={onCancel}>
      <form
        className="fixture-name-modal__dialog"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="fixture-name-modal__title">Add Fixture</h3>

        <div className="fixture-name-modal__field">
          <label
            className="fixture-name-modal__label"
            htmlFor="fixture-name-input"
          >
            Fixture Name
          </label>
          <input
            id="fixture-name-input"
            className="fixture-name-modal__input"
            type="text"
            placeholder="e.g. Main Entrance, Checkout 1…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="fixture-name-modal__field">
          <span className="fixture-name-modal__label">Fixture Type</span>
          <div className="fixture-name-modal__type-grid">
            {FIXTURE_TYPES.map((ft) => (
              <button
                key={ft.type}
                type="button"
                className={`fixture-name-modal__type-btn${
                  selectedType === ft.type
                    ? " fixture-name-modal__type-btn--selected"
                    : ""
                }`}
                onClick={() => setSelectedType(ft.type)}
              >
                <span className="fixture-name-modal__type-icon">{ft.icon}</span>
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fixture-name-modal__actions">
          <button
            type="button"
            className="fixture-name-modal__btn fixture-name-modal__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="fixture-name-modal__btn fixture-name-modal__btn--create"
            disabled={!canSubmit}
          >
            Add Fixture
          </button>
        </div>
      </form>
    </div>
  );
}
