/* ── Heatmap types — generic interfaces for the reusable heatmap grid ── */

import type { Cell } from "./store";

/** A zone with a heat metric value for the heatmap grid. */
export interface HeatmapZone {
  /** Unique zone identifier */
  id: string;
  /** Display name */
  name: string;
  /** Original zone color (hex) — used for the detail panel accent */
  color: string;
  /** Grid cells belonging to this zone */
  cells: Cell[];
  /** Normalized metric value: 0.0 (best) to 1.0 (worst) */
  heatValue: number;
}

/** A fixture rendered as a non-interactive cell on the heatmap. */
export interface HeatmapFixture {
  id: string;
  name: string;
  fixtureType: string;
  cells: Cell[];
}

/** Configuration for the heatmap grid dimensions. */
export interface HeatmapGridConfig {
  rows: number;
  cols: number;
}

/** Color scale function: maps a heat value (0–1) to a CSS color string. */
export type HeatmapColorScale = (heatValue: number) => string;
