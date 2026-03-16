import {
  createContext,
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

// ── Cognito pool config ──
const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
});

// ── Types ──
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
}
// ── Context ──
export const AuthContext = createContext<AuthContextType | null>(null);

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setIsLoading(false);
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
            const msg =
              "You must set a new password. Use the Cognito hosted UI or AWS CLI.";
            setError(msg);
            reject(new Error(msg));
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
    setAuthToken(null);
    setError(null);
  }, []);

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
    };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}