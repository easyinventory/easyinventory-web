import type { Product } from "../../types";
import { formatDate } from "../../utils";
import "./ProductTable.css";

interface ProductTableProps {
  products: Product[];
  onRowClick: (product: Product) => void;
}

export default function ProductTable({
  products,
  onRowClick,
}: ProductTableProps) {
  return (
    <div className="product-table">
      <table className="product-table__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="product-table__row"
              onClick={() => onRowClick(product)}
            >
              <td className="product-table__name">{product.name}</td>
              <td className="product-table__sku">
                {product.sku || <span className="product-table__empty">—</span>}
              </td>
              <td className="product-table__category">
                {product.category || (
                  <span className="product-table__empty">—</span>
                )}
              </td>
              <td className="product-table__date">
                {formatDate(product.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
