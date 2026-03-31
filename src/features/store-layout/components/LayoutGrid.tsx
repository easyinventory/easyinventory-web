import { memo, useCallback, useMemo, useRef } from "react";
import type { Cell, LayoutZone, LayoutFixture } from "../../../shared/types";
import { ck, cellsToKeySet } from "../utils";
import { findZoneColor, findFixtureType } from "../constants";
import "./LayoutGrid.css";

/* ── Types ── */

export type PlacementMode = "none" | "zone" | "fixture";

interface LayoutGridProps {
  rows: number;
  cols: number;
  zones: LayoutZone[];
  fixtures: LayoutFixture[];

  /** Current interaction mode */
  placementMode: PlacementMode;

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

  /** Called when a zone/fixture cell is clicked in view mode */
  onItemClick: (type: "zone" | "fixture", id: string) => void;
  /** Called when a zone/fixture cell is double-clicked in view mode */
  onItemDoubleClick: (type: "zone" | "fixture", id: string) => void;

  showCoords?: boolean;
}

/* ── Cell info lookup ── */

interface CellInfo {
  zoneId?: string;
  zoneBg?: string;
  zoneName?: string;
  fixtureId?: string;
  fixtureIcon?: string;
  fixtureName?: string;
  fixtureType?: string;
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
        zoneName: z.name,
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
        fixtureName: f.name,
        fixtureType: f.fixture_type,
        isOccupied: true,
      });
    }
  }

  return map;
}



/* ── Component ── */

const LayoutGrid = memo(function LayoutGrid({
  rows,
  cols,
  zones,
  fixtures,
  placementMode,
  freeformCells,
  onFreeformCellsChange,
  editingId,
  editingType: _editingType,
  editingCells,
  onEditingCellsChange,
  selectedItemId,
  onItemClick,
  onItemDoubleClick,
  showCoords = true,
}: LayoutGridProps) {
  /* — Derived maps — */
  const cellMap = useMemo(
    () => buildCellMap(zones, fixtures),
    [zones, fixtures],
  );


  const freeformKeySet = useMemo(
    () => cellsToKeySet(freeformCells),
    [freeformCells],
  );
  const editingKeySet = useMemo(
    () => cellsToKeySet(editingCells),
    [editingCells],
  );

  /* — Freeform paint state — */
  const freeformMouseDown = useRef(false);

  /* — Helpers — */
  const isPlacing = placementMode !== "none" && !editingId;
  const isEditing = editingId !== null;

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
    },
    [
      isEditing,
      isPlacing,
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
      if (freeformMouseDown.current && isPlacing) {
        const key = ck(r, c);
        if (cellMap.get(key)?.isOccupied) return;
        if (!freeformKeySet.has(key)) {
          onFreeformCellsChange([...freeformCells, { row: r, col: c }]);
        }
      }
    },
    [
      isPlacing,
      cellMap,
      freeformKeySet,
      freeformCells,
      onFreeformCellsChange,
    ],
  );

  const handleMouseUp = useCallback(() => {
    freeformMouseDown.current = false;
  }, []);

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (isPlacing || isEditing) return;
      const key = ck(r, c);
      const info = cellMap.get(key);
      if (!info) return;
      if (info.fixtureId) {
        onItemClick("fixture", info.fixtureId);
      } else if (info.zoneId) {
        onItemClick("zone", info.zoneId);
      }
    },
    [isPlacing, isEditing, cellMap, onItemClick],
  );

  const handleCellDoubleClick = useCallback(
    (r: number, c: number) => {
      if (isPlacing || isEditing) return;
      const key = ck(r, c);
      const info = cellMap.get(key);
      if (!info) return;
      if (info.fixtureId) {
        onItemDoubleClick("fixture", info.fixtureId);
      } else if (info.zoneId) {
        onItemDoubleClick("zone", info.zoneId);
      }
    },
    [isPlacing, isEditing, cellMap, onItemDoubleClick],
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
          const isFreeformSelected = freeformKeySet.has(key);
          const isEditMember = isEditing && editingKeySet.has(key);
          const isEditAddable =
            isEditing && !editingKeySet.has(key) && !info?.isOccupied;
          const isSelectedItem =
            selectedItemId !== null &&
            (info?.zoneId === selectedItemId ||
              info?.fixtureId === selectedItemId);
          const showPlus =
            (isPlacing && !info?.isOccupied && !isFreeformSelected) ||
            isEditAddable;

          const cellClass = [
            "layout-grid__cell",
            info?.zoneId && !info?.fixtureId && "layout-grid__cell--zone",
            info?.fixtureId && "layout-grid__cell--fixture",
            info?.fixtureId &&
              (() => {
                const fix = fixtures.find((f) => f.id === info.fixtureId);
                return fix?.fixture_type === "WALL"
                  ? "layout-grid__cell--fixture-wall"
                  : "";
              })(),
            isSelectedItem && "layout-grid__cell--selected-item",
            isFreeformSelected && "layout-grid__cell--freeform-selected",
            isEditMember && "layout-grid__cell--editing-member",
            isEditAddable && "layout-grid__cell--editing-addable",
          ]
            .filter(Boolean)
            .join(" ");

          /* Label to show in every cell of the zone/fixture */
          const cellLabel = info?.fixtureId
            ? info.fixtureName
            : info?.zoneName;
          const cellLabelType = info?.fixtureId ? "fixture" : "zone";

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
              onDoubleClick={() => handleCellDoubleClick(r, c)}
            >
              {showPlus && (
                <span className="layout-grid__cell-plus">+</span>
              )}
              {cellLabel && (
                <span
                  className={`layout-grid__cell-label layout-grid__cell-label--${cellLabelType}`}
                >
                  {cellLabel}
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
