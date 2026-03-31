import { memo } from "react";
import type { StoreInventoryItem } from "../../../shared/types";
import StockBadge from "./StockBadge";
import "./InventoryTable.css";

interface InventoryTableProps {
  items: StoreInventoryItem[];
  zoneMap: Map<string, string | null>;
  onRowClick: (item: StoreInventoryItem) => void;
}

function formatPrice(value: string | null): string {
  if (!value) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return `$${num.toFixed(2)}`;
}

function getQtyClass(qty: number, threshold: number | null): string {
  if (qty === 0) return "inventory-table__qty--danger";
  if (threshold !== null && qty <= threshold) return "inventory-table__qty--warning";
  return "inventory-table__qty--success";
}

export default memo(function InventoryTable({
  items,
  zoneMap,
  onRowClick,
}: InventoryTableProps) {
  return (
    <div className="inventory-table">
      <table className="inventory-table__table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Zone</th>
            <th className="inventory-table__th-right">Price</th>
            <th className="inventory-table__th-right">Qty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const zoneName = zoneMap.get(item.id) ?? null;
            return (
              <tr
                key={item.id}
                className="inventory-table__row"
                onClick={() => onRowClick(item)}
              >
                <td className="inventory-table__name">
                  {item.product.name}
                </td>
                <td className="inventory-table__sku">
                  {item.product.sku || (
                    <span className="inventory-table__empty">—</span>
                  )}
                </td>
                <td className="inventory-table__category">
                  {item.product.category || (
                    <span className="inventory-table__empty">—</span>
                  )}
                </td>
                <td>
                  {zoneName ? (
                    <span className="inventory-table__zone-badge">
                      {zoneName}
                    </span>
                  ) : (
                    <span className="inventory-table__empty">—</span>
                  )}
                </td>
                <td className="inventory-table__price">
                  {formatPrice(item.unit_price)}
                </td>
                <td className={`inventory-table__qty ${getQtyClass(item.quantity, item.low_stock_threshold)}`}>
                  {item.quantity}
                </td>
                <td>
                  <StockBadge
                    quantity={item.quantity}
                    threshold={item.low_stock_threshold}
                  />
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="inventory-table__empty-row">
                No inventory items match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});
