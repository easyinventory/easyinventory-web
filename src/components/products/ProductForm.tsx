import { ErrorBanner, SuccessBanner } from "../ui";
import "./ProductForm.css";

export interface ProductFormValues {
  name: string;
  description: string;
  sku: string;
  category: string;
}

interface ProductFormProps {
  value: ProductFormValues;
  isSubmitting: boolean;
  actionError: string | null;
  success: string | null;
  submitLabel: string;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  onFieldChange: (field: keyof ProductFormValues, nextValue: string) => void;
}

export default function ProductForm({
  value,
  isSubmitting,
  actionError,
  success,
  submitLabel,
  onSubmit,
  onCancel,
  onFieldChange,
}: ProductFormProps) {
  return (
    <div className="product-form">
      <form onSubmit={onSubmit}>
        <div className="product-form__grid">
          <div className="product-form__field product-form__field--full">
            <label htmlFor="product-name">Product name *</label>
            <input
              id="product-name"
              value={value.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="e.g. Organic Apples"
              required
            />
          </div>

          <div className="product-form__field">
            <label htmlFor="product-sku">SKU</label>
            <input
              id="product-sku"
              value={value.sku}
              onChange={(e) => onFieldChange("sku", e.target.value)}
              placeholder="e.g. APL-001"
            />
          </div>

          <div className="product-form__field">
            <label htmlFor="product-category">Category</label>
            <input
              id="product-category"
              value={value.category}
              onChange={(e) => onFieldChange("category", e.target.value)}
              placeholder="e.g. Produce"
            />
          </div>

          <div className="product-form__field product-form__field--full">
            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              value={value.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder="Optional product description"
              rows={3}
            />
          </div>
        </div>

        <div className="product-form__actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
          <button
            type="button"
            className="product-form__secondary-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>

        {actionError && <ErrorBanner message={actionError} />}
        {success && <SuccessBanner message={success} />}
      </form>
    </div>
  );
}
