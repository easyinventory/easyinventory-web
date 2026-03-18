import { useState } from "react";
import { deleteSystemUser } from "../../api/adminApi";
import ErrorBanner from "../ui/ErrorBanner";
import "./DeleteUserModal.css";

interface DeleteUserModalProps {
  userId: string;
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function getDeleteErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { status?: unknown } }).response?.status === "number"
  ) {
    const status = (err as { response: { status: number } }).response.status;
    if (status === 400) {
      return "You cannot delete your own account.";
    }
    if (status === 403) {
      return "You do not have permission to delete users.";
    }
    if (status === 404) {
      return "User not found.";
    }
  }

  return "Failed to delete user. Please try again.";
}

export default function DeleteUserModal({
  userId,
  userEmail,
  onSuccess,
  onCancel,
}: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteSystemUser(userId);
      onSuccess();
    } catch (err: unknown) {
      setError(getDeleteErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-user-modal__overlay" role="dialog" aria-modal="true">
      <div className="delete-user-modal__content">
        <h3 className="delete-user-modal__title">Delete User?</h3>
        <p className="delete-user-modal__copy">
          Are you sure you want to permanently delete
          <strong> {userEmail}</strong>?
        </p>
        <p className="delete-user-modal__warning">
          ⚠️ This action cannot be undone. The user will be removed from all
          organizations and their Cognito account will be deleted.
        </p>

        {error && <ErrorBanner message={error} />}

        <div className="delete-user-modal__actions">
          <button
            type="button"
            className="delete-user-modal__btn delete-user-modal__btn--secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-user-modal__btn delete-user-modal__btn--danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}