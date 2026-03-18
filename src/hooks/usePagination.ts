import { useState, useMemo, useCallback } from "react";

const DEFAULT_PAGE_SIZES = [10, 25, 50] as const;

interface UsePaginationResult<T> {
  paginatedItems: T[];
  page: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  totalItems: number;
}

export function usePagination<T>(
  items: T[],
  initialPageSize = 10,
  pageSizeOptions: readonly number[] = DEFAULT_PAGE_SIZES,
): UsePaginationResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 if items shrink
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  return {
    paginatedItems,
    page: safePage,
    pageSize,
    pageSizeOptions,
    totalPages,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    totalItems: items.length,
  };
}
