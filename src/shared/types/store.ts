export interface Store {
  id: string;
  name: string;
  org_id: string;
  created_at: string;
}

export interface StoreLayout {
  id: string;
  store_id: string;
  rows: number;
  cols: number;
  is_active: boolean;
  created_at: string;
}
