import type { Cell } from "../../../shared/types";
import "./action-bar.css";

interface EditBannerProps {
  name: string;
  cells: Cell[];
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function EditBanner({
  name,
  cells,
  onSave,
  onCancel,
  isSaving = false,
}: EditBannerProps) {
  return (
    <div className="action-bar">
      <span className="action-bar__text">
        ✏️ Editing shape of{" "}
        <span className="action-bar__bold">{name}</span> —{" "}
        <span className="action-bar__bold">{cells.length}</span> cells
        selected. Click cells to add or remove.
      </span>
      <button
        className="action-bar__btn action-bar__btn--cancel"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </button>
      <button
        className="action-bar__btn action-bar__btn--primary"
        onClick={onSave}
        disabled={cells.length === 0 || isSaving}
      >
        {isSaving ? "Saving…" : "Done"}
      </button>
    </div>
  );
}
