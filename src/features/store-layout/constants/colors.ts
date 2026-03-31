import type { ZoneColorDef } from "../../../shared/types";

export const ZONE_COLORS: ZoneColorDef[] = [
  { name: "Blue", hex: "#3B82F6", bg: "#DBEAFE" },
  { name: "Green", hex: "#22C55E", bg: "#DCFCE7" },
  { name: "Amber", hex: "#F59E0B", bg: "#FEF3C7" },
  { name: "Red", hex: "#EF4444", bg: "#FEE2E2" },
  { name: "Purple", hex: "#A855F7", bg: "#F3E8FF" },
  { name: "Cyan", hex: "#06B6D4", bg: "#CFFAFE" },
  { name: "Pink", hex: "#EC4899", bg: "#FCE7F3" },
  { name: "Indigo", hex: "#6366F1", bg: "#E0E7FF" },
];

/** Find the ZoneColorDef that matches a hex value, or return a fallback. */
export function findZoneColor(hex: string): ZoneColorDef {
  return (
    ZONE_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase()) ?? {
      name: "Custom",
      hex,
      bg: `${hex}33`, // 20% opacity fallback
    }
  );
}
