import type { Supplier } from "../../api/supplierApi";
import "./SupplierRow.css";

interface SupplierRowProps {
  supplier: Supplier;
  canDeleteSuppliers: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export default function SupplierRow({
  supplier,
  canDeleteSuppliers,
  isSubmitting,
  isDeleting,
  onEdit,
  onDelete,
}: SupplierRowProps) {
  return (
    <tr>
      <td className="supplier-row__primary-cell">{supplier.name}</td>
      <td>{supplier.contact_name || "—"}</td>
      <td>{supplier.contact_email || "—"}</td>
      <td>{supplier.contact_phone || "—"}</td>
      <td>{supplier.notes || "—"}</td>
      <td>
        <div className="supplier-row__actions">
          <button
            type="button"
            className="supplier-row__btn"
            onClick={() => onEdit(supplier)}
            disabled={isSubmitting || isDeleting}
          >
            Edit
          </button>
          {canDeleteSuppliers && (
            <button
              type="button"
              className="supplier-row__btn supplier-row__btn--danger"
              onClick={() => onDelete(supplier)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}