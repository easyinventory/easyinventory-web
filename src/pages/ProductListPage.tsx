import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listProducts, type Product } from "../api/productApi";
import PageHeader from "../components/layout/PageHeader";
import { ProductTable } from "../components/products";
import { useApiData } from "../hooks/useApiData";
import { EmptyState, ErrorBanner, LoadingState } from "../components/ui";
import "./ProductListPage.css";

export default function ProductListPage() {
  const navigate = useNavigate();
  const fetchProducts = useCallback(() => listProducts(), []);
  const { data: productsData, isLoading, error } = useApiData<Product[]>(fetchProducts);

  const products = useMemo(() => productsData ?? [], [productsData]);

  const handleRowClick = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

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
      ) : products.length === 0 ? (
        <EmptyState message="No products yet. Add your first product to get started." />
      ) : (
        <ProductTable products={products} onRowClick={handleRowClick} />
      )}
    </div>
  );
}
