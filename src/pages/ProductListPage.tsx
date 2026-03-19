import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listProducts, type Product } from "../api/productApi";
import PageHeader from "../shared/components/layout/PageHeader";
import { ProductTable } from "../components/products";
import { useApiData } from "../hooks/useApiData";
import { usePagination } from "../hooks/usePagination";
import { EmptyState, ErrorBanner, LoadingState, Pagination } from "../shared/components/ui";
import "./ProductListPage.css";

export default function ProductListPage() {
  const navigate = useNavigate();
  const fetchProducts = useCallback(() => listProducts(), []);
  const { data: productsData, isLoading, error } = useApiData<Product[]>(fetchProducts);

  const products = useMemo(() => productsData ?? [], [productsData]);

  const [search, setSearch] = useState("");

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
  const {
    paginatedItems: pageSlice,
    page,
    pageSize,
    pageSizeOptions,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination(filtered);

  /* Reset to page 1 when search changes */
  const handleSearchChange = (value: string) => {
    setSearch(value);
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

              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
