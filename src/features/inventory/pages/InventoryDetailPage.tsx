import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getInventoryEntry,
  updateInventoryEntry,
  deleteInventoryEntry,
  listPlacements,
  assignZone,
  removeFromZone,
} from "../api/inventoryApi";
import { listLayouts } from "../../store-layout/api/storeApi";
import type { StoreInventoryItem, InventoryPlacement } from "../../../shared/types";
import type { StoreLayout, LayoutZone } from "../../../shared/types";
import { useStore } from "../../store-layout/context/useStore";
import { useApiData } from "../../../shared/hooks/useApiData";
import { useAsyncAction } from "../../../shared/hooks/useAsyncAction";
import { extractApiError } from "../../../shared/utils";
import PageHeader from "../../../shared/components/layout/PageHeader";
import {
  ErrorBanner,
  LoadingState,
  SuccessBanner,
} from "../../../shared/components/ui";
import StockBadge from "../components/StockBadge";
import MovementHistory from "../components/MovementHistory";
import PlacementHistory from "../components/PlacementHistory";
import RecordReceiptModal from "../components/RecordReceiptModal";
import RecordSaleModal from "../components/RecordSaleModal";
import "./InventoryDetailPage.css";

type Tab = "movements" | "placements" | "settings";

function formatPrice(value: string | null): string {
  if (!value) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return `$${num.toFixed(2)}`;
}

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedStoreId } = useStore();
  const storeId = selectedStoreId ?? "";

  /* ── UUID validation — guard against route param collisions ── */
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidId = !!id && UUID_RE.test(id);

  /* ── Data fetching ── */
  const fetchEntry = useCallback(() => {
    if (!storeId || !isValidId) return Promise.resolve(null);
    return getInventoryEntry(storeId, id!);
  }, [storeId, isValidId, id]);

  const {
    data: item,
    isLoading,
    error,
    refetch,
  } = useApiData<StoreInventoryItem | null>(fetchEntry, [storeId, id]);

  /* ── Fetch current placement (zone) ── */
  const fetchPlacements = useCallback(() => {
    if (!storeId || !isValidId) return Promise.resolve([]);
    return listPlacements(storeId, id!);
  }, [storeId, isValidId, id]);

  const { data: placements, refetch: refetchPlacements } =
    useApiData<InventoryPlacement[]>(fetchPlacements, [storeId, id]);

  const currentPlacement = useMemo(
    () => placements?.find((p) => !p.ended_at) ?? null,
    [placements],
  );

  /* ── Fetch available zones from active layout ── */
  const fetchLayouts = useCallback(() => {
    if (!storeId) return Promise.resolve([]);
    return listLayouts(storeId);
  }, [storeId]);

  const { data: layouts } = useApiData<StoreLayout[]>(fetchLayouts, [storeId]);

  const availableZones: LayoutZone[] = useMemo(() => {
    if (!layouts || layouts.length === 0) return [];
    const active = layouts.find((l) => l.is_active);
    return active?.zones ?? [];
  }, [layouts]);

  /* ── Tabs ── */
  const [activeTab, setActiveTab] = useState<Tab>("movements");

  /* ── Settings form state ── */
  const [settingsPrice, setSettingsPrice] = useState("");
  const [settingsThreshold, setSettingsThreshold] = useState("");
  const [settingsZoneId, setSettingsZoneId] = useState("");

  // Sync settings form when item / placement data loads (adjust state during render)
  const [syncedItemId, setSyncedItemId] = useState<string | null>(null);
  if (item && item.id !== syncedItemId) {
    setSyncedItemId(item.id);
    setSettingsPrice(
      item.unit_price ? parseFloat(item.unit_price).toFixed(2) : "",
    );
    setSettingsThreshold(item.low_stock_threshold?.toString() ?? "");
  }

  const [syncedZoneId, setSyncedZoneId] = useState<string | undefined>(undefined);
  const placementZoneId = currentPlacement?.zone_id;
  if (placementZoneId !== syncedZoneId) {
    setSyncedZoneId(placementZoneId);
    setSettingsZoneId(placementZoneId ?? "");
  }

  const {
    execute: saveSettings,
    isLoading: isSaving,
    error: saveError,
    success: saveSuccess,
    reset: resetSave,
  } = useAsyncAction(async () => {
    if (!item) return;

    // 1. Validate & update price + threshold
    const priceVal = settingsPrice.trim() === "" ? null : settingsPrice.trim();
    if (priceVal !== null && isNaN(parseFloat(priceVal))) {
      throw new Error("Unit price must be a valid number.");
    }
    const thresholdVal =
      settingsThreshold.trim() === "" ? null : parseInt(settingsThreshold, 10);
    if (thresholdVal !== null && (isNaN(thresholdVal) || thresholdVal < 0)) {
      throw new Error("Low stock threshold must be a non-negative integer.");
    }

    await updateInventoryEntry(storeId, item.id, {
      unit_price: priceVal,
      low_stock_threshold: thresholdVal,
    });

    // 2. Handle zone change
    const currentZoneId = currentPlacement?.zone_id ?? "";
    if (settingsZoneId !== currentZoneId) {
      if (settingsZoneId === "" && currentZoneId) {
        // Remove from zone
        await removeFromZone(storeId, item.id);
      } else if (settingsZoneId) {
        // Assign to new zone
        await assignZone(storeId, item.id, { active_zone_id: settingsZoneId });
      }
      refetchPlacements();
    }

    refetch();
    return "Settings saved successfully.";
  });

  const handleSaveSettings = () => {
    resetSave();
    void saveSettings();
  };

  /* ── Delete / Deactivate ── */
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeactivate = async () => {
    if (!item) return;
    if (
      !confirm(
        `Deactivate "${item.product.name}" from this store's inventory? This cannot be undone.`,
      )
    )
      return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteInventoryEntry(storeId, item.id);
      navigate("/inventory");
    } catch (err: unknown) {
      setDeleteError(extractApiError(err));
      setIsDeleting(false);
    }
  };

  /* ── Record modals ── */
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSale, setShowSale] = useState(false);

  const handleMovementSuccess = () => {
    setShowReceipt(false);
    setShowSale(false);
    refetch();
  };

  const backTo = { label: "Back to Inventory", path: "/inventory" };

  /* ── Build subtitle: SKU · Category ── */
  const subtitle = [item?.product.sku, item?.product.category]
    .filter(Boolean)
    .join(" · ") || undefined;

  /* ── Loading / error states ── */
  if (isLoading) {
    return (
      <div>
        <PageHeader title="Inventory Item" subtitle="Loading..." backTo={backTo} />
        <LoadingState text="Loading inventory item..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Inventory Item" backTo={backTo} />
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!item) {
    return (
      <div>
        <PageHeader title="Inventory Item" backTo={backTo} />
        <ErrorBanner message="Inventory item could not be found. It may have been deleted, or the URL/store selection is invalid." />
      </div>
    );
  }

  return (
    <div className="inventory-detail">
      <PageHeader
        title={item.product.name}
        subtitle={subtitle}
        backTo={backTo}
      >
        <div className="inventory-detail__actions">
          <button
            className="inventory-detail__receipt-btn"
            onClick={() => setShowReceipt(true)}
          >
            + Receipt
          </button>
          <button
            className="inventory-detail__sale-btn"
            onClick={() => setShowSale(true)}
          >
            Record Sale
          </button>
        </div>
      </PageHeader>

      {deleteError && <ErrorBanner message={deleteError} />}

      {/* ── Info Card (read-only) ── */}
      <div className="inventory-detail__info-card">
        <div className="inventory-detail__info-grid">
          <div className="inventory-detail__info-item">
            <label>Current Quantity</label>
            <span className={`inventory-detail__qty-hero ${item.quantity === 0 ? "inventory-detail__qty-hero--zero" : ""}`}>
              {item.quantity}
            </span>
          </div>

          <div className="inventory-detail__info-item">
            <label>Default Sell Price</label>
            <span className="inventory-detail__price-hero">{formatPrice(item.unit_price)}</span>
          </div>

          <div className="inventory-detail__info-item">
            <label>Status</label>
            <StockBadge quantity={item.quantity} threshold={item.low_stock_threshold} />
          </div>

          <div className="inventory-detail__info-item">
            <label>Zone</label>
            {currentPlacement ? (
              <span className="inventory-detail__zone-badge">
                {currentPlacement.zone_name}
              </span>
            ) : (
              <span className="inventory-detail__empty">—</span>
            )}
          </div>

          <div className="inventory-detail__info-item">
            <label>Low Stock Threshold</label>
            <span>{item.low_stock_threshold ?? <span className="inventory-detail__empty">—</span>}</span>
          </div>

          <div className="inventory-detail__info-item">
            <label>Category</label>
            <span>{item.product.category || <span className="inventory-detail__empty">—</span>}</span>
          </div>
        </div>
      </div>

      {/* ── Tabbed Section ── */}
      <div className="inventory-detail__tabs-card">
        <div className="inventory-detail__tab-bar">
          <button
            className={`inventory-detail__tab ${activeTab === "movements" ? "inventory-detail__tab--active" : ""}`}
            onClick={() => setActiveTab("movements")}
          >
            Movement History
          </button>
          <button
            className={`inventory-detail__tab ${activeTab === "placements" ? "inventory-detail__tab--active" : ""}`}
            onClick={() => setActiveTab("placements")}
          >
            Placement History
          </button>
          <button
            className={`inventory-detail__tab ${activeTab === "settings" ? "inventory-detail__tab--active" : ""}`}
            onClick={() => {
              resetSave();
              setActiveTab("settings");
            }}
          >
            Settings
          </button>
        </div>

        <div className="inventory-detail__tab-content">
          {activeTab === "movements" && (
            <MovementHistory storeId={storeId} inventoryId={item.id} />
          )}
          {activeTab === "placements" && (
            <PlacementHistory storeId={storeId} inventoryId={item.id} />
          )}
          {activeTab === "settings" && (
            <div className="inventory-detail__settings">
              {saveError && <ErrorBanner message={saveError} />}
              {saveSuccess && <SuccessBanner message={saveSuccess} />}

              <div className="inventory-detail__settings-row">
                <div className="inventory-detail__field">
                  <label className="inventory-detail__field-label">
                    Default Sell Price ($)
                  </label>
                  <input
                    className="inventory-detail__field-input"
                    type="text"
                    inputMode="decimal"
                    value={settingsPrice}
                    onChange={(e) => setSettingsPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="inventory-detail__field">
                  <label className="inventory-detail__field-label">
                    Low Stock Threshold
                  </label>
                  <input
                    className="inventory-detail__field-input"
                    type="number"
                    min="0"
                    value={settingsThreshold}
                    onChange={(e) => setSettingsThreshold(e.target.value)}
                    placeholder="Not set"
                  />
                </div>
              </div>

              <div className="inventory-detail__field">
                <label className="inventory-detail__field-label">
                  Assigned Zone
                </label>
                <select
                  className="inventory-detail__field-select"
                  value={settingsZoneId}
                  onChange={(e) => setSettingsZoneId(e.target.value)}
                >
                  <option value="">No zone assigned</option>
                  {availableZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inventory-detail__settings-footer">
                <button
                  className="inventory-detail__save-btn"
                  disabled={isSaving}
                  onClick={handleSaveSettings}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div className="inventory-detail__deactivate-section">
                <button
                  className="inventory-detail__deactivate-btn"
                  disabled={isDeleting}
                  onClick={() => void handleDeactivate()}
                >
                  {isDeleting ? "Deactivating..." : "Deactivate Inventory Item"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showReceipt && (
        <RecordReceiptModal
          storeId={storeId}
          item={item}
          onSuccess={handleMovementSuccess}
          onClose={() => setShowReceipt(false)}
        />
      )}
      {showSale && (
        <RecordSaleModal
          storeId={storeId}
          item={item}
          onSuccess={handleMovementSuccess}
          onClose={() => setShowSale(false)}
        />
      )}
    </div>
  );
}
