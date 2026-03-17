export interface OrgMember {
  id: string;
  user_id: string;
  email: string;
  org_role: string;
  is_active: boolean;
  joined_at: string;
}

export interface InviteRequest {
  email: string;
  org_role: string;
}

export interface UpdateRoleRequest {
  org_role: string;
}
