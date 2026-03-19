import { useCallback, useRef, useState } from "react";
import { extractApiError } from "../utils";

interface UseAsyncActionOptions {
  /** Custom error extractor (defaults to extractApiError) */
  extractError?: (err: unknown) => string;
  /** If set, auto-clear success message after this many ms */
  successTimeout?: number;
}

interface UseAsyncActionResult<TArgs extends unknown[], TReturn> {
  /** Wraps the original async function with loading/error management */
  execute: (...args: TArgs) => Promise<TReturn | undefined>;
  /** True while the async action is in flight */
  isLoading: boolean;
  /** Error message from the last failed call (null if none) */
  error: string | null;
  /** Success message from the last successful call (null if none) */
  success: string | null;
  /** Reset error and success to null */
  reset: () => void;
}

/**
 * Hook for user-triggered async actions (form submissions, button clicks, etc.).
 *
 * Manages `isLoading`, `error`, and `success` state so each component
 * doesn't need to repeat the same try/catch/finally boilerplate.
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error } = useAsyncAction(
 *   async (orgId: string) => {
 *     await deleteOrg(orgId);
 *     onSuccess();
 *   }
 * );
 *
 * <button onClick={() => execute(orgId)} disabled={isLoading}>
 *   {isLoading ? "Deleting..." : "Delete"}
 * </button>
 * {error && <ErrorBanner message={error} />}
 * ```
 */
export function useAsyncAction<TArgs extends unknown[], TReturn = void>(
  action: (...args: TArgs) => Promise<TReturn>,
  options: UseAsyncActionOptions = {},
): UseAsyncActionResult<TArgs, TReturn> {
  const { extractError = extractApiError, successTimeout } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TReturn | undefined> => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }

      try {
        const result = await action(...args);

        // If the action returned a string, treat it as a success message
        if (typeof result === "string") {
          setSuccess(result);
        }

        if (successTimeout && typeof result === "string") {
          successTimerRef.current = setTimeout(() => {
            setSuccess(null);
            successTimerRef.current = null;
          }, successTimeout);
        }

        return result;
      } catch (err: unknown) {
        setError(extractError(err));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [action, extractError, successTimeout],
  );

  return { execute, isLoading, error, success, reset };
}
