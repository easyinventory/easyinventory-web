import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  getProduct,
  updateProduct,
  type ProductWithSuppliers,
} from "../api/productApi";
import PageHeader from "../components/layout/PageHeader";
import { ProductForm, type ProductFormValues } from "../components/products";
import { useApiData } from "../hooks/useApiData";
import { extractApiError } from "../utils";
import { ErrorBanner, LoadingState } from "../components/ui";

const EMPTY_FORM: ProductFormValues = {
  name: "",
  description: "",
  sku: "",
  category: "",
};

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form, setForm] = useState<ProductFormValues>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const successTimeoutRef = useRef<number | null>(null);
  const formPopulated = useRef(false);

  /* ── Load existing product for edit mode ── */
  const fetchProduct = useCallback(
    () => (id ? getProduct(id) : Promise.resolve(null)),
    [id]
  );

  const {
    data: existingProduct,
    isLoading,
    error: loadError,
  } = useApiData<ProductWithSuppliers | null>(fetchProduct, [id]);

  useEffect(() => {
    if (existingProduct && !formPopulated.current) {
      setForm({
        name: existingProduct.name || "",
        description: existingProduct.description || "",
        sku: existingProduct.sku || "",
        category: existingProduct.category || "",
      });
      formPopulated.current = true;
    }
  }, [existingProduct]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current !== null) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const setSuccessMessage = (message: string) => {
    setSuccess(message);
    if (successTimeoutRef.current !== null) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = window.setTimeout(() => {
      setSuccess(null);
      successTimeoutRef.current = null;
    }, 3000);
  };

  const handleFieldChange = (
    field: keyof ProductFormValues,
    nextValue: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionError(null);
    setSuccess(null);

    if (!form.name.trim()) {
      setActionError("Product name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        sku: form.sku.trim() || undefined,
        category: form.category.trim() || undefined,
      };

      if (isEditMode && id) {
        await updateProduct(id, payload);
        setSuccessMessage("Product updated.");
      } else {
        const created = await createProduct(payload);
        navigate(`/products/${created.id}`);
      }
    } catch (err: unknown) {
      setActionError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/products/${id}`);
    } else {
      navigate("/products");
    }
  };

  /* ── Loading state for edit mode ── */
  const backTo = isEditMode && id
    ? { label: "Back to product", path: `/products/${id}` }
    : { label: "Back to products", path: "/products" };

  if (isEditMode && isLoading) {
    return (
      <div>
        <PageHeader title="Edit product" subtitle="Loading..." backTo={backTo} />
        <LoadingState text="Loading product..." />
      </div>
    );
  }

  if (isEditMode && loadError) {
    return (
      <div>
        <PageHeader title="Edit product" backTo={backTo} />
        <ErrorBanner message={loadError} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit product" : "New product"}
        subtitle={
          isEditMode
            ? "Update the product details below"
            : "Fill in the details to create a new product"
        }
        backTo={backTo}
      />

      <ProductForm
        value={form}
        isSubmitting={isSubmitting}
        actionError={actionError}
        success={success}
        submitLabel={isEditMode ? "Save changes" : "Create product"}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
}
