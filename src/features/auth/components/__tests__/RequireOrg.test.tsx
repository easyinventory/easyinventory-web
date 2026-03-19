import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RequireOrg from "../RequireOrg";

const mockUseAuth = vi.fn();
vi.mock("../../context/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={["/app"]}>
      <Routes>
        <Route element={<RequireOrg />}>
          <Route path="/app" element={<div>App Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireOrg", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing while loading", () => {
    mockUseAuth.mockReturnValue({
      profile: null,
      user: null,
      logout: vi.fn(),
      isLoading: true,
    });
    const { container } = renderWithRouter();
    expect(container.innerHTML).toBe("");
  });

  it("shows waiting screen when user has no org_role", () => {
    mockUseAuth.mockReturnValue({
      profile: { org_role: null },
      user: { email: "test@example.com" },
      logout: vi.fn(),
      isLoading: false,
    });
    renderWithRouter();
    expect(
      screen.getByText("Waiting for organization access"),
    ).toBeInTheDocument();
    expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
  });

  it("calls logout when sign-out button is clicked", async () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      profile: { org_role: null },
      user: { email: "test@example.com" },
      logout: mockLogout,
      isLoading: false,
    });
    renderWithRouter();

    const user = userEvent.setup();
    await user.click(screen.getByText("Sign out"));
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it("renders child routes when user has org_role", () => {
    mockUseAuth.mockReturnValue({
      profile: { org_role: "ORG_ADMIN" },
      user: { email: "test@example.com" },
      logout: vi.fn(),
      isLoading: false,
    });
    renderWithRouter();
    expect(screen.getByText("App Content")).toBeInTheDocument();
  });
});
