import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

// Mock useAuth at the module level
const mockUseAuth = vi.fn();
vi.mock("../../../auth/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(initialRoute = "/protected") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state while auth is checking", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    renderWithRouter();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithRouter();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders child routes when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    renderWithRouter();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
