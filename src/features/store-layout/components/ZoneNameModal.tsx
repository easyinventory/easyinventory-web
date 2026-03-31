import { useState } from "react";
import { ZONE_COLORS } from "../constants";
import type { Cell } from "../../../shared/types";
import "./ZoneNameModal.css";

interface ZoneNameModalProps {
  /** The selected cells to be used for this zone */
  cells: Cell[];
  /** Whether the zone was drawn in freeform mode */
  isFreeform: boolean;
  /** Called with the zone name + color hex when the user confirms */
  onConfirm: (name: string, color: string, cells: Cell[], isFreeform: boolean) => void;
  /** Called when the user cancels */
  onCancel: () => void;
}

export default function ZoneNameModal({
  cells,
  isFreeform,
  onConfirm,
  onCancel,
}: ZoneNameModalProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(ZONE_COLORS[0].hex);

  const canSubmit = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(name.trim(), selectedColor, cells, isFreeform);
  }

  return (
    <div className="zone-name-modal__overlay" onClick={onCancel}>
      <form
        className="zone-name-modal__dialog"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="zone-name-modal__title">Name this Zone</h3>

        <div className="zone-name-modal__field">
          <label className="zone-name-modal__label" htmlFor="zone-name-input">
            Zone Name
          </label>
          <input
            id="zone-name-input"
            className="zone-name-modal__input"
            type="text"
            placeholder="e.g. Electronics, Produce…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="zone-name-modal__field">
          <span className="zone-name-modal__label">Color</span>
          <div className="zone-name-modal__colors">
            {ZONE_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`zone-name-modal__swatch${
                  selectedColor === c.hex
                    ? " zone-name-modal__swatch--selected"
                    : ""
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                onClick={() => setSelectedColor(c.hex)}
              />
            ))}
          </div>
        </div>

        <div className="zone-name-modal__actions">
          <button
            type="button"
            className="zone-name-modal__btn zone-name-modal__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="zone-name-modal__btn zone-name-modal__btn--create"
            disabled={!canSubmit}
          >
            Create Zone
          </button>
        </div>
      </form>
    </div>
  );
}
