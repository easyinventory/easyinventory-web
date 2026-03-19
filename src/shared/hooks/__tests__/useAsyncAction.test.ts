import { renderHook, act } from "@testing-library/react";
import { useAsyncAction } from "../useAsyncAction";

describe("useAsyncAction", () => {
  it("starts with idle state", () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAsyncAction(action));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });

  it("sets isLoading during execution", async () => {
    let resolve!: () => void;
    const action = vi.fn(
      () => new Promise<void>((r) => { resolve = r; }),
    );

    const { result } = renderHook(() => useAsyncAction(action));

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolve();
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("sets error on failure using default extractApiError", async () => {
    const action = vi.fn().mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // expected
      }
    });

    expect(result.current.isLoading).toBe(false);
    // extractApiError returns this for non-Axios errors
    expect(result.current.error).toBe("Something went wrong. Please try again.");
  });

  it("sets error using custom extractError", async () => {
    const action = vi.fn().mockRejectedValue(new Error("custom"));
    const extractError = () => "Custom error message";

    const { result } = renderHook(() =>
      useAsyncAction(action, { extractError }),
    );

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe("Custom error message");
  });

  it("re-throws the error so callers can catch", async () => {
    const err = new Error("fail");
    const action = vi.fn().mockRejectedValue(err);

    const { result } = renderHook(() => useAsyncAction(action));

    await expect(
      act(() => result.current.execute()),
    ).rejects.toThrow("fail");
  });

  it("sets success when action returns a string", async () => {
    const action = vi.fn().mockResolvedValue("Saved!");

    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.success).toBe("Saved!");
    expect(result.current.error).toBeNull();
  });

  it("auto-clears success after successTimeout", async () => {
    vi.useFakeTimers();
    const action = vi.fn().mockResolvedValue("Done!");

    const { result } = renderHook(() =>
      useAsyncAction(action, { successTimeout: 3000 }),
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.success).toBe("Done!");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.success).toBeNull();

    vi.useRealTimers();
  });

  it("reset clears error and success", async () => {
    const action = vi.fn().mockResolvedValue("ok");

    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.success).toBe("ok");

    act(() => {
      result.current.reset();
    });

    expect(result.current.success).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("clears previous error on new execution", async () => {
    let shouldFail = true;
    const action = vi.fn(async () => {
      if (shouldFail) throw new Error("fail");
      return "success";
    });

    const { result } = renderHook(() => useAsyncAction(action));

    // First call fails
    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe("Something went wrong. Please try again.");

    // Second call succeeds
    shouldFail = false;
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe("success");
  });

  it("returns the result from execute", async () => {
    const action = vi.fn().mockResolvedValue(42);

    const { result } = renderHook(() => useAsyncAction(action));

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.execute();
    });

    expect(returnValue).toBe(42);
  });

  it("passes arguments through to the action", async () => {
    const action = vi.fn(async (a: string, b: number) => `${a}-${b}`);

    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute("hello", 42);
    });

    expect(action).toHaveBeenCalledWith("hello", 42);
  });
});
