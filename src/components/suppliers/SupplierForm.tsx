import { ErrorBanner, SuccessBanner } from "../../shared/components/ui";
import "./SupplierForm.css";

export interface SupplierFormValues {
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
}

interface SupplierFormProps {
  formId: string;
  value: SupplierFormValues;
  isEditing: boolean;
  isSubmitting: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  actionError: string | null;
  success: string | null;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  onDelete: () => void;
  onFieldChange: (field: keyof SupplierFormValues, nextValue: string) => void;
}

export default function SupplierForm({
  formId,
  value,
  isEditing,
  isSubmitting,
  canDelete,
  isDeleting,
  actionError,
  success,
  onSubmit,
  onCancel,
  onDelete,
  onFieldChange,
}: SupplierFormProps) {
  return (
    <div className="supplier-form">
      <div className="supplier-form__title">
        {isEditing ? "Edit supplier" : "Add supplier"}
      </div>

      <form id={formId} onSubmit={onSubmit}>
        <div className="supplier-form__grid">
          <div className="supplier-form__field supplier-form__field--full">
            <label htmlFor="supplier-name">Supplier name</label>
            <input
              id="supplier-name"
              value={value.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="Acme Foods"
              required
            />
          </div>

          <div className="supplier-form__field">
            <label htmlFor="supplier-contact-name">Contact name</label>
            <input
              id="supplier-contact-name"
              value={value.contact_name}
              onChange={(e) => onFieldChange("contact_name", e.target.value)}
              placeholder="Jane Smith"
            />
          </div>

          <div className="supplier-form__field">
            <label htmlFor="supplier-contact-email">Contact email</label>
            <input
              id="supplier-contact-email"
              type="email"
              value={value.contact_email}
              onChange={(e) => onFieldChange("contact_email", e.target.value)}
              placeholder="sales@acme.com"
            />
          </div>

          <div className="supplier-form__field">
            <label htmlFor="supplier-contact-phone">Contact phone</label>
            <input
              id="supplier-contact-phone"
              value={value.contact_phone}
              onChange={(e) => onFieldChange("contact_phone", e.target.value)}
              placeholder="555-1234"
            />
          </div>

          <div className="supplier-form__field supplier-form__field--full">
            <label htmlFor="supplier-notes">Notes</label>
            <textarea
              id="supplier-notes"
              value={value.notes}
              onChange={(e) => onFieldChange("notes", e.target.value)}
              placeholder="Delivery expectations, payment terms, etc."
              rows={3}
            />
          </div>
        </div>

        <div className="supplier-form__actions">
          <div className="supplier-form__actions-left">
            {isEditing && (
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
            )}
            {isEditing && (
              <button
                type="button"
                className="supplier-form__secondary-btn"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
          </div>

          {isEditing && canDelete && (
            <button
              type="button"
              className="supplier-form__danger-btn"
              disabled={isDeleting}
              onClick={onDelete}
            >
              {isDeleting ? "Deleting..." : "Delete Supplier"}
            </button>
          )}
        </div>

        {actionError && <ErrorBanner message={actionError} />}
        {success && <SuccessBanner message={success} />}
      </form>
    </div>
  );
}