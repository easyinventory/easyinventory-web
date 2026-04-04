import type { ZoneInventorySummaryResponse } from "../../analytics/api/analyticsTypes";
import "./HeatmapSummaryBar.css";

interface HeatmapSummaryBarProps {
  data: ZoneInventorySummaryResponse;
}

export default function HeatmapSummaryBar({ data }: HeatmapSummaryBarProps) {
  const totalItems =
    data.zones.reduce((sum, z) => sum + z.total_items, 0) +
    data.unzoned_summary.total_items;

  const lowStock =
    data.zones.reduce((sum, z) => sum + z.low_stock_count, 0) +
    data.unzoned_summary.low_stock_count;

  const outOfStock =
    data.zones.reduce((sum, z) => sum + z.out_of_stock_count, 0) +
    data.unzoned_summary.out_of_stock_count;

  const inStock = totalItems - lowStock - outOfStock;

  return (
    <div className="heatmap-summary">
      <div className="heatmap-summary__card">
        <span className="heatmap-summary__value">{totalItems}</span>
        <span className="heatmap-summary__label">Total items stocked</span>
      </div>
      <div className="heatmap-summary__card">
        <span className="heatmap-summary__value heatmap-summary__value--success">
          {inStock}
        </span>
        <span className="heatmap-summary__label">In stock</span>
      </div>
      <div className="heatmap-summary__card">
        <span className="heatmap-summary__value heatmap-summary__value--warning">
          {lowStock}
        </span>
        <span className="heatmap-summary__label">Low stock</span>
      </div>
      <div className="heatmap-summary__card">
        <span className="heatmap-summary__value heatmap-summary__value--danger">
          {outOfStock}
        </span>
        <span className="heatmap-summary__label">Out of stock</span>
      </div>
    </div>
  );
}
