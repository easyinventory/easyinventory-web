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
import { setAuthToken } from "../api/client";

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

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount (page refresh)
  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      setIsLoading(false);
      return;
    }

    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          setIsLoading(false);
          return;
        }
        const jwt = session.getIdToken().getJwtToken();
        setUser(extractUser(session));
        setToken(jwt);
        setAuthToken(jwt);
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
          onSuccess: (session: CognitoUserSession) => {
            const jwt = session.getIdToken().getJwtToken();
            setUser(extractUser(session));
            setToken(jwt);
            setAuthToken(jwt);
            setError(null);
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
    setAuthToken(null);
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}