export interface Store {
  id: string;
  name: string;
  org_id: string;
  created_at: string;
}

export interface StoreLayout {
  id: string;
  store_id: string;
  version_number: number;
  rows: number;
  cols: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  zones: LayoutZone[];
  fixtures: LayoutFixture[];
}

/* ── Grid cell ── */

export interface Cell {
  row: number;
  col: number;
}

/* ── Zone ── */

export interface LayoutZone {
  id: string;
  layout_version_id: string;
  name: string;
  color: string; // hex e.g. "#3B82F6"
  cells: Cell[];
  is_freeform?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZoneCreateRequest {
  name: string;
  color: string;
  cells: Cell[];
  is_freeform?: boolean;
}

export interface ZoneUpdateRequest {
  name?: string;
  color?: string;
  cells?: Cell[];
}

/* ── Fixture ── */

export type FixtureType =
  | "WALL"
  | "CHECKOUT"
  | "FRONT_DESK"
  | "DOOR"
  | "PILLAR"
  | "RESTROOM"
  | "STORAGE"
  | "STAIRS";

export interface LayoutFixture {
  id: string;
  layout_version_id: string;
  zone_id?: string | null;
  name: string;
  fixture_type: FixtureType;
  cells: Cell[];
  created_at: string;
  updated_at: string;
}

export interface FixtureCreateRequest {
  name: string;
  fixture_type: FixtureType;
  cells: Cell[];
  zone_id?: string | null;
}

export interface FixtureUpdateRequest {
  name?: string;
  fixture_type?: FixtureType;
  cells?: Cell[];
  zone_id?: string | null;
}

/* ── UI helpers ── */

export interface ZoneColorDef {
  name: string;
  hex: string;
  bg: string; // lighter background for cells
}

export interface FixtureTypeDef {
  type: FixtureType;
  label: string;
  icon: string; // emoji
  hex: string;  // accent color
  bg: string;   // light fill
}
