/* ── Inventory types ── */

/** Minimal product info embedded in inventory responses */
export interface InventoryProductSummary {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
}

/** A single store inventory entry */
export interface StoreInventoryItem {
  id: string;
  store_id: string;
  product_id: string;
  quantity: number;
  unit_price: string | null; // decimal string from API (e.g. "2.9900")
  low_stock_threshold: number | null;
  created_at: string;
  updated_at: string;
  product: InventoryProductSummary;
}

/** Paginated response from GET /api/stores/{storeId}/inventory */
export interface PaginatedInventoryResponse {
  items: StoreInventoryItem[];
  total: number;
  page: number;
  page_size: number;
}

/** Request body for POST /api/stores/{storeId}/inventory */
export interface StockProductRequest {
  product_id: string;
  quantity?: number;
  unit_price?: string | null;
  low_stock_threshold?: number | null;
}

/** Request body for PATCH /api/stores/{storeId}/inventory/{entryId} */
export interface UpdateInventoryRequest {
  quantity?: number;
  unit_price?: string | null;
  low_stock_threshold?: number | null;
}

/* ── Movement types ── */

export type MovementType = "receipt" | "sale";

/** Request body for POST .../receipts */
export interface RecordReceiptRequest {
  quantity: number;
  unit_cost?: string | null;
  reference_number?: string | null;
  notes?: string | null;
}

/** Request body for POST .../sales */
export interface RecordSaleRequest {
  quantity: number;
  unit_price?: string | null;
  reference_number?: string | null;
  notes?: string | null;
}

/** An inventory movement record */
export interface InventoryMovement {
  id: string;
  store_inventory_id: string;
  movement_type: MovementType;
  quantity: number;
  unit_cost: string | null;
  unit_price: string | null;
  reference_number: string | null;
  notes: string | null;
  performed_by_user_id: string;
  created_at: string;
}

/* ── Placement types ── */

/** An inventory placement record (zone assignment history) */
export interface InventoryPlacement {
  id: string;
  store_inventory_id: string;
  zone_id: string;
  zone_name: string;
  started_at: string;
  ended_at: string | null;
  placed_by_user_id: string;
  duration_display: string | null;
  created_at: string;
}

/** Request body for PATCH .../placements */
export interface AssignZoneRequest {
  active_zone_id: string;
}
