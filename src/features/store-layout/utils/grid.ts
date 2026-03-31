import type { Cell } from "../../../shared/types";

/** Create a deterministic string key for a cell: "row,col" */
export function ck(row: number, col: number): string {
  return `${row},${col}`;
}

/** Parse a cell key back into [row, col]. */
export function parseCk(key: string): [number, number] {
  const [r, c] = key.split(",").map(Number);
  return [r, c];
}

/** Convert a Cell[] to a Set of cell-key strings. */
export function cellsToKeySet(cells: Cell[]): Set<string> {
  return new Set(cells.map((c) => ck(c.row, c.col)));
}

/** Build all Cell objects for a rectangle defined by two corners. */
export function rectToCells(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): Cell[] {
  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);
  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);
  const cells: Cell[] = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      cells.push({ row: r, col: c });
    }
  }
  return cells;
}

/** Get the bounding box of a set of cells. */
export function getBounds(cells: Cell[]): {
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

/** Return the center cell (rounded) of a set of cells. */
export function getCentroid(cells: Cell[]): Cell {
  const sumR = cells.reduce((s, c) => s + c.row, 0);
  const sumC = cells.reduce((s, c) => s + c.col, 0);
  return {
    row: Math.round(sumR / cells.length),
    col: Math.round(sumC / cells.length),
  };
}

/**
 * Return true if the given cells form a perfect filled rectangle
 * (no holes, no L-shapes).
 */
export function isRectangle(cells: Cell[]): boolean {
  if (cells.length === 0) return false;
  const { minRow, maxRow, minCol, maxCol } = getBounds(cells);
  const expectedCount = (maxRow - minRow + 1) * (maxCol - minCol + 1);
  return cells.length === expectedCount;
}
