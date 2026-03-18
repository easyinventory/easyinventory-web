export interface Product {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithSuppliers extends Product {
  suppliers: ProductSupplierLink[];
}

export interface ProductSupplierLink {
  supplier_id: string;
  supplier_name: string;
  is_active: boolean;
  linked_at: string;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  sku?: string;
  category?: string;
}

export interface AddSupplierToProductRequest {
  supplier_id: string;
}

export interface ToggleProductSupplierRequest {
  is_active: boolean;
}
