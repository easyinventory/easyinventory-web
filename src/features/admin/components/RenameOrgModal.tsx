import { useState, useCallback } from "react";
import { renameOrg } from "../api/adminApi";
import { useAsyncAction } from "../../../shared/hooks";
import ErrorBanner from "../../../shared/components/ui/ErrorBanner";
import "./RenameOrgModal.css";

interface RenameOrgModalProps {
  orgId: string;
  currentName: string;
  onSuccess: (newName: string) => void;
  onCancel: () => void;
}

export default function RenameOrgModal({
  orgId,
  currentName,
  onSuccess,
  onCancel,
}: RenameOrgModalProps) {
  const [name, setName] = useState(currentName);

  const action = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) return;
    const updated = await renameOrg(orgId, trimmed);
    onSuccess(updated.name);
  }, [name, orgId, currentName, onSuccess]);

  const { execute, isLoading, error } = useAsyncAction(action);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void execute();
  };

  return (
    <div className="rename-org-modal__overlay" role="dialog" aria-modal="true">
      <div className="rename-org-modal__content">
        <h3 className="rename-org-modal__title">Rename Organization</h3>

        <form onSubmit={handleSubmit}>
          <div className="rename-org-modal__field">
            <label htmlFor="rename-org-name">Organization name</label>
            <input
              id="rename-org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="rename-org-modal__actions">
            <button
              type="button"
              className="rename-org-modal__btn rename-org-modal__btn--secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rename-org-modal__btn rename-org-modal__btn--primary"
              disabled={isLoading || !name.trim() || name.trim() === currentName}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
