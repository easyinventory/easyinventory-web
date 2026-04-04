import type { HeatmapZone } from "../../types";
import "./HeatmapDetailPanel.css";

interface HeatmapDetailPanelProps {
  /** Currently selected zone, or null */
  zone: HeatmapZone | null;
  /** Metric-specific content rendered inside the panel */
  children?: React.ReactNode;
  /** Label shown when no zone is selected */
  emptyLabel?: string;
}

export default function HeatmapDetailPanel({
  zone,
  children,
  emptyLabel = "Click a zone to view details",
}: HeatmapDetailPanelProps) {
  if (!zone) {
    return (
      <div className="heatmap-detail">
        <div className="heatmap-detail__empty">
          <span className="heatmap-detail__empty-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
              <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" />
              <path d="M2.5 7.5 L17.5 7.5" />
              <path d="M8.5 7.5 L8.5 17.5" />
            </svg>
          </span>
          <span className="heatmap-detail__empty-text">{emptyLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="heatmap-detail">
      <div className="heatmap-detail__header">
        <span
          className="heatmap-detail__color-dot"
          style={{ background: zone.color }}
        />
        <h3 className="heatmap-detail__title">{zone.name}</h3>
        <span className="heatmap-detail__cell-count">
          {zone.cells.length} cell{zone.cells.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="heatmap-detail__divider" />
      <div className="heatmap-detail__content">{children}</div>
    </div>
  );
}
