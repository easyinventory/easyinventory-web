import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  updateSupplier,
  type Supplier,
  type SupplierCreateRequest,
} from "../api/supplierApi";
import { useAuth } from "../../auth/context/useAuth";
import PageHeader from "../../../shared/components/layout/PageHeader";
import {
  SupplierForm,
  SupplierSearchSelect,
  type SupplierFormValues,
} from "../components";
import { isOrgAdmin } from "../../../shared/constants/roles";
import { useApiData } from "../../../shared/hooks/useApiData";
import { extractApiError } from "../../../shared/utils";
import { ErrorBanner, LoadingState } from "../../../shared/components/ui";
import "./SuppliersPage.css";

const EMPTY_FORM: SupplierFormValues = {
  name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  notes: "",
};

const SELECTED_SUPPLIER_STORAGE_KEY = "suppliers:selectedSupplierId";
const SUPPLIER_FORM_ID = "supplier-form";

function toFormValues(supplier: Supplier): SupplierFormValues {
  return {
    name: supplier.name || "",
    contact_name: supplier.contact_name || "",
    contact_email: supplier.contact_email || "",
    contact_phone: supplier.contact_phone || "",
    notes: supplier.notes || "",
  };
}

export default function SuppliersPage() {
  const { profile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState<SupplierFormValues>(EMPTY_FORM);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const successTimeoutRef = useRef<number | null>(null);

  const fetchSuppliers = useCallback(() => listSuppliers(), []);
  const {
    data: suppliersData,
    isLoading,
    error,
  } = useApiData<Supplier[]>(fetchSuppliers, [refreshKey]);

  const suppliers = useMemo(() => suppliersData ?? [], [suppliersData]);
  const canDeleteSuppliers = isOrgAdmin(profile?.org_role);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedSupplierId(null);
  };

  const persistSelectedSupplierId = (supplierId: string | null) => {
    if (!supplierId) {
      localStorage.removeItem(SELECTED_SUPPLIER_STORAGE_KEY);
      return;
    }

    localStorage.setItem(SELECTED_SUPPLIER_STORAGE_KEY, supplierId);
  };

  const loadSupplierIntoForm = useCallback((supplier: Supplier) => {
    setSelectedSupplierId(supplier.id);
    setForm(toFormValues(supplier));
  }, []);

  useEffect(() => {
    if (suppliers.length === 0) {
      return;
    }

    const storedId = localStorage.getItem(SELECTED_SUPPLIER_STORAGE_KEY);
    if (!storedId) {
      return;
    }

    const storedSupplier = suppliers.find((supplier) => supplier.id === storedId);
    if (!storedSupplier) {
      localStorage.removeItem(SELECTED_SUPPLIER_STORAGE_KEY);
      return;
    }

    if (selectedSupplierId === storedSupplier.id) {
      return;
    }

    loadSupplierIntoForm(storedSupplier);
  }, [loadSupplierIntoForm, selectedSupplierId, suppliers]);

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

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current !== null) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const toPayload = (): SupplierCreateRequest => ({
    name: form.name.trim(),
    contact_name: form.contact_name.trim() || undefined,
    contact_email: form.contact_email.trim() || undefined,
    contact_phone: form.contact_phone.trim() || undefined,
    notes: form.notes.trim() || undefined,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionError(null);
    setSuccess(null);

    if (!form.name.trim()) {
      setActionError("Supplier name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = toPayload();

      if (selectedSupplierId) {
        await updateSupplier(selectedSupplierId, payload);
        setSuccessMessage("Supplier updated.");
      } else {
        const createdSupplier = await createSupplier(payload);
        loadSupplierIntoForm(createdSupplier);
        persistSelectedSupplierId(createdSupplier.id);
        setSuccessMessage("Supplier created.");
      }

      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      setActionError(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setActionError(null);
    setSuccess(null);
    loadSupplierIntoForm(supplier);
    persistSelectedSupplierId(supplier.id);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!canDeleteSuppliers) {
      return;
    }

    if (!confirm(`Delete supplier "${supplier.name}"?`)) {
      return;
    }

    setActionError(null);
    setSuccess(null);
    setIsDeletingId(supplier.id);

    try {
      await deleteSupplier(supplier.id);

      if (selectedSupplierId === supplier.id) {
        resetForm();
        persistSelectedSupplierId(null);
      }

      setSuccessMessage("Supplier deleted.");
    } catch (err: unknown) {
      setActionError(extractApiError(err));
    } finally {
      setIsDeletingId(null);
    }
  };

  const isEditing = !!selectedSupplierId;
  const handleFieldChange = (field: keyof SupplierFormValues, nextValue: string) => {
    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleAddSupplier = () => {
    setActionError(null);
    setSuccess(null);
    resetForm();
    persistSelectedSupplierId(null);
  };

  const handleSupplierSelection = (supplierId: string) => {
    if (!supplierId) {
      handleAddSupplier();
      return;
    }

    const supplier = suppliers.find((item) => item.id === supplierId);
    if (!supplier) {
      return;
    }

    handleEdit(supplier);
  };

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null,
    [selectedSupplierId, suppliers]
  );

  return (
    <div className="suppliers-page">
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendor contacts and information"
      />

      <div className="suppliers-page__toolbar-card">
        <div className="suppliers-page__toolbar-grid">
          <SupplierSearchSelect
            suppliers={suppliers}
            selectedSupplierId={selectedSupplierId}
            disabled={isLoading}
            onSelectSupplier={handleSupplierSelection}
          />

          <div className="suppliers-page__add-wrap">
            <button
              type={isEditing ? "button" : "submit"}
              form={isEditing ? undefined : SUPPLIER_FORM_ID}
              className="suppliers-page__add-btn"
              onClick={isEditing ? handleAddSupplier : undefined}
              disabled={isSubmitting || isLoading}
            >
              Add supplier
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <LoadingState text="Loading suppliers..." />
      ) : (
        <SupplierForm
          formId={SUPPLIER_FORM_ID}
          value={form}
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          canDelete={canDeleteSuppliers}
          isDeleting={!!selectedSupplierId && isDeletingId === selectedSupplierId}
          actionError={actionError}
          success={success}
          onSubmit={handleSubmit}
          onCancel={handleAddSupplier}
          onDelete={() => {
            if (!selectedSupplier) {
              return;
            }
            void handleDelete(selectedSupplier);
          }}
          onFieldChange={handleFieldChange}
        />
      )}
    </div>
  );
}