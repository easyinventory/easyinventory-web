import { useState } from "react";
import { createOrg } from "../api/adminApi";
import { ErrorBanner, SuccessBanner } from "../../../shared/components/ui";
import { extractApiError } from "../../../shared/utils";
import "./CreateOrgForm.css";

interface CreateOrgFormProps {
  onCreated: () => void;
}

export default function CreateOrgForm({ onCreated }: CreateOrgFormProps) {
  const [name, setName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await createOrg({ name, owner_email: ownerEmail });
      setSuccess(`Created "${name}" with owner ${ownerEmail}`);
      setName("");
      setOwnerEmail("");
      onCreated();

      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-org-form">
      <div className="create-org-form__title">Onboard new client</div>
      <form onSubmit={handleSubmit}>
        <div className="create-org-form__row">
          <div className="create-org-form__field">
            <label htmlFor="org-name">Organization name</label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Groceries"
              required
            />
          </div>
          <div className="create-org-form__field">
            <label htmlFor="owner-email">Owner email</label>
            <input
              id="owner-email"
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="client@acme.com"
              required
            />
          </div>
          <button
            type="submit"
            className="create-org-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
        <p className="create-org-form__hint">
          If the owner email is new, they'll receive a Cognito invite with a temporary password.
        </p>
        {error && <ErrorBanner message={error} />}
        {success && <SuccessBanner message={success} />}
      </form>
    </div>
  );
}