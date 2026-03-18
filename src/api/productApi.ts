import apiClient from "./client";
import type {
  Product,
  ProductWithSuppliers,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductSupplierLink,
  AddSupplierToProductRequest,
  ToggleProductSupplierRequest,
} from "../types";

export type {
  Product,
  ProductWithSuppliers,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductSupplierLink,
  AddSupplierToProductRequest,
  ToggleProductSupplierRequest,
};

/* ── Product CRUD ── */

export async function listProducts(): Promise<Product[]> {
  const response = await apiClient.get("/api/products");
  return response.data;
}

export async function getProduct(id: string): Promise<ProductWithSuppliers> {
  const response = await apiClient.get(`/api/products/${id}`);
  return response.data;
}

export async function createProduct(
  data: ProductCreateRequest
): Promise<Product> {
  const response = await apiClient.post("/api/products", data);
  return response.data;
}

export async function updateProduct(
  id: string,
  data: ProductUpdateRequest
): Promise<Product> {
  const response = await apiClient.put(`/api/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`);
}

/* ── Product-Supplier Links ── */

export async function listProductSuppliers(
  productId: string
): Promise<ProductSupplierLink[]> {
  const response = await apiClient.get(
    `/api/products/${productId}/suppliers`
  );
  return response.data;
}

export async function addSupplierToProduct(
  productId: string,
  data: AddSupplierToProductRequest
): Promise<ProductSupplierLink> {
  const response = await apiClient.post(
    `/api/products/${productId}/suppliers`,
    data
  );
  return response.data;
}

export async function toggleProductSupplier(
  productId: string,
  supplierId: string,
  data: ToggleProductSupplierRequest
): Promise<ProductSupplierLink> {
  const response = await apiClient.patch(
    `/api/products/${productId}/suppliers/${supplierId}`,
    data
  );
  return response.data;
}

export async function removeProductSupplier(
  productId: string,
  supplierId: string
): Promise<void> {
  await apiClient.delete(
    `/api/products/${productId}/suppliers/${supplierId}`
  );
}
