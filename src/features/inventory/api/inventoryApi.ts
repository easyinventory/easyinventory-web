import apiClient from "../../../shared/api/client";
import type {
  StoreInventoryItem,
  PaginatedInventoryResponse,
  StockProductRequest,
  UpdateInventoryRequest,
  RecordReceiptRequest,
  RecordSaleRequest,
  InventoryMovement,
  InventoryPlacement,
  AssignZoneRequest,
} from "../../../shared/types";

export type {
  StoreInventoryItem,
  PaginatedInventoryResponse,
  StockProductRequest,
  UpdateInventoryRequest,
  RecordReceiptRequest,
  RecordSaleRequest,
  InventoryMovement,
  InventoryPlacement,
  AssignZoneRequest,
};

/* ── Inventory query params ── */

export interface InventoryListParams {
  search?: string;
  category?: string;
  page?: number;
  page_size?: number;
}

/* ── Inventory CRUD ── */

export async function listInventory(
  storeId: string,
  params: InventoryListParams = {},
): Promise<PaginatedInventoryResponse> {
  const response = await apiClient.get(
    `/api/stores/${storeId}/inventory`,
    { params },
  );
  return response.data;
}

export async function getInventoryEntry(
  storeId: string,
  entryId: string,
): Promise<StoreInventoryItem> {
  const response = await apiClient.get(
    `/api/stores/${storeId}/inventory/${entryId}`,
  );
  return response.data;
}

export async function stockProduct(
  storeId: string,
  data: StockProductRequest,
): Promise<StoreInventoryItem> {
  const response = await apiClient.post(
    `/api/stores/${storeId}/inventory`,
    data,
  );
  return response.data;
}

export async function updateInventoryEntry(
  storeId: string,
  entryId: string,
  data: UpdateInventoryRequest,
): Promise<StoreInventoryItem> {
  const response = await apiClient.patch(
    `/api/stores/${storeId}/inventory/${entryId}`,
    data,
  );
  return response.data;
}

export async function deleteInventoryEntry(
  storeId: string,
  entryId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/stores/${storeId}/inventory/${entryId}`,
  );
}

/* ── Inventory movements ── */

export async function recordReceipt(
  storeId: string,
  entryId: string,
  data: RecordReceiptRequest,
): Promise<InventoryMovement> {
  const response = await apiClient.post(
    `/api/stores/${storeId}/inventory/${entryId}/receipts`,
    data,
  );
  return response.data;
}

export async function recordSale(
  storeId: string,
  entryId: string,
  data: RecordSaleRequest,
): Promise<InventoryMovement> {
  const response = await apiClient.post(
    `/api/stores/${storeId}/inventory/${entryId}/sales`,
    data,
  );
  return response.data;
}

/**
 * Fetch movement history for an inventory entry.
 *
 * ⚠️  BACKEND BLOCKER: The GET endpoint for movements does not exist yet.
 *     This function will 404 until the backend adds:
 *     GET /api/stores/{storeId}/inventory/{entryId}/movements
 */
export async function listMovements(
  storeId: string,
  entryId: string,
): Promise<InventoryMovement[]> {
  const response = await apiClient.get(
    `/api/stores/${storeId}/inventory/${entryId}/movements`,
  );
  return response.data;
}

/* ── Inventory placements ── */

export async function listPlacements(
  storeId: string,
  entryId: string,
): Promise<InventoryPlacement[]> {
  const response = await apiClient.get(
    `/api/stores/${storeId}/inventory/${entryId}/placements`,
  );
  return response.data;
}

export async function assignZone(
  storeId: string,
  entryId: string,
  data: AssignZoneRequest,
): Promise<InventoryPlacement> {
  const response = await apiClient.patch(
    `/api/stores/${storeId}/inventory/${entryId}/placements`,
    data,
  );
  return response.data;
}

export async function removeFromZone(
  storeId: string,
  entryId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/stores/${storeId}/inventory/${entryId}/placements/current`,
  );
}
