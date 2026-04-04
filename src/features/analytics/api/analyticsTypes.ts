/* ── Analytics response types — Zone Inventory Summary ── */

/** Stock health classification for a single item */
export type StockStatus = "ok" | "low" | "out";

/** A single inventory item within a zone summary */
export interface ZoneInventoryItem {
  inventory_id: string;
  product_name: string;
  sku: string | null;
  category: string | null;
  quantity: number;
  low_stock_threshold: number | null;
  unit_price: string | null;
  stock_status: StockStatus;
}

/** Per-zone aggregate inventory data */
export interface ZoneInventorySummary {
  zone_id: string;
  zone_name: string;
  zone_color: string;
  cells: { row: number; col: number }[];
  total_items: number;
  total_quantity: number;
  low_stock_count: number;
  out_of_stock_count: number;
  items: ZoneInventoryItem[];
}

/** Fixture summary for heatmap rendering */
export interface FixtureSummary {
  fixture_id: string;
  fixture_name: string;
  fixture_type: string;
  cells: { row: number; col: number }[];
}

/** Unzoned items aggregate */
export interface UnzonedSummary {
  total_items: number;
  total_quantity: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

/** Full response from GET /api/stores/{storeId}/analytics/zone-inventory-summary */
export interface ZoneInventorySummaryResponse {
  layout_id: string;
  layout_version: number;
  rows: number;
  cols: number;
  zones: ZoneInventorySummary[];
  fixtures: FixtureSummary[];
  unzoned_summary: UnzonedSummary;
}
