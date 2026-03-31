import type { FixtureType, FixtureTypeDef } from "../../../shared/types";

export const FIXTURE_TYPES: FixtureTypeDef[] = [
  { type: "WALL", label: "Wall", icon: "🧱" },
  { type: "CHECKOUT", label: "Checkout", icon: "🛒" },
  { type: "FRONT_DESK", label: "Front Desk", icon: "🛎️" },
  { type: "DOOR", label: "Door", icon: "🚪" },
  { type: "PILLAR", label: "Pillar", icon: "🏛️" },
  { type: "RESTROOM", label: "Restroom", icon: "🚻" },
  { type: "STORAGE", label: "Storage", icon: "📦" },
  { type: "STAIRS", label: "Stairs", icon: "🪜" },
];

/** Find the FixtureTypeDef for a given fixture type string. */
export function findFixtureType(type: FixtureType): FixtureTypeDef {
  return (
    FIXTURE_TYPES.find((f) => f.type === type) ?? {
      type,
      label: type,
      icon: "📍",
    }
  );
}
