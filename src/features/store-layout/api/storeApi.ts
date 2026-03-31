import apiClient from "../../../shared/api/client";
import type { Store } from "../../../shared/types";

export type { Store };

export async function listStores(): Promise<Store[]> {
  const response = await apiClient.get("/api/stores");
  return response.data;
}
