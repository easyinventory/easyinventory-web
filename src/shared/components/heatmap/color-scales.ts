/**
 * Predefined color scales for common heatmap metrics.
 *
 * Each function takes a value from 0 (best) to 1 (worst) and returns
 * a CSS color string. Add new scales here as new analytics metrics
 * are introduced.
 */

import type { HeatmapColorScale } from "../../types";

/**
 * Stock health color scale.
 *
 * 0.0 → green (all items healthy)
 * 0.5 → amber/yellow (some items below threshold)
 * 1.0 → red (critical — most items low or out of stock)
 *
 * Zones with no inventory items get a neutral gray.
 */
export const stockHealthColorScale: HeatmapColorScale = (value: number) => {
  // Non-finite values (NaN, Infinity) → neutral gray (no data)
  if (!Number.isFinite(value)) {
    return "rgba(128, 128, 128, 0.25)";
  }

  // Clamp
  const v = Math.max(0, Math.min(1, value));

  if (v <= 0.0) {
    // Healthy — green
    return "rgba(59, 109, 17, 0.35)";  // --color-success base
  }
  if (v <= 0.25) {
    // Mostly healthy — light yellow-green
    return "rgba(120, 150, 20, 0.35)";
  }
  if (v <= 0.5) {
    // Mixed — amber
    return "rgba(180, 120, 15, 0.45)";
  }
  if (v <= 0.75) {
    // Mostly low — orange
    return "rgba(210, 80, 20, 0.50)";
  }
  // Critical — red
  return "rgba(163, 45, 45, 0.55)";     // --color-danger base
};
