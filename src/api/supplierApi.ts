import apiClient from "./client";
import type {
  Supplier,
  SupplierCreateRequest,
  SupplierUpdateRequest,
} from "../types";

export type { Supplier, SupplierCreateRequest, SupplierUpdateRequest };

export async function listSuppliers(): Promise<Supplier[]> {
  const response = await apiClient.get("/api/suppliers");
  return response.data;
}

export async function getSupplier(id: string): Promise<Supplier> {
  const response = await apiClient.get(`/api/suppliers/${id}`);
  return response.data;
}

export async function createSupplier(
  data: SupplierCreateRequest
): Promise<Supplier> {
  const response = await apiClient.post("/api/suppliers", data);
  return response.data;
}

export async function updateSupplier(
  id: string,
  data: SupplierUpdateRequest
): Promise<Supplier> {
  const response = await apiClient.put(`/api/suppliers/${id}`, data);
  return response.data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/api/suppliers/${id}`);
}