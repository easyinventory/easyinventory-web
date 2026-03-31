import apiClient from "../../../shared/api/client";
import type { Store, StoreLayout } from "../../../shared/types";

export type { Store, StoreLayout };

export async function listStores(): Promise<Store[]> {
  const response = await apiClient.get("/api/stores");
  return response.data;
}

export async function listLayouts(storeId: string): Promise<StoreLayout[]> {
  const response = await apiClient.get(`/api/stores/${storeId}/layouts`);
  return response.data;
}

export async function createLayout(
  storeId: string,
  rows: number,
  cols: number
): Promise<StoreLayout> {
  const response = await apiClient.post(`/api/stores/${storeId}/layouts`, {
    rows,
    cols,
  });
  return response.data;
}

export async function activateLayout(
  storeId: string,
  layoutId: string
): Promise<StoreLayout> {
  const response = await apiClient.post(
    `/api/stores/${storeId}/layouts/${layoutId}/activate`
  );
  return response.data;
}
