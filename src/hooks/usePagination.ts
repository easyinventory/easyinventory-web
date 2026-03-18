import { useState, useMemo, useCallback } from "react";

interface UsePaginationResult<T> {
  paginatedItems: T[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  totalItems: number;
}

export function usePagination<T>(items: T[], pageSize = 25): UsePaginationResult<T> {
  const [page, setPage] = useState(1);

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

  return {
    paginatedItems,
    page: safePage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    totalItems: items.length,
  };
}
