export interface OrgMember {
  id: string;
  user_id: string;
  email: string;
  org_role: string;
  is_active: boolean;
  joined_at: string;
}

export interface OrgMembership {
  id: string;
  org_id: string;
  org_role: string;
  is_active: boolean;
  joined_at: string;
  organization: {
    id: string;
    name: string;
    created_at: string;
  };
}

export interface InviteRequest {
  email: string;
  org_role: string;
}

export interface UpdateRoleRequest {
  org_role: string;
}
