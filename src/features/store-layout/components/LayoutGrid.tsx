import { memo, useCallback, useMemo, useRef, useState } from "react";
import type { Cell, LayoutZone, LayoutFixture } from "../../../shared/types";
import { ck, rectToCells, getCentroid, cellsToKeySet } from "../utils";
import { findZoneColor, findFixtureType } from "../constants";
import "./LayoutGrid.css";

/* ── Types ── */

export type PlacementMode = "none" | "zone" | "fixture";
export type DrawMode = "rectangle" | "freeform";

interface LayoutGridProps {
  rows: number;
  cols: number;
  zones: LayoutZone[];
  fixtures: LayoutFixture[];

  /** Current interaction mode */
  placementMode: PlacementMode;
  drawMode: DrawMode;

  /** Freeform painted cells (lifted to parent) */
  freeformCells: Cell[];
  onFreeformCellsChange: (cells: Cell[]) => void;

  /** Edit-shape mode state */
  editingId: string | null;
  editingType: "zone" | "fixture" | null;
  editingCells: Cell[];
  onEditingCellsChange: (cells: Cell[]) => void;

  /** Which item is selected (highlighted) */
  selectedItemId: string | null;

  /** Called when rectangle drag completes */
  onRectangleComplete: (cells: Cell[]) => void;
  /** Called when a zone/fixture cell is clicked in view mode */
  onItemClick: (type: "zone" | "fixture", id: string) => void;

  showCoords?: boolean;
}

/* ── Cell info lookup ── */

interface CellInfo {
  zoneId?: string;
  zoneBg?: string;
  fixtureId?: string;
  fixtureIcon?: string;
  isOccupied: boolean;
}

function buildCellMap(
  zones: LayoutZone[],
  fixtures: LayoutFixture[],
): Map<string, CellInfo> {
  const map = new Map<string, CellInfo>();

  for (const z of zones) {
    const colorDef = findZoneColor(z.color);
    for (const cell of z.cells) {
      const key = ck(cell.row, cell.col);
      const existing = map.get(key);
      map.set(key, {
        ...existing,
        zoneId: z.id,
        zoneBg: colorDef.bg,
        isOccupied: true,
      });
    }
  }

  for (const f of fixtures) {
    const ftDef = findFixtureType(f.fixture_type);
    for (const cell of f.cells) {
      const key = ck(cell.row, cell.col);
      const existing = map.get(key);
      map.set(key, {
        ...existing,
        fixtureId: f.id,
        fixtureIcon: ftDef.icon,
        isOccupied: true,
      });
    }
  }

  return map;
}

/* ── Centroid entries ── */

interface CentroidEntry {
  key: string;
  label: string;
  type: "zone" | "fixture";
}

function buildCentroids(
  zones: LayoutZone[],
  fixtures: LayoutFixture[],
): CentroidEntry[] {
  const entries: CentroidEntry[] = [];
  for (const z of zones) {
    if (z.cells.length === 0) continue;
    const c = getCentroid(z.cells);
    entries.push({ key: ck(c.row, c.col), label: z.name, type: "zone" });
  }
  for (const f of fixtures) {
    if (f.cells.length === 0) continue;
    const c = getCentroid(f.cells);
    const ftDef = findFixtureType(f.fixture_type);
    entries.push({
      key: ck(c.row, c.col),
      label: ftDef.icon,
      type: "fixture",
    });
  }
  return entries;
}

/* ── Component ── */

const LayoutGrid = memo(function LayoutGrid({
  rows,
  cols,
  zones,
  fixtures,
  placementMode,
  drawMode,
  freeformCells,
  onFreeformCellsChange,
  editingId,
  editingType: _editingType,
  editingCells,
  onEditingCellsChange,
  selectedItemId,
  onRectangleComplete,
  onItemClick,
  showCoords = true,
}: LayoutGridProps) {
  /* — Derived maps — */
  const cellMap = useMemo(
    () => buildCellMap(zones, fixtures),
    [zones, fixtures],
  );
  const centroids = useMemo(
    () => buildCentroids(zones, fixtures),
    [zones, fixtures],
  );
  const centroidMap = useMemo(() => {
    const m = new Map<string, CentroidEntry>();
    for (const entry of centroids) m.set(entry.key, entry);
    return m;
  }, [centroids]);

  const freeformKeySet = useMemo(
    () => cellsToKeySet(freeformCells),
    [freeformCells],
  );
  const editingKeySet = useMemo(
    () => cellsToKeySet(editingCells),
    [editingCells],
  );

  /* — Rectangle drag state — */
  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [dragEnd, setDragEnd] = useState<[number, number] | null>(null);
  const isDragging = useRef(false);

  const selectionKeys = useMemo(() => {
    if (!dragStart || !dragEnd) return new Set<string>();
    const cells = rectToCells(
      dragStart[0],
      dragStart[1],
      dragEnd[0],
      dragEnd[1],
    );
    return cellsToKeySet(cells);
  }, [dragStart, dragEnd]);

  /* — Freeform paint state — */
  const freeformMouseDown = useRef(false);

  /* — Helpers — */
  const isPlacing = placementMode !== "none" && !editingId;
  const isEditing = editingId !== null;
  const isRectMode = drawMode === "rectangle";
  const isFreeformMode = drawMode === "freeform";

  /* — Mouse handlers — */
  const handleMouseDown = useCallback(
    (r: number, c: number) => {
      if (isEditing) {
        // Toggle cell in editing set
        const key = ck(r, c);
        const cellInfo = cellMap.get(key);
        // Don't allow adding a cell that belongs to ANOTHER occupied zone/fixture
        if (cellInfo?.isOccupied && !editingKeySet.has(key)) return;

        const newCells = editingKeySet.has(key)
          ? editingCells.filter(
              (cell) => ck(cell.row, cell.col) !== key,
            )
          : [...editingCells, { row: r, col: c }];
        onEditingCellsChange(newCells);
        return;
      }

      if (!isPlacing) return;

      if (isRectMode) {
        setDragStart([r, c]);
        setDragEnd([r, c]);
        isDragging.current = true;
      } else if (isFreeformMode) {
        freeformMouseDown.current = true;
        const key = ck(r, c);
        // Don't paint on occupied cells
        if (cellMap.get(key)?.isOccupied) return;
        // Toggle
        if (freeformKeySet.has(key)) {
          onFreeformCellsChange(
            freeformCells.filter(
              (cell) => ck(cell.row, cell.col) !== key,
            ),
          );
        } else {
          onFreeformCellsChange([...freeformCells, { row: r, col: c }]);
        }
      }
    },
    [
      isEditing,
      isPlacing,
      isRectMode,
      isFreeformMode,
      cellMap,
      editingKeySet,
      editingCells,
      onEditingCellsChange,
      freeformKeySet,
      freeformCells,
      onFreeformCellsChange,
    ],
  );

  const handleMouseEnter = useCallback(
    (r: number, c: number) => {
      if (isRectMode && isDragging.current) {
        setDragEnd([r, c]);
      } else if (isFreeformMode && freeformMouseDown.current && isPlacing) {
        const key = ck(r, c);
        if (cellMap.get(key)?.isOccupied) return;
        if (!freeformKeySet.has(key)) {
          onFreeformCellsChange([...freeformCells, { row: r, col: c }]);
        }
      }
    },
    [
      isRectMode,
      isFreeformMode,
      isPlacing,
      cellMap,
      freeformKeySet,
      freeformCells,
      onFreeformCellsChange,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (isRectMode && isDragging.current && dragStart && dragEnd) {
      isDragging.current = false;
      const cells = rectToCells(
        dragStart[0],
        dragStart[1],
        dragEnd[0],
        dragEnd[1],
      );
      // Filter out occupied cells
      const free = cells.filter(
        (cell) => !cellMap.get(ck(cell.row, cell.col))?.isOccupied,
      );
      setDragStart(null);
      setDragEnd(null);
      if (free.length > 0) {
        onRectangleComplete(free);
      }
    }
    freeformMouseDown.current = false;
  }, [isRectMode, dragStart, dragEnd, cellMap, onRectangleComplete]);

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (isPlacing || isEditing) return;
      const key = ck(r, c);
      const info = cellMap.get(key);
      if (!info) return;
      // Prefer fixture click, then zone
      if (info.fixtureId) {
        onItemClick("fixture", info.fixtureId);
      } else if (info.zoneId) {
        onItemClick("zone", info.zoneId);
      }
    },
    [isPlacing, isEditing, cellMap, onItemClick],
  );

  /* — Class builder — */
  const gridClass = [
    "layout-grid",
    isPlacing && "layout-grid--placing",
    isEditing && "layout-grid--editing",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={gridClass}
      style={
        {
          "--layout-cols": cols,
          "--layout-rows": rows,
        } as React.CSSProperties
      }
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const key = ck(r, c);
          const info = cellMap.get(key);
          const isSelecting = selectionKeys.has(key);
          const isFreeformSelected = freeformKeySet.has(key);
          const isEditMember = isEditing && editingKeySet.has(key);
          const isEditAddable =
            isEditing && !editingKeySet.has(key) && !info?.isOccupied;
          const isSelectedItem =
            selectedItemId !== null &&
            (info?.zoneId === selectedItemId ||
              info?.fixtureId === selectedItemId);
          const isOverlap = isSelecting && info?.isOccupied;

          const cellClass = [
            "layout-grid__cell",
            info?.zoneId && !info?.fixtureId && "layout-grid__cell--zone",
            info?.fixtureId && "layout-grid__cell--fixture",
            info?.fixtureId &&
              (() => {
                // Find the fixture to check type
                const fix = fixtures.find((f) => f.id === info.fixtureId);
                return fix?.fixture_type === "WALL"
                  ? "layout-grid__cell--fixture-wall"
                  : "";
              })(),
            isSelectedItem && "layout-grid__cell--selected-item",
            isSelecting && !isOverlap && "layout-grid__cell--selecting",
            isOverlap && "layout-grid__cell--overlap",
            isFreeformSelected && "layout-grid__cell--freeform-selected",
            isEditMember && "layout-grid__cell--editing-member",
            isEditAddable && "layout-grid__cell--editing-addable",
          ]
            .filter(Boolean)
            .join(" ");

          const centroidEntry = centroidMap.get(key);

          return (
            <div
              key={key}
              className={cellClass}
              style={
                info?.zoneBg && !info?.fixtureId
                  ? ({ "--zone-bg": info.zoneBg } as React.CSSProperties)
                  : undefined
              }
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
              onClick={() => handleCellClick(r, c)}
            >
              {centroidEntry && (
                <span
                  className={`layout-grid__centroid-label layout-grid__centroid-label--${centroidEntry.type}`}
                >
                  {centroidEntry.label}
                </span>
              )}
              {showCoords && (
                <span className="layout-grid__cell-coord">
                  {r},{c}
                </span>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
});

export default LayoutGrid;
