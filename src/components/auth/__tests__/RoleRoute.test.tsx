import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RoleRoute from "../RoleRoute";

const mockUseAuth = vi.fn();
vi.mock("../../../auth/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("RoleRoute", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects to / when user has no profile", () => {
    mockUseAuth.mockReturnValue({ profile: null });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={["SYSTEM_ADMIN"]} roleField="system_role">
                <div>Admin Content</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects when user role is not in allowedRoles", () => {
    mockUseAuth.mockReturnValue({
      profile: { system_role: "USER", org_role: "ORG_VIEWER" },
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={["SYSTEM_ADMIN"]} roleField="system_role">
                <div>Admin Content</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders children when user role is allowed", () => {
    mockUseAuth.mockReturnValue({
      profile: { system_role: "SYSTEM_ADMIN", org_role: "ORG_OWNER" },
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={["SYSTEM_ADMIN"]} roleField="system_role">
                <div>Admin Content</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("renders Outlet when used without children", () => {
    mockUseAuth.mockReturnValue({
      profile: { org_role: "ORG_OWNER" },
    });

    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route
            element={
              <RoleRoute
                allowedRoles={["ORG_OWNER", "ORG_ADMIN"]}
                roleField="org_role"
              />
            }
          >
            <Route path="/settings" element={<div>Settings Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Settings Content")).toBeInTheDocument();
  });

  it("defaults roleField to system_role", () => {
    mockUseAuth.mockReturnValue({
      profile: { system_role: "SYSTEM_ADMIN" },
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={["SYSTEM_ADMIN"]}>
                <div>Admin Content</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
