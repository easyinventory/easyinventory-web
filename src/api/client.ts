import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Token is set by AuthContext after login
let authToken: string | null = null;
let orgId: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setSelectedOrgId(id: string | null) {
  orgId = id;
}

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  if (orgId) {
    config.headers["X-Org-Id"] = orgId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authToken = null;
    }
    return Promise.reject(error);
  }
);

export default apiClient;