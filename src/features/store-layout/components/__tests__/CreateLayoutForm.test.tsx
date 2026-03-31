import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateLayoutForm from "../CreateLayoutForm";

describe("CreateLayoutForm", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isLoading: false,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("panel variant (default)", () => {
    it("renders rows and columns inputs", () => {
      render(<CreateLayoutForm {...defaultProps} />);
      expect(screen.getByLabelText("Rows")).toBeInTheDocument();
      expect(screen.getByLabelText("Columns")).toBeInTheDocument();
    });

    it("has default values of 5 rows and 8 columns", () => {
      render(<CreateLayoutForm {...defaultProps} />);
      expect(screen.getByLabelText("Rows")).toHaveValue(5);
      expect(screen.getByLabelText("Columns")).toHaveValue(8);
    });

    it("calls onSubmit with parsed dimensions", async () => {
      const onSubmit = vi.fn();
      render(<CreateLayoutForm {...defaultProps} onSubmit={onSubmit} />);
      const user = userEvent.setup();
      await user.click(screen.getByText("Create layout"));
      expect(onSubmit).toHaveBeenCalledWith(5, 8);
    });

    it("shows validation error when rows < 2", async () => {
      render(<CreateLayoutForm {...defaultProps} />);
      const user = userEvent.setup();
      const rowsInput = screen.getByLabelText("Rows");
      await user.clear(rowsInput);
      await user.type(rowsInput, "1");
      expect(screen.getByText("Minimum value is 2.")).toBeInTheDocument();
    });

    it("shows validation error when cols > 30", async () => {
      render(<CreateLayoutForm {...defaultProps} />);
      const user = userEvent.setup();
      const colsInput = screen.getByLabelText("Columns");
      await user.clear(colsInput);
      await user.type(colsInput, "31");
      expect(screen.getByText("Maximum value is 30.")).toBeInTheDocument();
    });

    it("does not submit when validation fails", async () => {
      const onSubmit = vi.fn();
      render(<CreateLayoutForm {...defaultProps} onSubmit={onSubmit} />);
      const user = userEvent.setup();
      const rowsInput = screen.getByLabelText("Rows");
      await user.clear(rowsInput);
      await user.type(rowsInput, "0");
      await user.click(screen.getByText("Create layout"));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("shows loading state", () => {
      render(<CreateLayoutForm {...defaultProps} isLoading />);
      expect(screen.getByText("Creating...")).toBeDisabled();
    });

    it("displays error message", () => {
      render(<CreateLayoutForm {...defaultProps} error="Something went wrong" />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("renders cancel button when onCancel is provided", async () => {
      const onCancel = vi.fn();
      render(<CreateLayoutForm {...defaultProps} onCancel={onCancel} />);
      const user = userEvent.setup();
      await user.click(screen.getByText("Cancel"));
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it("does not render cancel button when onCancel is not provided", () => {
      render(<CreateLayoutForm {...defaultProps} />);
      expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    });
  });

  describe("empty-state variant", () => {
    it("renders the heading", () => {
      render(<CreateLayoutForm {...defaultProps} variant="empty-state" />);
      expect(screen.getByText("Create Store Layout")).toBeInTheDocument();
    });

    it("renders description text", () => {
      render(<CreateLayoutForm {...defaultProps} variant="empty-state" />);
      expect(
        screen.getByText(/Define the grid dimensions/),
      ).toBeInTheDocument();
    });

    it("renders rows and columns inputs", () => {
      render(<CreateLayoutForm {...defaultProps} variant="empty-state" />);
      expect(screen.getByLabelText("Rows")).toBeInTheDocument();
      expect(screen.getByLabelText("Columns")).toBeInTheDocument();
    });

    it("calls onSubmit with dimensions", async () => {
      const onSubmit = vi.fn();
      render(
        <CreateLayoutForm
          {...defaultProps}
          onSubmit={onSubmit}
          variant="empty-state"
        />,
      );
      const user = userEvent.setup();
      await user.click(screen.getByText("Create Layout"));
      expect(onSubmit).toHaveBeenCalledWith(5, 8);
    });

    it("shows loading state with full-width button", () => {
      render(
        <CreateLayoutForm {...defaultProps} isLoading variant="empty-state" />,
      );
      expect(screen.getByText("Creating...")).toBeDisabled();
    });

    it("shows dynamic tip with current dimensions", () => {
      render(<CreateLayoutForm {...defaultProps} variant="empty-state" />);
      expect(screen.getByText(/5×8 grid works well/)).toBeInTheDocument();
    });
  });
});
