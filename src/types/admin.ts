export interface OrgListItem {
  id: string;
  name: string;
  created_at: string;
  owner_email: string | null;
  member_count: number;
}

export interface CreateOrgRequest {
  name: string;
  owner_email: string;
}

export interface UpdateOrgRequest {
  name: string;
}

export interface TransferOwnershipRequest {
  new_owner_email: string;
}
