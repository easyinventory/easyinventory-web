import { useMemo, useCallback } from "react";
import type {
  HeatmapZone,
  HeatmapFixture,
  HeatmapGridConfig,
  HeatmapColorScale,
} from "../../types";
import HeatmapDetailPanel from "./HeatmapDetailPanel";
import HeatmapLegend from "./HeatmapLegend";
import "./HeatmapGrid.css";

/* ── Cell info lookup types ── */

interface ZoneCellInfo {
  type: "zone";
  zoneId: string;
  zoneName: string;
  color: string;
}

interface FixtureCellInfo {
  type: "fixture";
  fixtureType: string;
}

type CellInfo = ZoneCellInfo | FixtureCellInfo;

function ck(row: number, col: number): string {
  return `${row},${col}`;
}

/* ── Props ── */

export interface HeatmapGridProps {
  /** Grid dimensions */
  config: HeatmapGridConfig;
  /** Zones with heat metric values */
  zones: HeatmapZone[];
  /** Fixtures (rendered as non-interactive dark cells) */
  fixtures: HeatmapFixture[];
  /** Maps heat value (0–1) to CSS color */
  colorScale: HeatmapColorScale;
  /** Currently selected zone ID */
  selectedZoneId: string | null;
  /** Called when a zone cell is clicked */
  onZoneClick: (zoneId: string) => void;
  /** Content for the detail panel */
  renderDetail: (zone: HeatmapZone | null) => React.ReactNode;
  /** Legend labels */
  legendLowLabel?: string;
  legendHighLabel?: string;
  /** Empty-state label for detail panel */
  detailEmptyLabel?: string;
}

export default function HeatmapGrid({
  config,
  zones,
  fixtures,
  colorScale,
  selectedZoneId,
  onZoneClick,
  renderDetail,
  legendLowLabel,
  legendHighLabel,
  detailEmptyLabel,
}: HeatmapGridProps) {
  /* ── Pre-compute cell lookup map ── */
  const cellMap = useMemo(() => {
    const map = new Map<string, CellInfo>();

    for (const zone of zones) {
      const heatColor = colorScale(zone.heatValue);
      for (const cell of zone.cells) {
        map.set(ck(cell.row, cell.col), {
          type: "zone",
          zoneId: zone.id,
          zoneName: zone.name,
          color: heatColor,
        });
      }
    }

    for (const fixture of fixtures) {
      for (const cell of fixture.cells) {
        map.set(ck(cell.row, cell.col), {
          type: "fixture",
          fixtureType: fixture.fixtureType,
        });
      }
    }

    return map;
  }, [zones, fixtures, colorScale]);

  /* ── Compute label placement: one label per zone on its center cell ── */
  const zoneLabelCells = useMemo(() => {
    const labels = new Map<string, string>(); // cell key → zone name
    for (const zone of zones) {
      if (zone.cells.length === 0) continue;
      // Find centroid
      let sumR = 0, sumC = 0;
      for (const c of zone.cells) { sumR += c.row; sumC += c.col; }
      const avgR = sumR / zone.cells.length;
      const avgC = sumC / zone.cells.length;
      // Find the cell closest to centroid
      let bestCell = zone.cells[0];
      let bestDist = Infinity;
      for (const c of zone.cells) {
        const dist = Math.abs(c.row - avgR) + Math.abs(c.col - avgC);
        if (dist < bestDist) { bestDist = dist; bestCell = c; }
      }
      labels.set(ck(bestCell.row, bestCell.col), zone.name);
    }
    return labels;
  }, [zones]);

  /* ── Build tooltip text per zone cell ── */
  const zoneTooltipMap = useMemo(() => {
    const tips = new Map<string, string>(); // zoneId → tooltip text
    for (const zone of zones) {
      if (zone.tooltipText) {
        tips.set(zone.id, zone.tooltipText);
      }
    }
    return tips;
  }, [zones]);

  /* ── Selected zone object ── */
  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) ?? null,
    [zones, selectedZoneId],
  );

  /* ── Cell click handler ── */
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const info = cellMap.get(ck(row, col));
      if (info?.type === "zone") {
        onZoneClick(info.zoneId);
      }
    },
    [cellMap, onZoneClick],
  );

  /* ── Build cell grid ── */
  const cells: React.ReactNode[] = [];
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const info = cellMap.get(ck(row, col));
      let className = "heatmap-grid__cell";
      let style: React.CSSProperties | undefined;
      let isZone = false;

      if (info?.type === "zone") {
        className += " heatmap-grid__cell--zone";
        if (info.zoneId === selectedZoneId) {
          className += " heatmap-grid__cell--selected";
        }
        style = { backgroundColor: info.color };
        isZone = true;
      } else if (info?.type === "fixture") {
        className += " heatmap-grid__cell--fixture";
        if (info.fixtureType === "WALL") {
          className += " heatmap-grid__cell--fixture-wall";
        }
      }

      cells.push(
        <div
          key={ck(row, col)}
          className={className}
          style={style}
          onClick={isZone ? () => handleCellClick(row, col) : undefined}
          role={isZone ? "button" : undefined}
          tabIndex={isZone ? 0 : undefined}
          onKeyDown={
            isZone
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCellClick(row, col);
                  }
                }
              : undefined
          }
          aria-label={
            isZone && info?.type === "zone"
              ? `${info.zoneName} zone, row ${row + 1}, column ${col + 1}`
              : undefined
          }
          aria-pressed={isZone && info?.type === "zone" ? info.zoneId === selectedZoneId : undefined}
        >
          {isZone && info?.type === "zone" && zoneTooltipMap.has(info.zoneId) && (
            <span className="heatmap-grid__tooltip">{zoneTooltipMap.get(info.zoneId)}</span>
          )}
          {zoneLabelCells.has(ck(row, col)) ? (
            <span className="heatmap-grid__zone-label">
              {zoneLabelCells.get(ck(row, col))}
            </span>
          ) : null}
        </div>,
      );
    }
  }

  return (
    <div className="heatmap-layout">
      {/* ── Top bar: legend ── */}
      <div className="heatmap-layout__toolbar">
        <HeatmapLegend
          colorScale={colorScale}
          lowLabel={legendLowLabel}
          highLabel={legendHighLabel}
        />
      </div>

      {/* ── Main content: grid + detail panel ── */}
      <div className="heatmap-layout__body">
        <div className="heatmap-layout__grid-wrapper">
          <div
            className="heatmap-grid"
            style={{
              "--heatmap-cols": config.cols,
              "--heatmap-rows": config.rows,
            } as React.CSSProperties}
          >
            {cells}
          </div>
        </div>

        <div className="heatmap-layout__panel">
          <HeatmapDetailPanel zone={selectedZone} emptyLabel={detailEmptyLabel}>
            {renderDetail(selectedZone)}
          </HeatmapDetailPanel>
        </div>
      </div>
    </div>
  );
}
