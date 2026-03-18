import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProduct,
  deleteProduct,
  addSupplierToProduct,
  toggleProductSupplier,
  removeProductSupplier,
  type ProductWithSuppliers,
} from "../api/productApi";
import { listSuppliers, type Supplier } from "../api/supplierApi";
import { useAuth } from "../auth/useAuth";
import PageHeader from "../components/layout/PageHeader";
import {
  ProductSupplierTable,
  AddSupplierModal,
} from "../components/products";
import { isOrgAdmin } from "../constants/roles";
import { useApiData } from "../hooks/useApiData";
import { extractApiError, formatDate } from "../utils";
import { EmptyState, ErrorBanner, LoadingState } from "../components/ui";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const canDelete = isOrgAdmin(profile?.org_role);

  /* ── Data fetching ── */
  const fetchProduct = useCallback(() => getProduct(id!), [id]);
  const fetchSuppliers = useCallback(() => listSuppliers(), []);

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useApiData<ProductWithSuppliers>(fetchProduct, [id]);

  const { data: allSuppliers } = useApiData<Supplier[]>(fetchSuppliers);

  const suppliers = useMemo(() => product?.product_suppliers ?? [], [product]);
  const orgSuppliers = useMemo(() => allSuppliers ?? [], [allSuppliers]);

  /* ── Action state ── */
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  /* ── Handlers ── */
  const handleDelete = async () => {
    if (!canDelete || !product) return;
    if (!confirm(`Delete product "${product.name}"? This will remove all supplier links.`)) return;

    setActionError(null);
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      navigate("/products");
    } catch (err: unknown) {
      setActionError(extractApiError(err));
      setIsDeleting(false);
    }
  };

  const handleToggle = async (supplierId: string, currentActive: boolean) => {
    if (!product) return;
    setActionError(null);
    setTogglingId(supplierId);
    try {
      await toggleProductSupplier(product.id, supplierId, {
        is_active: !currentActive,
      });
      refetch();
    } catch (err: unknown) {
      setActionError(extractApiError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleRemove = async (supplierId: string, supplierName: string) => {
    if (!product) return;
    if (!confirm(`Remove supplier "${supplierName}" from this product?`)) return;

    setActionError(null);
    setRemovingId(supplierId);
    try {
      await removeProductSupplier(product.id, supplierId);
      refetch();
    } catch (err: unknown) {
      setActionError(extractApiError(err));
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddSupplier = async (supplierId: string) => {
    if (!product) return;
    setAddError(null);
    setIsAdding(true);
    try {
      await addSupplierToProduct(product.id, { supplier_id: supplierId });
      setShowAddModal(false);
      refetch();
    } catch (err: unknown) {
      setAddError(extractApiError(err));
    } finally {
      setIsAdding(false);
    }
  };

  const backTo = { label: "Back to products", path: "/products" };

  /* ── Render ── */
  if (isLoading) {
    return (
      <div>
        <PageHeader title="Product" subtitle="Loading..." backTo={backTo} />
        <LoadingState text="Loading product..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Product" backTo={backTo} />
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div>
      <PageHeader title={product.name} subtitle={product.category || undefined} backTo={backTo}>
        <div className="product-detail-page__actions">
          <button
            className="product-detail-page__edit-btn"
            onClick={() => navigate(`/products/${product.id}/edit`)}
          >
            Edit
          </button>
          {canDelete && (
            <button
              className="product-detail-page__delete-btn"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </PageHeader>

      {actionError && <ErrorBanner message={actionError} />}

      {/* ── Product Info Card ── */}
      <div className="product-detail-page__info-card">
        <div className="product-detail-page__info-grid">
          <div className="product-detail-page__info-item">
            <label>SKU</label>
            <span>
              {product.sku || (
                <span className="product-detail-page__info-empty">—</span>
              )}
            </span>
          </div>
          <div className="product-detail-page__info-item">
            <label>Category</label>
            <span>
              {product.category || (
                <span className="product-detail-page__info-empty">—</span>
              )}
            </span>
          </div>
          <div className="product-detail-page__info-item">
            <label>Created</label>
            <span>{formatDate(product.created_at)}</span>
          </div>
        </div>

        {product.description && (
          <div className="product-detail-page__description">
            <label>Description</label>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {/* ── Suppliers Section ── */}
      <div className="product-detail-page__section-header">
        <span className="product-detail-page__section-title">Suppliers</span>
        <button
          className="product-detail-page__section-btn"
          onClick={() => {
            setAddError(null);
            setShowAddModal(true);
          }}
        >
          Add supplier
        </button>
      </div>

      {suppliers.length === 0 ? (
        <EmptyState message="No suppliers linked to this product yet." />
      ) : (
        <ProductSupplierTable
          suppliers={suppliers}
          canDelete={canDelete}
          togglingId={togglingId}
          removingId={removingId}
          onToggle={handleToggle}
          onRemove={handleRemove}
        />
      )}

      {/* ── Add Supplier Modal ── */}
      {showAddModal && (
        <AddSupplierModal
          suppliers={orgSuppliers}
          linkedSuppliers={suppliers}
          isAdding={isAdding}
          addError={addError}
          onAdd={handleAddSupplier}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
