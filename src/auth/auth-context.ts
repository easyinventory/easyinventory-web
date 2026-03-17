import { createContext } from "react";

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

export interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  forgotPassword: (email: string) => Promise<void>;
  confirmResetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
  needsNewPassword: boolean;
  completeNewPassword: (newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);