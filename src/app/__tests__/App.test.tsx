import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

// Mock cognito-service: no existing session by default
vi.mock("../../features/auth/api/cognito-service", () => ({
  getCurrentSession: vi.fn().mockResolvedValue(null),
  authenticateUser: vi.fn(),
  completeNewPasswordChallenge: vi.fn(),
  confirmForgotPassword: vi.fn(),
  forgotPassword: vi.fn(),
  signOut: vi.fn(),
}));

// Mock API client to prevent real network calls
vi.mock("../../shared/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  setAuthToken: vi.fn(),
  setTokenGetter: vi.fn(),
  setSelectedOrgId: vi.fn(),
}));

// We need to set the initial route before rendering.
// BrowserRouter uses window.location, so we manipulate that.
function setRoute(path: string) {
  window.history.pushState({}, "", path);
}

describe("App routing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setRoute("/");
  });

  it("redirects unauthenticated user from / to /login", async () => {
    setRoute("/");
    render(<App />);

    // AuthProvider starts in loading, then resolves to no session
    await waitFor(() => {
      expect(screen.getByText("Welcome back")).toBeInTheDocument();
    });
  });

  it("renders login page directly at /login", async () => {
    setRoute("/login");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Welcome back")).toBeInTheDocument();
    });
  });

  it("renders forgot password page at /forgot-password", async () => {
    setRoute("/forgot-password");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Reset password")).toBeInTheDocument();
    });
  });

  it("renders not found page for unknown routes", async () => {
    setRoute("/some-unknown-route");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("Page not found")).toBeInTheDocument();
    });
  });
});
