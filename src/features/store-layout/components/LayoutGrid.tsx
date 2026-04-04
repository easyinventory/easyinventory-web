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

  /** Editing item visual info (for coloring edit cells) */
  editingColor?: { bg: string; hex: string };
  editingLabel?: string;

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
  zoneHex?: string;
  zoneName?: string;
  fixtureId?: string;
  fixtureIcon?: string;
  fixtureName?: string;
  fixtureType?: string;
  fixtureBg?: string;
  fixtureHex?: string;
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
        zoneHex: colorDef.hex,
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
        fixtureBg: ftDef.bg,
        fixtureHex: ftDef.hex,
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
  editingType,
  editingCells,
  onEditingCellsChange,
  editingColor,
  editingLabel,
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
        // Allow re-adding cells that belong to the item being edited
        const belongsToEditingItem =
          (editingType === "zone" && cellInfo?.zoneId === editingId) ||
          (editingType === "fixture" && cellInfo?.fixtureId === editingId);
        // Don't allow adding a cell that belongs to ANOTHER occupied zone/fixture
        if (cellInfo?.isOccupied && !editingKeySet.has(key) && !belongsToEditingItem) return;

        const newCells = editingKeySet.has(key)
          ? editingCells.filter(
              (cell) => ck(cell.row, cell.col) !== key,
            )
          : [...editingCells, { row: r, col: c }];
        onEditingCellsChange(newCells);
        return;
      }

      if (!isPlacing) return;

      const key = ck(r, c);
      // Don't paint on occupied cells
      if (cellMap.get(key)?.isOccupied) return;

      freeformMouseDown.current = true;
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
      editingId,
      editingType,
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
          // A cell belongs to the item being edited but was deselected
          const isEditDeselected =
            isEditing &&
            !editingKeySet.has(key) &&
            ((editingType === "zone" && info?.zoneId === editingId) ||
              (editingType === "fixture" && info?.fixtureId === editingId));
          const isEditAddable =
            isEditing && !editingKeySet.has(key) && (!info?.isOccupied || isEditDeselected);
          const isSelectedItem =
            selectedItemId !== null &&
            !isEditDeselected &&
            (isEditMember
              ? editingId === selectedItemId
              : (info?.zoneId === selectedItemId ||
                info?.fixtureId === selectedItemId));
          const showPlus =
            (isPlacing && !info?.isOccupied && !isFreeformSelected) ||
            isEditAddable;

          const cellClass = [
            "layout-grid__cell",
            info?.zoneId && !info?.fixtureId && !isEditDeselected && "layout-grid__cell--zone",
            info?.fixtureId && !isEditDeselected && "layout-grid__cell--fixture",
            isSelectedItem && "layout-grid__cell--selected-item",
            isFreeformSelected && "layout-grid__cell--freeform-selected",
            isEditMember && "layout-grid__cell--editing-member",
            isEditMember && editingType === "zone" && "layout-grid__cell--editing-member-zone",
            isEditMember && editingType === "fixture" && "layout-grid__cell--editing-member-fixture",
            isEditAddable && "layout-grid__cell--editing-addable",
          ]
            .filter(Boolean)
            .join(" ");

          /* Label to show in every cell of the zone/fixture */
          const cellLabel = isEditMember && editingLabel
            ? editingLabel
            : isEditDeselected
              ? undefined
              : info?.fixtureId
              ? info.fixtureName
              : info?.zoneName;
          const cellLabelType = isEditMember && editingType
            ? editingType
            : info?.fixtureId ? "fixture" : "zone";

          return (
            <div
              key={key}
              className={cellClass}
              style={
                {
                  ...(info?.zoneBg &&
                    !info?.fixtureId && !isEditDeselected && {
                      "--zone-bg": info.zoneBg,
                      "--zone-hex": info.zoneHex,
                    }),
                  ...(info?.fixtureId && !isEditDeselected && {
                    "--fixture-bg": info.fixtureBg,
                    "--fixture-hex": info.fixtureHex,
                  }),
                  ...(isEditMember && editingColor && {
                    "--edit-bg": editingColor.bg,
                    "--edit-hex": editingColor.hex,
                  }),
                } as React.CSSProperties
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
