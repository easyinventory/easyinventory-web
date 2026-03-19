import type { ProductSupplierLink } from "../../../shared/types";
import "./ProductSupplierTable.css";

interface ProductSupplierTableProps {
  suppliers: ProductSupplierLink[];
  canDelete: boolean;
  togglingId: string | null;
  removingId: string | null;
  onToggle: (supplierId: string, currentActive: boolean) => void;
  onRemove: (supplierId: string, supplierName: string) => void;
}

export default function ProductSupplierTable({
  suppliers,
  canDelete,
  togglingId,
  removingId,
  onToggle,
  onRemove,
}: ProductSupplierTableProps) {
  return (
    <div className="product-supplier-table">
      <table className="product-supplier-table__table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((link) => (
            <tr key={link.supplier_id}>
              <td className="product-supplier-table__name">
                {link.supplier_name}
              </td>
              <td>
                <span
                  className={`product-supplier-table__badge ${
                    link.is_active
                      ? "product-supplier-table__badge--active"
                      : "product-supplier-table__badge--inactive"
                  }`}
                >
                  {link.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="product-supplier-table__actions">
                <button
                  className="product-supplier-table__toggle-btn"
                  disabled={togglingId === link.supplier_id}
                  onClick={() => onToggle(link.supplier_id, link.is_active)}
                >
                  {togglingId === link.supplier_id
                    ? "Updating..."
                    : link.is_active
                      ? "Deactivate"
                      : "Activate"}
                </button>
                {canDelete && (
                  <button
                    className="product-supplier-table__remove-btn"
                    disabled={removingId === link.supplier_id}
                    onClick={() =>
                      onRemove(link.supplier_id, link.supplier_name)
                    }
                  >
                    {removingId === link.supplier_id
                      ? "Removing..."
                      : "Remove"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
