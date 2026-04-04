import type { HeatmapColorScale } from "../../types";
import "./HeatmapLegend.css";

interface HeatmapLegendProps {
  /** Color scale function used by the grid */
  colorScale: HeatmapColorScale;
  /** Label for the low end (value = 0) */
  lowLabel?: string;
  /** Label for the high end (value = 1) */
  highLabel?: string;
}

const GRADIENT_STEPS = 10;

export default function HeatmapLegend({
  colorScale,
  lowLabel = "Healthy",
  highLabel = "Critical",
}: HeatmapLegendProps) {
  const stops = Array.from({ length: GRADIENT_STEPS + 1 }, (_, i) => {
    const val = i / GRADIENT_STEPS;
    return colorScale(val);
  });

  const gradient = `linear-gradient(to right, ${stops.join(", ")})`;

  return (
    <div className="heatmap-legend">
      <span className="heatmap-legend__label">{lowLabel}</span>
      <div className="heatmap-legend__bar" style={{ background: gradient }} />
      <span className="heatmap-legend__label">{highLabel}</span>
    </div>
  );
}
