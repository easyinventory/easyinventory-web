import type { Cell } from "../../../shared/types";
import "./EditBanner.css";

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
    <div className="edit-banner">
      <span className="edit-banner__text">
        ✏️ Editing shape of{" "}
        <span className="edit-banner__name">{name}</span> —{" "}
        <span className="edit-banner__count">{cells.length}</span> cells
        selected. Click cells to add or remove.
      </span>
      <button
        className="edit-banner__btn edit-banner__btn--cancel"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </button>
      <button
        className="edit-banner__btn edit-banner__btn--save"
        onClick={onSave}
        disabled={cells.length === 0 || isSaving}
      >
        {isSaving ? "Saving…" : "Done"}
      </button>
    </div>
  );
}
