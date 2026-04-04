import apiClient from "../../../shared/api/client";
import type { ZoneInventorySummaryResponse } from "./analyticsTypes";

/**
 * Fetch zone-level inventory summary for the store's active layout.
 *
 * Powers the Inventory Heatmap view.
 */
export async function getZoneInventorySummary(
  storeId: string,
): Promise<ZoneInventorySummaryResponse> {
  const response = await apiClient.get<ZoneInventorySummaryResponse>(
    `/api/stores/${storeId}/analytics/zone-inventory-summary`,
  );
  return response.data;
}
