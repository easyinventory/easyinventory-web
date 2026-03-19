import { authReducer, initialState, type AuthState } from "../auth-reducer";
import type { OrgMembership } from "../../../../shared/types";

// ── Test fixtures ──

const fakeUser = { email: "test@example.com", sub: "sub-123" };
const fakeProfile = {
  id: "u-1",
  email: "test@example.com",
  system_role: "user",
  is_active: true,
  created_at: "2025-01-01",
  org_role: "member",
};
const fakeMemberships: OrgMembership[] = [
  {
    org_id: "org-1",
    org_role: "owner",
    organization: { id: "org-1", name: "Acme" },
  } as OrgMembership,
];
const fakeToken = "jwt-abc-123";

describe("authReducer", () => {
  it("has correct initial state", () => {
    expect(initialState).toEqual({
      user: null,
      profile: null,
      memberships: [],
      token: null,
      isLoading: true,
      error: null,
      pendingUser: null,
      needsNewPassword: false,
    });
  });

  it("SESSION_RESTORED sets user, token, profile, memberships and clears loading", () => {
    const result = authReducer(initialState, {
      type: "SESSION_RESTORED",
      user: fakeUser,
      token: fakeToken,
      profile: fakeProfile,
      memberships: fakeMemberships,
    });

    expect(result.user).toBe(fakeUser);
    expect(result.token).toBe(fakeToken);
    expect(result.profile).toBe(fakeProfile);
    expect(result.memberships).toBe(fakeMemberships);
    expect(result.isLoading).toBe(false);
  });

  it("SESSION_RESTORE_FAILED only clears loading", () => {
    const result = authReducer(initialState, { type: "SESSION_RESTORE_FAILED" });
    expect(result.isLoading).toBe(false);
    expect(result.user).toBeNull();
  });

  it("LOGIN_START clears error", () => {
    const stateWithError = { ...initialState, error: "old error" };
    const result = authReducer(stateWithError, { type: "LOGIN_START" });
    expect(result.error).toBeNull();
  });

  it("LOGIN_NEW_PASSWORD sets pending user state", () => {
    const fakePending = {} as never;
    const result = authReducer(initialState, {
      type: "LOGIN_NEW_PASSWORD",
      pendingUser: fakePending,
    });

    expect(result.pendingUser).toBe(fakePending);
    expect(result.needsNewPassword).toBe(true);
    expect(result.error).toBeNull();
    expect(result.isLoading).toBe(false);
  });

  it("LOGIN_SUCCESS sets authenticated state and clears pending/errors", () => {
    const pending = { ...initialState, pendingUser: {} as never, needsNewPassword: true };
    const result = authReducer(pending, {
      type: "LOGIN_SUCCESS",
      user: fakeUser,
      token: fakeToken,
      profile: fakeProfile,
      memberships: fakeMemberships,
    });

    expect(result.user).toBe(fakeUser);
    expect(result.token).toBe(fakeToken);
    expect(result.pendingUser).toBeNull();
    expect(result.needsNewPassword).toBe(false);
    expect(result.error).toBeNull();
  });

  it("LOGIN_ERROR sets the error message", () => {
    const result = authReducer(initialState, {
      type: "LOGIN_ERROR",
      error: "Invalid credentials",
    });
    expect(result.error).toBe("Invalid credentials");
  });

  it("LOGOUT resets to initial state with isLoading false", () => {
    const authenticated: AuthState = {
      user: fakeUser,
      profile: fakeProfile,
      memberships: fakeMemberships,
      token: fakeToken,
      isLoading: false,
      error: null,
      pendingUser: null,
      needsNewPassword: false,
    };

    const result = authReducer(authenticated, { type: "LOGOUT" });
    expect(result).toEqual({ ...initialState, isLoading: false });
  });

  it("NEW_PASSWORD_SUCCESS matches LOGIN_SUCCESS behavior", () => {
    const result = authReducer(initialState, {
      type: "NEW_PASSWORD_SUCCESS",
      user: fakeUser,
      token: fakeToken,
      profile: fakeProfile,
      memberships: fakeMemberships,
    });

    expect(result.user).toBe(fakeUser);
    expect(result.token).toBe(fakeToken);
    expect(result.pendingUser).toBeNull();
    expect(result.needsNewPassword).toBe(false);
  });

  it("NEW_PASSWORD_ERROR sets error", () => {
    const result = authReducer(initialState, {
      type: "NEW_PASSWORD_ERROR",
      error: "Password too weak",
    });
    expect(result.error).toBe("Password too weak");
  });

  it("PROFILE_REFRESHED updates profile and memberships", () => {
    const authenticated: AuthState = {
      ...initialState,
      user: fakeUser,
      token: fakeToken,
      isLoading: false,
    };

    const newProfile = { ...fakeProfile, org_role: "admin" };
    const result = authReducer(authenticated, {
      type: "PROFILE_REFRESHED",
      profile: newProfile,
      memberships: fakeMemberships,
    });

    expect(result.profile).toBe(newProfile);
    expect(result.memberships).toBe(fakeMemberships);
    // user/token unchanged
    expect(result.user).toBe(fakeUser);
    expect(result.token).toBe(fakeToken);
  });

  it("CLEAR_ERROR resets error to null", () => {
    const stateWithError = { ...initialState, error: "some error" };
    const result = authReducer(stateWithError, { type: "CLEAR_ERROR" });
    expect(result.error).toBeNull();
  });
});
