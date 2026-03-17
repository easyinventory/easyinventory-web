import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import apiClient, { setAuthToken } from "../api/client";
import {
  AuthContext,
  type AuthContextType,
  type AuthUser,
  type UserProfile,
} from "./auth-context";

// ── Cognito pool config ──
const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
});

// ── Helper: extract user info from session ──
function extractUser(session: CognitoUserSession): AuthUser {
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
  const [isLoading, setIsLoading] = useState(() => userPool.getCurrentUser() != null);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<CognitoUser | null>(null);
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

  // Check for existing session on mount (page refresh)
  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      return;
    }

    cognitoUser.getSession(
      async (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          setIsLoading(false);
          return;
        }
        const jwt = session.getIdToken().getJwtToken();
        setUser(extractUser(session));
        setToken(jwt);
        setAuthToken(jwt);

        const userProfile = await fetchProfile(jwt);
        setProfile(userProfile);

        setIsLoading(false);
      }
    );
  }, []);

  // Login
  const login = useCallback(
    (email: string, password: string): Promise<void> => {
      setError(null);

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authDetails, {
          onSuccess: async (session: CognitoUserSession) => {
            const jwt = session.getIdToken().getJwtToken();
            setUser(extractUser(session));
            setToken(jwt);
            setAuthToken(jwt);
            setError(null);

            const userProfile = await fetchProfile(jwt);
            setProfile(userProfile);

            resolve();
          },
          onFailure: (err: Error) => {
            let message = "Login failed. Please try again.";

            if (err.name === "NotAuthorizedException") {
              message = "Incorrect email or password.";
            } else if (err.name === "UserNotFoundException") {
              message = "No account found with that email.";
            } else if (err.name === "UserNotConfirmedException") {
              message = "Please verify your email before signing in.";
            }

            setError(message);
            reject(new Error(message));
          },
          newPasswordRequired: () => {
            // Store the Cognito user so we can complete the challenge
            setPendingUser(cognitoUser);
            setNeedsNewPassword(true);
            setError(null);
            // Resolve — the login page will swap to the new password form
            resolve();
          },
        });
      });
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
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
    (newPassword: string): Promise<void> => {
      if (!pendingUser) {
        return Promise.reject(new Error("No pending password challenge"));
      }

      return new Promise((resolve, reject) => {
        pendingUser.completeNewPasswordChallenge(
          newPassword,
          {},  // required attributes — empty for our setup
          {
            onSuccess: async (session: CognitoUserSession) => {
              const jwt = session.getIdToken().getJwtToken();
              setUser(extractUser(session));
              setToken(jwt);
              setAuthToken(jwt);
              setPendingUser(null);
              setNeedsNewPassword(false);
              setError(null);

              // Fetch profile — this triggers placeholder claiming
              const userProfile = await fetchProfile(jwt);
              setProfile(userProfile);

              resolve();
            },
            onFailure: (err: Error) => {
              if (err.name === "InvalidPasswordException") {
                setError(
                  "Password must include uppercase, lowercase, number, and special character."
                );
              } else {
                setError(err.message);
              }
              reject(err);
            },
          }
        );
      });
    },
    [pendingUser]
  );

    // Forgot password — sends verification code to email
    const forgotPassword = useCallback((email: string): Promise<void> => {
    const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
    });

    return new Promise((resolve, reject) => {
        cognitoUser.forgotPassword({
        onSuccess: () => {
            resolve();
        },
        onFailure: (err: Error) => {
            reject(err);
        },
        inputVerificationCode: () => {
            // This callback fires when code is sent successfully
            resolve();
        },
        });
    });
    }, []);

    // Confirm password reset with verification code
    const confirmResetPassword = useCallback(
    (email: string, code: string, newPassword: string): Promise<void> => {
        const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
        });

        return new Promise((resolve, reject) => {
        cognitoUser.confirmPassword(code, newPassword, {
            onSuccess: () => {
            resolve();
            },
            onFailure: (err: Error) => {
            reject(err);
            },
        });
        });
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