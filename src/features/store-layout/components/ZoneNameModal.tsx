import { useState } from "react";
import { ZONE_COLORS } from "../constants";
import type { Cell } from "../../../shared/types";
import "./layout-modal.css";

interface ZoneNameModalProps {
  cells: Cell[];
  isFreeform: boolean;
  onConfirm: (name: string, color: string, cells: Cell[], isFreeform: boolean) => void;
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
    <div className="layout-modal-overlay" onClick={onCancel}>
      <form
        className="layout-modal-dialog"
        style={{ width: 380 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="layout-modal-title">Name this Zone</h3>

        <div className="layout-modal-section">
          <label className="layout-modal-label" htmlFor="zone-name-input">
            Zone Name
          </label>
          <input
            id="zone-name-input"
            className="layout-modal-input"
            type="text"
            placeholder="e.g. Electronics, Produce…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
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
                  selectedColor === c.hex ? " layout-modal-swatch--selected" : ""
                }`}
                style={{ backgroundColor: c.hex, width: 32, height: 32 }}
                title={c.name}
                onClick={() => setSelectedColor(c.hex)}
              />
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
            Create Zone
          </button>
        </div>
      </form>
    </div>
  );
}
