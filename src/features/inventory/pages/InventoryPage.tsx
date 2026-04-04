import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listInventory, listPlacements } from "../api/inventoryApi";
import { listLayouts } from "../../store-layout/api/storeApi";
import type { StoreLayout, LayoutZone } from "../../../shared/types";
import type {
  PaginatedInventoryResponse,
  StoreInventoryItem,
} from "../../../shared/types";
import { listProducts, type Product } from "../../products/api/productApi";
import { useStore } from "../../store-layout/context/useStore";
import { useApiData } from "../../../shared/hooks/useApiData";
import PageHeader from "../../../shared/components/layout/PageHeader";
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
  Pagination,
} from "../../../shared/components/ui";
import InventoryTable from "../components/InventoryTable";
import StockProductModal from "../components/StockProductModal";
import "./InventoryPage.css";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEBOUNCE_MS = 300;

export default function InventoryPage() {
  const navigate = useNavigate();
  const { selectedStoreId, selectedStoreName } = useStore();
  const storeId = selectedStoreId ?? "";

  /* ── Local state ── */
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockedIds, setStockedIds] = useState<Set<string>>(new Set());

  /* ── Debounce search input ── */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current != null) clearTimeout(debounceRef.current);
    };
  }, [search]);

  /* ── Fetch paginated inventory (server-side) ── */
  const fetchInventory = useCallback(() => {
    if (!storeId) return Promise.resolve(null);
    return listInventory(storeId, {
      search: debouncedSearch || undefined,
      category: category || undefined,
      page,
      page_size: pageSize,
    });
  }, [storeId, debouncedSearch, category, page, pageSize]);

  const {
    data: inventoryData,
    isLoading,
    error,
    refetch,
  } = useApiData<PaginatedInventoryResponse | null>(fetchInventory, [
    storeId,
    debouncedSearch,
    category,
    page,
    pageSize,
  ]);

  const items = useMemo<StoreInventoryItem[]>(
    () => inventoryData?.items ?? [],
    [inventoryData],
  );
  const totalItems = inventoryData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  /* ── Fetch all org products (for Stock modal + categories) ── */
  const fetchProducts = useCallback(() => listProducts(), []);
  const { data: productsData } = useApiData<Product[]>(fetchProducts);
  const allProducts = useMemo(() => productsData ?? [], [productsData]);

  /* ── Fetch all inventory (unfiltered) for stats + stocked IDs ── */
  const fetchAllInventory = useCallback(() => {
    if (!storeId) return Promise.resolve(null);
    return listInventory(storeId, { page_size: 100 });
  }, [storeId]);
  const { data: allInventory, refetch: refetchAll } =
    useApiData<PaginatedInventoryResponse | null>(fetchAllInventory, [storeId]);

  const stats = useMemo(() => {
    const all = allInventory?.items ?? [];
    return {
      totalProducts: all.length,
      totalUnits: all.reduce((sum, i) => sum + i.quantity, 0),
      lowStock: all.filter(
        (i) =>
          i.quantity > 0 &&
          i.low_stock_threshold != null &&
          i.quantity <= i.low_stock_threshold,
      ).length,
      outOfStock: all.filter((i) => i.quantity === 0).length,
    };
  }, [allInventory]);

  /* ── Refresh stocked IDs for Stock modal ── */
  const refreshStockedIds = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await listInventory(storeId, { page_size: 10000 });
      setStockedIds(new Set(data.items.map((i) => i.product_id)));
    } catch {
      // Fall back to empty set — backend will still reject duplicates
    }
  }, [storeId]);

  /* ── Category options (from org products) ── */
  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [allProducts]);

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

  /* ── Zone map: inventoryId → zone name ── */
  const [zoneMap, setZoneMap] = useState<Map<string, string | null>>(new Map());
  const zoneCacheRef = useRef<Map<string, string | null>>(new Map());

  useEffect(() => {
    let cancelled = false;
    async function fetchZones() {
      if (!storeId || items.length === 0) {
        if (!cancelled) {
          setZoneMap(new Map());
          zoneCacheRef.current.clear();
        }
        return;
      }

      const cache = zoneCacheRef.current;
      const map = new Map<string, string | null>();

      for (const item of items) {
        if (cancelled) break;

        if (cache.has(item.id)) {
          map.set(item.id, cache.get(item.id) ?? null);
          continue;
        }

        try {
          const placements = await listPlacements(storeId, item.id);
          const current = placements.find((p) => !p.ended_at);
          const zoneName = current?.zone_name ?? null;
          cache.set(item.id, zoneName);
          map.set(item.id, zoneName);
        } catch {
          cache.set(item.id, null);
          map.set(item.id, null);
        }
      }

      if (!cancelled) {
        setZoneMap(map);
      }
    }
    void fetchZones();
    return () => {
      cancelled = true;
    };
  }, [storeId, items]);

  /* ── Handlers ── */
  const handleRowClick = (item: StoreInventoryItem) => {
    navigate(`/inventory/${item.id}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleStockSuccess = () => {
    setShowStockModal(false);
    refetch();
    refetchAll();
  };

  /* ── No store selected ── */
  if (!storeId) {
    return (
      <div className="inventory-page">
        <PageHeader title="Inventory" subtitle="Track stock across locations" />
        <EmptyState message="Select a store to view inventory." />
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <PageHeader
        title="Inventory"
        subtitle={selectedStoreName ? `Stock for ${selectedStoreName}` : "Track stock across locations"}
      >
        <button
          className="btn"
          onClick={() => navigate("/inventory/heatmap")}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
            <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" />
            <path d="M2.5 7.5 L17.5 7.5" />
            <path d="M8.5 7.5 L8.5 17.5" />
          </svg>
          View Heatmap
        </button>
        <button
          className="inventory-page__stock-btn"
          onClick={async () => {
            await refreshStockedIds();
            setShowStockModal(true);
          }}
        >
          Stock product
        </button>
      </PageHeader>

      {/* ── Summary stat cards ── */}
      <div className="inventory-page__stats">
        <div className="inventory-page__stat-card">
          <span className="inventory-page__stat-label">Total Products</span>
          <span className="inventory-page__stat-value">{stats.totalProducts}</span>
        </div>
        <div className="inventory-page__stat-card">
          <span className="inventory-page__stat-label">Total Units</span>
          <span className="inventory-page__stat-value">{stats.totalUnits}</span>
        </div>
        <div className="inventory-page__stat-card">
          <span className="inventory-page__stat-label">Low Stock</span>
          <span className="inventory-page__stat-value inventory-page__stat-value--warning">{stats.lowStock}</span>
        </div>
        <div className="inventory-page__stat-card">
          <span className="inventory-page__stat-label">Out of Stock</span>
          <span className="inventory-page__stat-value inventory-page__stat-value--danger">{stats.outOfStock}</span>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <LoadingState text="Loading inventory..." />
      ) : (
        <>
          {/* ── Toolbar: search + category filter ── */}
          <div className="inventory-page__toolbar-card">
            <input
              className="inventory-page__search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
            />
            {categories.length > 0 && (
              <select
                className="inventory-page__category-select"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyState
              message={
                debouncedSearch || category
                  ? "No inventory items match your filters."
                  : "No products stocked yet. Stock your first product to get started."
              }
            />
          ) : (
            <>
              <InventoryTable
                items={items}
                zoneMap={zoneMap}
                onRowClick={handleRowClick}
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </>
      )}

      {/* ── Stock Product Modal ── */}
      {showStockModal && (
        <StockProductModal
          storeId={storeId}
          allProducts={allProducts}
          stockedProductIds={stockedIds}
          availableZones={availableZones}
          onSuccess={handleStockSuccess}
          onClose={() => setShowStockModal(false)}
        />
      )}
    </div>
  );
}