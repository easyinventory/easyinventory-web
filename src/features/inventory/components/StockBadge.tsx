import { memo } from "react";
import "./StockBadge.css";

interface StockBadgeProps {
  quantity: number;
  threshold: number | null;
}

export default memo(function StockBadge({ quantity, threshold }: StockBadgeProps) {
  if (quantity === 0) {
    return (
      <span className="stock-badge stock-badge--danger">
        <span className="stock-badge__dot" />
        Out of Stock
      </span>
    );
  }

  if (threshold !== null && quantity <= threshold) {
    return (
      <span className="stock-badge stock-badge--warning">
        <span className="stock-badge__dot" />
        Low Stock
      </span>
    );
  }

  return (
    <span className="stock-badge stock-badge--success">
      <span className="stock-badge__dot" />
      In Stock
    </span>
  );
});
