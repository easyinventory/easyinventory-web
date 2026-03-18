import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listProducts, type Product } from "../api/productApi";
import PageHeader from "../components/layout/PageHeader";
import { ProductTable } from "../components/products";
import { useApiData } from "../hooks/useApiData";
import { EmptyState, ErrorBanner, LoadingState } from "../components/ui";
import "./ProductListPage.css";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export default function ProductListPage() {
  const navigate = useNavigate();
  const fetchProducts = useCallback(() => listProducts(), []);
  const { data: productsData, isLoading, error } = useApiData<Product[]>(fetchProducts);

  const products = useMemo(() => productsData ?? [], [productsData]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  /* ── Filter products by search query ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.sku, p.category]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [products, search]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageSlice = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  /* Reset to page 1 when search or page size change */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleRowClick = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  const hasProducts = products.length > 0;

  return (
    <div className="products-page">
      <PageHeader title="Products" subtitle="Manage your product catalog">
        <button
          className="products-page__add-btn"
          onClick={() => navigate("/products/new")}
        >
          Add product
        </button>
      </PageHeader>

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <LoadingState text="Loading products..." />
      ) : !hasProducts ? (
        <EmptyState message="No products yet. Add your first product to get started." />
      ) : (
        <>
          {/* ── Search bar ── */}
          <div className="products-page__toolbar-card">
            <input
              className="products-page__search"
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, SKU, or category..."
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState message="No products match your search." />
          ) : (
            <>
              <ProductTable products={pageSlice} onRowClick={handleRowClick} />

              {/* ── Pagination ── */}
              <div className="products-page__pagination">
                <div className="products-page__page-size">
                  <span className="products-page__page-size-label">Rows:</span>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      className={`products-page__page-size-btn${
                        pageSize === size ? " products-page__page-size-btn--active" : ""
                      }`}
                      onClick={() => handlePageSizeChange(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="products-page__page-info">
                  {(safePage - 1) * pageSize + 1}–
                  {Math.min(safePage * pageSize, filtered.length)} of{" "}
                  {filtered.length}
                </div>

                <div className="products-page__page-nav">
                  <button
                    className="products-page__page-btn"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ‹ Prev
                  </button>
                  <button
                    className="products-page__page-btn"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
