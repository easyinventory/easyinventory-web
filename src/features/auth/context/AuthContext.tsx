import {
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { setAuthToken } from "../../../shared/api/client";
import {
  type AuthSession,
  authenticateUser as authenticateCognitoUser,
  completeNewPasswordChallenge as completeCognitoNewPasswordChallenge,
  confirmForgotPassword as confirmCognitoForgotPassword,
  forgotPassword as requestCognitoPasswordReset,
  getCurrentSession,
  signOut as signOutCognitoUser,
} from "../api/cognito-service";
import {
  AuthContext,
  type AuthContextType,
  type AuthUser,
  type UserProfile,
} from "./auth-context";
import { OrgProvider } from "../../org/context/OrgContext";
import type { OrgMembership } from "../../../shared/types";
import { authReducer, initialState, extractUser, fetchProfile } from "./auth-reducer";

// ── Provider ──
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Refs let stable callbacks access latest values without re-creating
  const tokenRef = useRef(state.token);
  const pendingUserRef = useRef(state.pendingUser);

  useEffect(() => { tokenRef.current = state.token; }, [state.token]);
  useEffect(() => { pendingUserRef.current = state.pendingUser; }, [state.pendingUser]);

  const handleAuthenticatedSession = useCallback(
    async (session: AuthSession): Promise<{ user: AuthUser; token: string; profile: UserProfile | null; memberships: OrgMembership[] }> => {
      const jwt = session.getIdToken().getJwtToken();
      const user = extractUser(session);
      setAuthToken(jwt);

      const result = await fetchProfile(jwt);
      return { user, token: jwt, profile: result.profile, memberships: result.memberships };
    },
    []
  );

  // Check for existing session on mount (page refresh)
  useEffect(() => {
    const restoreSession = async () => {
      const session = await getCurrentSession();

      if (!session) {
        dispatch({ type: "SESSION_RESTORE_FAILED" });
        return;
      }

      const result = await handleAuthenticatedSession(session);
      dispatch({ type: "SESSION_RESTORED", ...result });
    };

    void restoreSession();
  }, [handleAuthenticatedSession]);

  // Login
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      dispatch({ type: "LOGIN_START" });

      try {
        const result = await authenticateCognitoUser(email, password);

        if (result.type === "newPasswordRequired") {
          dispatch({ type: "LOGIN_NEW_PASSWORD", pendingUser: result.cognitoUser });
          return;
        }

        const sessionData = await handleAuthenticatedSession(result.session);
        dispatch({ type: "LOGIN_SUCCESS", ...sessionData });
      } catch (err: unknown) {
        let message = "Login failed. Please try again.";

        if (err instanceof Error) {
          if (err.name === "NotAuthorizedException") {
            message = "Incorrect email or password.";
          } else if (err.name === "UserNotFoundException") {
            message = "No account found with that email.";
          } else if (err.name === "UserNotConfirmedException") {
            message = "Please verify your email before signing in.";
          }
        }

        dispatch({ type: "LOGIN_ERROR", error: message });
        throw new Error(message);
      }
    },
    [handleAuthenticatedSession]
  );

  // Logout
  const logout = useCallback(() => {
    signOutCognitoUser();
    setAuthToken(null);
    dispatch({ type: "LOGOUT" });
  }, []);

  // Complete new-password challenge
  const completeNewPassword = useCallback(
    async (newPassword: string): Promise<void> => {
      const pending = pendingUserRef.current;
      if (!pending) {
        return Promise.reject(new Error("No pending password challenge"));
      }

      try {
        const session = await completeCognitoNewPasswordChallenge(
          pending,
          newPassword
        );

        const sessionData = await handleAuthenticatedSession(session);
        dispatch({ type: "NEW_PASSWORD_SUCCESS", ...sessionData });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "InvalidPasswordException") {
          dispatch({
            type: "NEW_PASSWORD_ERROR",
            error: "Password must include uppercase, lowercase, number, and special character.",
          });
        } else if (err instanceof Error) {
          dispatch({ type: "NEW_PASSWORD_ERROR", error: err.message });
        }

        throw err;
      }
    },
    [handleAuthenticatedSession]
  );

  // Forgot password — sends verification code to email
  const forgotPassword = useCallback((email: string): Promise<void> => {
    return requestCognitoPasswordReset(email);
  }, []);

  // Confirm password reset with verification code
  const confirmResetPassword = useCallback(
    (email: string, code: string, newPassword: string): Promise<void> => {
      return confirmCognitoForgotPassword(email, code, newPassword);
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    const currentToken = tokenRef.current;
    if (!currentToken) return;
    const result = await fetchProfile(currentToken);
    dispatch({ type: "PROFILE_REFRESHED", ...result });
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user: state.user,
      profile: state.profile,
      token: state.token,
      isLoading: state.isLoading,
      isAuthenticated: !!state.user && !!state.token,
      login,
      logout,
      error: state.error,
      forgotPassword,
      confirmResetPassword,
      refreshProfile,
      needsNewPassword: state.needsNewPassword,
      completeNewPassword,
    }),
    [
      state.user,
      state.profile,
      state.token,
      state.isLoading,
      state.error,
      state.needsNewPassword,
      login,
      logout,
      forgotPassword,
      confirmResetPassword,
      refreshProfile,
      completeNewPassword,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      <OrgProvider memberships={state.memberships}>
        {children}
      </OrgProvider>
    </AuthContext.Provider>
  );
}