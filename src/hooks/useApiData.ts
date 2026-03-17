import { useCallback, useEffect, useState } from "react";
import { extractApiError } from "../utils";

interface UseApiDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiData<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => {
    setRefetchKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const runFetch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchFn();
        if (!isCancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(extractApiError(err));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    runFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchFn, refetchKey, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isLoading, error, refetch };
}
