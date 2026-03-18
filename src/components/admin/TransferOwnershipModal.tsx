import { useState } from "react";
import { transferOwnership } from "../../api/adminApi";
import { extractApiError } from "../../utils";
import ErrorBanner from "../ui/ErrorBanner";
import "./TransferOwnershipModal.css";

interface TransferOwnershipModalProps {
  orgId: string;
  orgName: string;
  onSuccess: (newOwnerEmail: string) => void;
  onCancel: () => void;
}

export default function TransferOwnershipModal({
  orgId,
  orgName,
  onSuccess,
  onCancel,
}: TransferOwnershipModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    try {
      await transferOwnership(orgId, trimmed);
      onSuccess(trimmed);
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="transfer-modal__overlay" role="dialog" aria-modal="true">
      <div className="transfer-modal__content">
        <h3 className="transfer-modal__title">Transfer Ownership</h3>
        <p className="transfer-modal__copy">
          Transfer ownership of <strong>{orgName}</strong> to another member.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="transfer-modal__field">
            <label htmlFor="transfer-email">New owner email</label>
            <input
              id="transfer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              autoFocus
              required
            />
            <p className="transfer-modal__hint">
              The new owner must already be a member of this organization.
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="transfer-modal__actions">
            <button
              type="button"
              className="transfer-modal__btn transfer-modal__btn--secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="transfer-modal__btn transfer-modal__btn--primary"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "Transferring..." : "Transfer Ownership"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
