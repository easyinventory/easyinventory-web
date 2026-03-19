export interface AuthUser {
  email: string;
  sub: string;
}

export interface UserProfile {
  id: string;
  email: string;
  system_role: string;
  is_active: boolean;
  created_at: string;
  org_role: string | null;
}
