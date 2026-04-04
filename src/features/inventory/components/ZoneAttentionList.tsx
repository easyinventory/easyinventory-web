import type { ZoneInventorySummaryResponse } from "../../analytics/api/analyticsTypes";
import StockBadge from "./StockBadge";
import "./ZoneAttentionList.css";

interface ZoneAttentionListProps {
  data: ZoneInventorySummaryResponse;
  selectedZoneId: string | null;
  onZoneClick: (zoneId: string) => void;
}

export default function ZoneAttentionList({
  data,
  selectedZoneId,
  onZoneClick,
}: ZoneAttentionListProps) {
  // Filter to zones with issues, sort worst-first
  const alertZones = data.zones
    .filter((z) => z.low_stock_count > 0 || z.out_of_stock_count > 0)
    .map((z) => ({
      ...z,
      severity: (z.low_stock_count + z.out_of_stock_count) / Math.max(z.total_items, 1),
    }))
    .sort((a, b) => b.severity - a.severity);

  if (alertZones.length === 0) return null;

  return (
    <div className="zone-attention">
      <div className="zone-attention__header">
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          width="14"
          height="14"
          className="zone-attention__icon"
        >
          <path d="M8 1l7 13H1L8 1zm0 4v4m0 2v1" />
        </svg>
        Zones needing attention
      </div>
      <div className="zone-attention__list">
        {alertZones.map((z) => {
          const isSelected = z.zone_id === selectedZoneId;

          let alertLabel = "";
          if (z.out_of_stock_count > 0 && z.low_stock_count > 0) {
            alertLabel = `${z.out_of_stock_count} out, ${z.low_stock_count} low`;
          } else if (z.out_of_stock_count > 0) {
            alertLabel = `${z.out_of_stock_count} out of stock`;
          } else if (z.low_stock_count > 0) {
            alertLabel = `${z.low_stock_count} low stock`;
          }

          // Determine worst status for the badge
          const worstQty = z.out_of_stock_count > 0 ? 0 : 1;
          const worstThreshold = z.out_of_stock_count > 0 ? 1 : 2;

          return (
            <button
              key={z.zone_id}
              className={`zone-attention__row ${isSelected ? "zone-attention__row--selected" : ""}`}
              onClick={() => onZoneClick(z.zone_id)}
            >
              <span
                className="zone-attention__dot"
                style={{ background: z.zone_color }}
              />
              <span className="zone-attention__name">{z.zone_name}</span>
              <span className="zone-attention__count">{alertLabel}</span>
              <StockBadge quantity={worstQty} threshold={worstThreshold} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
