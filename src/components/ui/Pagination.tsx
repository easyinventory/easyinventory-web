import "./Pagination.css";

const DEFAULT_PAGE_SIZES = [10, 25, 50] as const;

interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total item count (for "X–Y of Z" display) */
  totalItems: number;
  /** Current page size */
  pageSize: number;
  /** Available page size options */
  pageSizeOptions?: readonly number[];
  /** Called when prev/next is clicked */
  onPageChange: (page: number) => void;
  /** Called when a different page size is selected */
  onPageSizeChange?: (size: number) => void;
  /** If true, renders without card border (use inside an existing card) */
  inline?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageChange,
  onPageSizeChange,
  inline = false,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return (
    <div className={`pagination${inline ? " pagination--inline" : ""}`}>
      {onPageSizeChange ? (
        <div className="pagination__page-size">
          <span className="pagination__page-size-label">Rows:</span>
          {pageSizeOptions.map((size) => (
            <button
              key={size}
              className={`pagination__page-size-btn${
                pageSize === size ? " pagination__page-size-btn--active" : ""
              }`}
              onClick={() => onPageSizeChange(size)}
            >
              {size}
            </button>
          ))}
        </div>
      ) : (
        <div />
      )}

      <div className="pagination__info">
        {rangeStart}–{rangeEnd} of {totalItems}
      </div>

      <div className="pagination__nav">
        <button
          className="pagination__nav-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹ Prev
        </button>
        <button
          className="pagination__nav-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
