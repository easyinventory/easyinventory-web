import { ck, cellsToKeySet, isRectangle } from "../grid";

describe("ck", () => {
  it("creates a deterministic key from row and col", () => {
    expect(ck(0, 0)).toBe("0,0");
    expect(ck(3, 7)).toBe("3,7");
    expect(ck(29, 29)).toBe("29,29");
  });
});

describe("cellsToKeySet", () => {
  it("returns an empty set for an empty array", () => {
    const result = cellsToKeySet([]);
    expect(result.size).toBe(0);
  });

  it("converts cells to a set of string keys", () => {
    const cells = [
      { row: 0, col: 0 },
      { row: 1, col: 2 },
      { row: 3, col: 4 },
    ];
    const result = cellsToKeySet(cells);
    expect(result.size).toBe(3);
    expect(result.has("0,0")).toBe(true);
    expect(result.has("1,2")).toBe(true);
    expect(result.has("3,4")).toBe(true);
    expect(result.has("2,2")).toBe(false);
  });

  it("deduplicates identical cells", () => {
    const cells = [
      { row: 1, col: 1 },
      { row: 1, col: 1 },
    ];
    const result = cellsToKeySet(cells);
    expect(result.size).toBe(1);
  });
});

describe("isRectangle", () => {
  it("returns false for an empty array", () => {
    expect(isRectangle([])).toBe(false);
  });

  it("returns true for a single cell", () => {
    expect(isRectangle([{ row: 0, col: 0 }])).toBe(true);
  });

  it("returns true for a 1×3 horizontal line", () => {
    const cells = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ];
    expect(isRectangle(cells)).toBe(true);
  });

  it("returns true for a 3×1 vertical line", () => {
    const cells = [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
    ];
    expect(isRectangle(cells)).toBe(true);
  });

  it("returns true for a 2×3 filled rectangle", () => {
    const cells = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ];
    expect(isRectangle(cells)).toBe(true);
  });

  it("returns false for an L-shape", () => {
    const cells = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ];
    expect(isRectangle(cells)).toBe(false);
  });

  it("returns false for a rectangle with a hole", () => {
    // 3x3 grid missing center cell
    const cells = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      // missing (1, 1)
      { row: 1, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ];
    expect(isRectangle(cells)).toBe(false);
  });

  it("returns false for scattered non-contiguous cells", () => {
    const cells = [
      { row: 0, col: 0 },
      { row: 5, col: 5 },
    ];
    expect(isRectangle(cells)).toBe(false);
  });

  it("returns true regardless of cell order", () => {
    // Same 2×2 rectangle, shuffled
    const cells = [
      { row: 1, col: 1 },
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: 1 },
    ];
    expect(isRectangle(cells)).toBe(true);
  });

  it("returns false when duplicate cells mask a missing cell", () => {
    // 2×2 bounding box but (1,1) is missing and (0,0) is duplicated
    const cells = [
      { row: 0, col: 0 },
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ];
    expect(isRectangle(cells)).toBe(false);
  });
});
