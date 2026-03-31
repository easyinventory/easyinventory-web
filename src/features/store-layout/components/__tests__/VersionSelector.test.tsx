import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VersionSelector from "../VersionSelector";
import type { StoreLayout } from "../../../../shared/types";

function makeLayout(overrides: Partial<StoreLayout> = {}): StoreLayout {
  return {
    id: "l1",
    store_id: "s1",
    version_number: 1,
    rows: 5,
    cols: 8,
    is_active: true,
    created_at: "2024-06-01T12:00:00Z",
    updated_at: "2024-06-01T12:00:00Z",
    zones: [],
    fixtures: [],
    ...overrides,
  };
}

describe("VersionSelector", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when layouts is empty", () => {
    const { container } = render(
      <VersionSelector layouts={[]} onActivate={vi.fn()} isActivating={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("displays the active layout info", () => {
    const layout = makeLayout();
    render(
      <VersionSelector
        layouts={[layout]}
        onActivate={vi.fn()}
        isActivating={false}
      />,
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Version 1")).toBeInTheDocument();
    expect(screen.getByText(/5 rows/)).toBeInTheDocument();
  });

  it("does not show chevron when there is only one layout", () => {
    render(
      <VersionSelector
        layouts={[makeLayout()]}
        onActivate={vi.fn()}
        isActivating={false}
      />,
    );
    expect(screen.queryByText("▾")).not.toBeInTheDocument();
  });

  it("shows chevron when there are multiple layouts", () => {
    const layouts = [
      makeLayout({ id: "l1", is_active: true }),
      makeLayout({
        id: "l2",
        is_active: false,
        version_number: 2,
        created_at: "2024-07-01T12:00:00Z",
      }),
    ];
    render(
      <VersionSelector
        layouts={layouts}
        onActivate={vi.fn()}
        isActivating={false}
      />,
    );
    expect(screen.getByText("▾")).toBeInTheDocument();
  });

  it("toggles dropdown on click", async () => {
    const layouts = [
      makeLayout({ id: "l1", is_active: true, created_at: "2024-06-01T12:00:00Z" }),
      makeLayout({
        id: "l2",
        is_active: false,
        version_number: 2,
        rows: 10,
        cols: 12,
        created_at: "2024-07-01T12:00:00Z",
      }),
    ];
    render(
      <VersionSelector
        layouts={layouts}
        onActivate={vi.fn()}
        isActivating={false}
      />,
    );
    const user = userEvent.setup();
    // Open dropdown
    await user.click(screen.getByText("Version 1"));
    expect(screen.getByText("Activate")).toBeInTheDocument();
    expect(screen.getByText(/10 rows/)).toBeInTheDocument();
    // Close dropdown
    await user.click(screen.getByText("Version 1"));
    expect(screen.queryByText("Activate")).not.toBeInTheDocument();
  });

  it("calls onActivate and closes dropdown", async () => {
    const onActivate = vi.fn();
    const layouts = [
      makeLayout({ id: "l1", is_active: true, created_at: "2024-06-01T12:00:00Z" }),
      makeLayout({ id: "l2", is_active: false, version_number: 2, created_at: "2024-07-01T12:00:00Z" }),
    ];
    render(
      <VersionSelector
        layouts={layouts}
        onActivate={onActivate}
        isActivating={false}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("Version 1"));
    await user.click(screen.getByText("Activate"));
    expect(onActivate).toHaveBeenCalledWith("l2");
    // Dropdown should close
    expect(screen.queryByText("Activate")).not.toBeInTheDocument();
  });

  it("disables activate button when isActivating", async () => {
    const layouts = [
      makeLayout({ id: "l1", is_active: true, created_at: "2024-06-01T12:00:00Z" }),
      makeLayout({ id: "l2", is_active: false, version_number: 2, created_at: "2024-07-01T12:00:00Z" }),
    ];
    render(
      <VersionSelector
        layouts={layouts}
        onActivate={vi.fn()}
        isActivating={true}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText("Version 1"));
    expect(screen.getByText("Activate")).toBeDisabled();
  });
});
