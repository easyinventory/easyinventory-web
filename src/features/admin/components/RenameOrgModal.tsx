import { useState } from "react";
import { renameOrg } from "../api/adminApi";
import { extractApiError } from "../../../shared/utils";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) return;

    setIsLoading(true);
    setError(null);

    try {
      const updated = await renameOrg(orgId, trimmed);
      onSuccess(updated.name);
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
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
