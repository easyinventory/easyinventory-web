import type { Cell } from "../../../shared/types";

/** Create a deterministic string key for a cell: "row,col" */
export function ck(row: number, col: number): string {
  return `${row},${col}`;
}

/** Convert a Cell[] to a Set of cell-key strings. */
export function cellsToKeySet(cells: Cell[]): Set<string> {
  return new Set(cells.map((c) => ck(c.row, c.col)));
}

/** Get the bounding box of a set of cells. */
function getBounds(cells: Cell[]): {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
} {
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;
  for (const { row, col } of cells) {
    if (row < minRow) minRow = row;
    if (row > maxRow) maxRow = row;
    if (col < minCol) minCol = col;
    if (col > maxCol) maxCol = col;
  }
  return { minRow, maxRow, minCol, maxCol };
}

/**
 * Return true if the given cells form a perfect filled rectangle
 * (no holes, no L-shapes).
 */
export function isRectangle(cells: Cell[]): boolean {
  if (cells.length === 0) return false;
  const unique = cellsToKeySet(cells);
  const { minRow, maxRow, minCol, maxCol } = getBounds(cells);
  const expectedCount = (maxRow - minRow + 1) * (maxCol - minCol + 1);
  return unique.size === expectedCount;
}
