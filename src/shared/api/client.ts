import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Static token used during initial login / profile fetch before the
// token-getter is wired up.  Once the getter is set it takes precedence.
let authToken: string | null = null;
let orgId: string | null = null;

// Async getter that refreshes / returns a valid token on every request.
let tokenGetter: (() => Promise<string | null>) | null = null;

/**
 * Set a static token (used during login flow before the getter is ready).
 */
export function setAuthToken(token: string | null) {
  authToken = token;
}

/**
 * Register an async getter that is called on every request to obtain a
 * fresh (auto-refreshed) token.  Pass `null` on logout to clear it.
 */
export function setTokenGetter(getter: (() => Promise<string | null>) | null) {
  tokenGetter = getter;
}

export function setSelectedOrgId(id: string | null) {
  orgId = id;
}

apiClient.interceptors.request.use(async (config) => {
  // Prefer the getter (auto-refreshes expired tokens) over the static value.
  let token: string | null = null;

  if (tokenGetter) {
    token = await tokenGetter();
  }

  // If the getter is not set or returns null, fall back to the static token.
  if (!token && authToken) {
    token = authToken;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (orgId) {
    config.headers["X-Org-Id"] = orgId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;