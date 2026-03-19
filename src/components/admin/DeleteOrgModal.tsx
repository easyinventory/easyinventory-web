import { useState } from "react";
import { deleteOrg } from "../../api/adminApi";
import { extractApiError } from "../../shared/utils";
import ErrorBanner from "../../shared/components/ui/ErrorBanner";
import "./DeleteOrgModal.css";

interface DeleteOrgModalProps {
  orgId: string;
  orgName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DeleteOrgModal({
  orgId,
  orgName,
  onSuccess,
  onCancel,
}: DeleteOrgModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteOrg(orgId);
      onSuccess();
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-org-modal__overlay" role="dialog" aria-modal="true">
      <div className="delete-org-modal__content">
        <h3 className="delete-org-modal__title">Delete Organization?</h3>
        <p className="delete-org-modal__copy">
          Are you sure you want to delete <strong>{orgName}</strong>?
        </p>
        <p className="delete-org-modal__warning">
          ⚠️ This will remove all memberships and cannot be undone.
        </p>

        {error && <ErrorBanner message={error} />}

        <div className="delete-org-modal__actions">
          <button
            type="button"
            className="delete-org-modal__btn delete-org-modal__btn--secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-org-modal__btn delete-org-modal__btn--danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Organization"}
          </button>
        </div>
      </div>
    </div>
  );
}
