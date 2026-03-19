import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "..";

import type { ReactNode } from "react";

// A component that throws during render
function ThrowingComponent({ error }: { error: Error }): ReactNode {
  throw error;
}

// Suppress console.error noise from React and ErrorBoundary during tests
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <p>Hello world</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders default fallback when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("Boom")} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("recovers when 'Try again' is clicked", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function MaybeThrow() {
      if (shouldThrow) {
        throw new Error("Kaboom");
      }
      return <p>Recovered</p>;
    }

    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Kaboom")).toBeInTheDocument();

    // Fix the child, then click retry
    shouldThrow = false;
    await user.click(screen.getByText("Try again"));

    expect(screen.getByText("Recovered")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const customFallback = (error: Error, reset: () => void) => (
      <div>
        <span>Custom: {error.message}</span>
        <button onClick={reset}>Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent error={new Error("Custom error")} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom: Custom error")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });
});
