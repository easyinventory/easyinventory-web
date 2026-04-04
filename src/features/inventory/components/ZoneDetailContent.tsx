import type { ZoneInventorySummary } from "../../analytics/api/analyticsTypes";
import { useNavigate } from "react-router-dom";
import StockBadge from "./StockBadge";
import "./ZoneDetailContent.css";

interface ZoneDetailContentProps {
  zone: ZoneInventorySummary;
}

export default function ZoneDetailContent({ zone }: ZoneDetailContentProps) {
  const navigate = useNavigate();

  return (
    <div className="zone-detail-content">
      {/* ── Summary stats ── */}
      <div className="zone-detail-content__stats">
        <div className="zone-detail-content__stat">
          <span className="zone-detail-content__stat-value">{zone.total_items}</span>
          <span className="zone-detail-content__stat-label">Items</span>
        </div>
        <div className="zone-detail-content__stat">
          <span className="zone-detail-content__stat-value">{zone.total_quantity}</span>
          <span className="zone-detail-content__stat-label">Total Qty</span>
        </div>
        <div className="zone-detail-content__stat zone-detail-content__stat--warning">
          <span className="zone-detail-content__stat-value">{zone.low_stock_count}</span>
          <span className="zone-detail-content__stat-label">Low Stock</span>
        </div>
        <div className="zone-detail-content__stat zone-detail-content__stat--danger">
          <span className="zone-detail-content__stat-value">{zone.out_of_stock_count}</span>
          <span className="zone-detail-content__stat-label">Out</span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="zone-detail-content__divider" />

      {/* ── Item list ── */}
      {zone.items.length === 0 ? (
        <div className="zone-detail-content__empty">
          No inventory items in this zone.
        </div>
      ) : (
        <ul className="zone-detail-content__list">
          {zone.items.map((item) => (
            <li key={item.inventory_id} className="zone-detail-content__item">
              <button
                type="button"
                className="zone-detail-content__item-btn"
                onClick={() => navigate(`/inventory/${item.inventory_id}`, { state: { from: "heatmap", zoneId: zone.zone_id } })}
              >
                <div className="zone-detail-content__item-header">
                  <span className="zone-detail-content__item-name">
                    {item.product_name}
                  </span>
                  <StockBadge
                    quantity={item.quantity}
                    threshold={item.low_stock_threshold}
                  />
                </div>
                <div className="zone-detail-content__item-meta">
                  {item.sku && (
                    <span className="zone-detail-content__item-sku">{item.sku}</span>
                  )}
                  <span className="zone-detail-content__item-qty">
                    Qty: <strong>{item.quantity}</strong>
                    {item.low_stock_threshold !== null && (
                      <span className="zone-detail-content__item-threshold">
                        {" "}/ min {item.low_stock_threshold}
                      </span>
                    )}
                  </span>
                  <span className="zone-detail-content__item-link">
                    View details ›
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
