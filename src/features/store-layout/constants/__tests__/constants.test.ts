import { ZONE_COLORS, findZoneColor } from "../colors";
import { FIXTURE_TYPES, findFixtureType } from "../fixtures";

describe("ZONE_COLORS", () => {
  it("has 8 color options", () => {
    expect(ZONE_COLORS).toHaveLength(8);
  });

  it("each color has name, hex, and bg properties", () => {
    for (const color of ZONE_COLORS) {
      expect(color.name).toBeTruthy();
      expect(color.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(color.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("has no duplicate hex values", () => {
    const hexes = ZONE_COLORS.map((c) => c.hex);
    expect(new Set(hexes).size).toBe(hexes.length);
  });
});

describe("findZoneColor", () => {
  it("finds a known color by hex (case-insensitive)", () => {
    const result = findZoneColor("#3b82f6");
    expect(result.name).toBe("Blue");
    expect(result.hex).toBe("#3B82F6");
  });

  it("finds a known color with uppercase hex", () => {
    const result = findZoneColor("#3B82F6");
    expect(result.name).toBe("Blue");
  });

  it("returns a fallback for an unknown hex", () => {
    const result = findZoneColor("#AABBCC");
    expect(result.name).toBe("Custom");
    expect(result.hex).toBe("#AABBCC");
    expect(result.bg).toBe("#AABBCC33");
  });
});

describe("FIXTURE_TYPES", () => {
  it("has 8 fixture types", () => {
    expect(FIXTURE_TYPES).toHaveLength(8);
  });

  it("each type has type, label, icon, hex, and bg", () => {
    for (const ft of FIXTURE_TYPES) {
      expect(ft.type).toBeTruthy();
      expect(ft.label).toBeTruthy();
      expect(ft.icon).toBeTruthy();
      expect(ft.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(ft.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("includes expected types", () => {
    const types = FIXTURE_TYPES.map((f) => f.type);
    expect(types).toContain("WALL");
    expect(types).toContain("CHECKOUT");
    expect(types).toContain("DOOR");
    expect(types).toContain("PILLAR");
    expect(types).toContain("STAIRS");
  });

  it("has no duplicate types", () => {
    const types = FIXTURE_TYPES.map((f) => f.type);
    expect(new Set(types).size).toBe(types.length);
  });
});

describe("findFixtureType", () => {
  it("finds WALL fixture type", () => {
    const result = findFixtureType("WALL");
    expect(result.type).toBe("WALL");
    expect(result.label).toBe("Wall");
    expect(result.icon).toBe("🧱");
  });

  it("finds CHECKOUT fixture type", () => {
    const result = findFixtureType("CHECKOUT");
    expect(result.type).toBe("CHECKOUT");
    expect(result.label).toBe("Checkout Counter");
  });

  it("returns fallback for unknown fixture type", () => {
    // Cast to bypass TS union check for testing the runtime fallback
    const result = findFixtureType("UNKNOWN" as never);
    expect(result.type).toBe("UNKNOWN");
    expect(result.icon).toBe("📍");
  });
});
