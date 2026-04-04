import { stockHealthColorScale } from "../color-scales";

describe("stockHealthColorScale", () => {
  it("returns green for value 0", () => {
    const result = stockHealthColorScale(0);
    expect(result).toContain("59, 109, 17");
  });

  it("returns red for value 1", () => {
    const result = stockHealthColorScale(1);
    expect(result).toContain("163, 45, 45");
  });

  it("clamps values above 1", () => {
    const result = stockHealthColorScale(1.5);
    expect(result).toContain("163, 45, 45");
  });

  it("clamps values below 0", () => {
    const result = stockHealthColorScale(-0.5);
    expect(result).toContain("59, 109, 17");
  });

  it("returns amber for mid-range values", () => {
    const result = stockHealthColorScale(0.5);
    expect(result).toContain("180, 120, 15");
  });

  it("returns neutral gray for NaN", () => {
    const result = stockHealthColorScale(NaN);
    expect(result).toContain("128, 128, 128");
  });

  it("returns neutral gray for Infinity", () => {
    const result = stockHealthColorScale(Infinity);
    expect(result).toContain("128, 128, 128");
  });
});
