import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import apiClient, { setAuthToken } from "../api/client";
import {
  type AuthSession,
  type PendingCognitoUser,
  authenticateUser as authenticateCognitoUser,
  completeNewPasswordChallenge as completeCognitoNewPasswordChallenge,
  confirmForgotPassword as confirmCognitoForgotPassword,
  forgotPassword as requestCognitoPasswordReset,
  getCurrentSession,
  signOut as signOutCognitoUser,
} from "./cognito-service";
import {
  AuthContext,
  type AuthContextType,
  type AuthUser,
  type UserProfile,
} from "./auth-context";

// ── Helper: extract user info from session ──
function extractUser(session: AuthSession): AuthUser {
  const idToken = session.getIdToken();
  return {
    email: idToken.payload["email"] as string,
    sub: idToken.payload["sub"] as string,
  };
}

// ── Provider ──
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<PendingCognitoUser | null>(null);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);

  async function fetchProfile(jwt: string): Promise<UserProfile | null> {
    try {
      setAuthToken(jwt);

      // Fetch user record and org memberships in parallel
      const [userRes, orgsRes] = await Promise.all([
        apiClient.get("/api/me"),
        apiClient.get("/api/orgs/me"),
      ]);

      const user = userRes.data;
      const memberships = orgsRes.data;

      // Get the first active membership's org_role (or null if no memberships)
      const orgRole =
        memberships.length > 0 ? memberships[0].org_role : null;

      return { ...user, org_role: orgRole } as UserProfile;
    } catch {
      return null;
    }
  }

  const handleAuthenticatedSession = useCallback(
    async (session: AuthSession) => {
      const jwt = session.getIdToken().getJwtToken();
      setUser(extractUser(session));
      setToken(jwt);
      setAuthToken(jwt);

      const userProfile = await fetchProfile(jwt);
      setProfile(userProfile);
    },
    []
  );

  // Check for existing session on mount (page refresh)
  useEffect(() => {
    const restoreSession = async () => {
      const session = await getCurrentSession();

      if (!session) {
        setIsLoading(false);
        return;
      }

      await handleAuthenticatedSession(session);
      setIsLoading(false);
    };

    void restoreSession();
  }, [handleAuthenticatedSession]);

  // Login
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setError(null);

      try {
        const result = await authenticateCognitoUser(email, password);

        if (result.type === "newPasswordRequired") {
          setPendingUser(result.cognitoUser);
          setNeedsNewPassword(true);
          setError(null);
          setIsLoading(false);
          return;
        }

        await handleAuthenticatedSession(result.session);
        setError(null);
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

        setError(message);
        throw new Error(message);
      }
    },
    [handleAuthenticatedSession]
  );

  // Logout
  const logout = useCallback(() => {
    signOutCognitoUser();
    setUser(null);
    setToken(null);
    setProfile(null);
    setPendingUser(null);
    setNeedsNewPassword(false);
    setAuthToken(null);
    setError(null);
  }, []);

  // Complete new-password challenge
  const completeNewPassword = useCallback(
    async (newPassword: string): Promise<void> => {
      if (!pendingUser) {
        return Promise.reject(new Error("No pending password challenge"));
      }

      try {
        const session = await completeCognitoNewPasswordChallenge(
          pendingUser,
          newPassword
        );

        await handleAuthenticatedSession(session);
        setPendingUser(null);
        setNeedsNewPassword(false);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "InvalidPasswordException") {
          setError(
            "Password must include uppercase, lowercase, number, and special character."
          );
        } else if (err instanceof Error) {
          setError(err.message);
        }

        throw err;
      }
    },
    [handleAuthenticatedSession, pendingUser]
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
    if (!token) return;
    const userProfile = await fetchProfile(token);
    setProfile(userProfile);
  }, [token]);

  const value: AuthContextType = {
    user,
    profile,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    error,
    forgotPassword,
    confirmResetPassword,
    refreshProfile,
    needsNewPassword,
    completeNewPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}