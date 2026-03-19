import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  LoadingState,
  ErrorBanner,
  SuccessBanner,
  EmptyState,
  Pagination,
} from "..";

describe("LoadingState", () => {
  it("renders default loading text", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders custom loading text", () => {
    render(<LoadingState text="Fetching products..." />);
    expect(screen.getByText("Fetching products...")).toBeInTheDocument();
  });
});

describe("ErrorBanner", () => {
  it("renders the error message", () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});

describe("SuccessBanner", () => {
  it("renders the success message", () => {
    render(<SuccessBanner message="Saved successfully" />);
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders the message", () => {
    render(<EmptyState message="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<EmptyState message="No items" icon={<span data-testid="icon">📦</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        message="No items"
        action={<button>Add Item</button>}
      />,
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });
});

describe("Pagination", () => {
  const defaultProps = {
    page: 1,
    totalPages: 3,
    totalItems: 25,
    pageSize: 10,
    onPageChange: vi.fn(),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when totalItems is 0", () => {
    const { container } = render(
      <Pagination {...defaultProps} totalItems={0} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("displays range info", () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText(/1–10 of 25/)).toBeInTheDocument();
  });

  it("disables Prev button on first page", () => {
    render(<Pagination {...defaultProps} page={1} />);
    expect(screen.getByText("‹ Prev")).toBeDisabled();
  });

  it("disables Next button on last page", () => {
    render(<Pagination {...defaultProps} page={3} totalPages={3} />);
    expect(screen.getByText("Next ›")).toBeDisabled();
  });

  it("calls onPageChange with next page", async () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    const user = userEvent.setup();
    await user.click(screen.getByText("Next ›"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with previous page", async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination {...defaultProps} page={2} onPageChange={onPageChange} />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("‹ Prev"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("renders page size buttons when onPageSizeChange is provided", async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />,
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText("25"));
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });
});
