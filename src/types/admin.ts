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

export interface UserListItem {
  id: string;
  email: string;
  system_role: string;
  is_active: boolean;
  created_at: string;
  org_count: number;
}

export interface OrgMemberDetail {
  id: string;
  user_id: string;
  email: string;
  org_role: string;
  is_active: boolean;
  joined_at: string;
}
