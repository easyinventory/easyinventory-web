import type { Cell } from "../../../shared/types";
import "./FreeformBar.css";

interface FreeformBarProps {
  cells: Cell[];
  placementType: "zone" | "fixture";
  onDone: () => void;
  onCancel: () => void;
}

export default function FreeformBar({
  cells,
  placementType,
  onDone,
  onCancel,
}: FreeformBarProps) {
  return (
    <div className="freeform-bar">
      <span className="freeform-bar__text">
        Creating {placementType} ·{" "}
        <span className="freeform-bar__count">{cells.length}</span> cell
        {cells.length !== 1 ? "s" : ""} selected. Click cells to add or
        remove.
      </span>
      <button
        className="freeform-bar__btn freeform-bar__btn--cancel"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        className="freeform-bar__btn freeform-bar__btn--done"
        onClick={onDone}
        disabled={cells.length === 0}
      >
        Done
      </button>
    </div>
  );
}
