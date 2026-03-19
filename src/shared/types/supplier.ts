export interface Supplier {
  id: string;
  org_id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierCreateRequest {
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface SupplierUpdateRequest {
  name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}