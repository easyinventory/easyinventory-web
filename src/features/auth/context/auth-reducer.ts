import type { PendingCognitoUser, AuthSession } from "../api/cognito-service";
import type { AuthUser, UserProfile } from "./auth-context";
import type { OrgMembership } from "../../../shared/types";
import apiClient, { setAuthToken } from "../../../shared/api/client";

// ── State ──

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  memberships: OrgMembership[];
  token: string | null;
  isLoading: boolean;
  error: string | null;
  pendingUser: PendingCognitoUser | null;
  needsNewPassword: boolean;
}

export const initialState: AuthState = {
  user: null,
  profile: null,
  memberships: [],
  token: null,
  isLoading: true,
  error: null,
  pendingUser: null,
  needsNewPassword: false,
};

// ── Actions ──

export type AuthAction =
  | { type: "SESSION_RESTORED"; user: AuthUser; token: string; profile: UserProfile | null; memberships: OrgMembership[] }
  | { type: "SESSION_RESTORE_FAILED" }
  | { type: "LOGIN_START" }
  | { type: "LOGIN_NEW_PASSWORD"; pendingUser: PendingCognitoUser }
  | { type: "LOGIN_SUCCESS"; user: AuthUser; token: string; profile: UserProfile | null; memberships: OrgMembership[] }
  | { type: "LOGIN_ERROR"; error: string }
  | { type: "LOGOUT" }
  | { type: "NEW_PASSWORD_SUCCESS"; user: AuthUser; token: string; profile: UserProfile | null; memberships: OrgMembership[] }
  | { type: "NEW_PASSWORD_ERROR"; error: string }
  | { type: "PROFILE_REFRESHED"; profile: UserProfile | null; memberships: OrgMembership[] }
  | { type: "CLEAR_ERROR" };

// ── Reducer ──

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SESSION_RESTORED":
      return {
        ...state,
        user: action.user,
        token: action.token,
        profile: action.profile,
        memberships: action.memberships,
        isLoading: false,
      };
    case "SESSION_RESTORE_FAILED":
      return { ...state, isLoading: false };
    case "LOGIN_START":
      return { ...state, error: null };
    case "LOGIN_NEW_PASSWORD":
      return {
        ...state,
        pendingUser: action.pendingUser,
        needsNewPassword: true,
        error: null,
        isLoading: false,
      };
    case "LOGIN_SUCCESS":
    case "NEW_PASSWORD_SUCCESS":
      return {
        ...state,
        user: action.user,
        token: action.token,
        profile: action.profile,
        memberships: action.memberships,
        error: null,
        pendingUser: null,
        needsNewPassword: false,
      };
    case "LOGIN_ERROR":
    case "NEW_PASSWORD_ERROR":
      return { ...state, error: action.error };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "PROFILE_REFRESHED":
      return {
        ...state,
        profile: action.profile,
        memberships: action.memberships,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
  }
}

// ── Helpers ──

export function extractUser(session: AuthSession): AuthUser {
  const idToken = session.getIdToken();
  return {
    email: idToken.payload["email"] as string,
    sub: idToken.payload["sub"] as string,
  };
}

export async function fetchProfile(jwt: string): Promise<{ profile: UserProfile | null; memberships: OrgMembership[] }> {
  try {
    setAuthToken(jwt);

    const [userRes, orgsRes] = await Promise.all([
      apiClient.get("/api/me"),
      apiClient.get("/api/orgs/me"),
    ]);

    const user = userRes.data;
    const memberships: OrgMembership[] = orgsRes.data;
    const orgRole = memberships.length > 0 ? memberships[0].org_role : null;

    return {
      profile: { ...user, org_role: orgRole } as UserProfile,
      memberships,
    };
  } catch {
    return { profile: null, memberships: [] };
  }
}
