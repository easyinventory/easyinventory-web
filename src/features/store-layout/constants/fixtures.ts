import type { FixtureType, FixtureTypeDef } from "../../../shared/types";

export const FIXTURE_TYPES: FixtureTypeDef[] = [
  { type: "WALL", label: "Wall", icon: "🧱", hex: "#6b7280", bg: "#f3f4f6" },
  { type: "CHECKOUT", label: "Checkout Counter", icon: "🛒", hex: "#d97706", bg: "#fef3c7" },
  { type: "FRONT_DESK", label: "Front Desk", icon: "🛎️", hex: "#2563eb", bg: "#dbeafe" },
  { type: "DOOR", label: "Door / Entrance", icon: "🚪", hex: "#16a34a", bg: "#dcfce7" },
  { type: "PILLAR", label: "Pillar", icon: "🏛️", hex: "#78716c", bg: "#f5f5f4" },
  { type: "RESTROOM", label: "Restroom", icon: "🚻", hex: "#7c3aed", bg: "#ede9fe" },
  { type: "STORAGE", label: "Storage", icon: "📦", hex: "#ca8a04", bg: "#fefce8" },
  { type: "STAIRS", label: "Stairs", icon: "🪜", hex: "#0891b2", bg: "#cffafe" },
];

/** Find the FixtureTypeDef for a given fixture type string. */
export function findFixtureType(type: FixtureType): FixtureTypeDef {
  return (
    FIXTURE_TYPES.find((f) => f.type === type) ?? {
      type,
      label: type,
      icon: "📍",
      hex: "#6b7280",
      bg: "#f3f4f6",
    }
  );
}
