import type { Cell } from "../../../shared/types";
import "./action-bar.css";

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
    <div className="action-bar">
      <span className="action-bar__text">
        Creating {placementType} ·{" "}
        <span className="action-bar__bold">{cells.length}</span> cell
        {cells.length !== 1 ? "s" : ""} selected. Click cells to add or
        remove.
      </span>
      <button
        className="action-bar__btn action-bar__btn--cancel"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        className="action-bar__btn action-bar__btn--primary"
        onClick={onDone}
        disabled={cells.length === 0}
      >
        Done
      </button>
    </div>
  );
}
