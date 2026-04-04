import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useOrg } from "../../org/context/useOrg";
import { useApiData } from "../../../shared/hooks";
import { listStores } from "../api/storeApi";
import { StoreContext, type StoreContextType } from "./store-context";

const STORE_STORAGE_KEY = "ez_selected_store";

/** Read persisted store selection from localStorage. */
function readPersistedStore(): ExplicitSelection | null {
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.orgId && parsed?.storeId) return parsed as ExplicitSelection;
  } catch { /* ignore corrupt data */ }
  return null;
}

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Tracks an explicit store selection scoped to a specific org.
 * When the org changes the selection is automatically invalidated
 * without needing a useEffect + setState.
 */
interface ExplicitSelection {
  orgId: string;
  storeId: string;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { selectedOrgId } = useOrg();
  const [explicitSelection, setExplicitSelection] = useState<ExplicitSelection | null>(readPersistedStore);

  const { data: stores, isLoading, error } = useApiData(listStores, [selectedOrgId]);

  // Render-time state adjustment (React-documented pattern for derived state sync).
  // Tracks which org the current `stores` value was fetched for. When selectedOrgId
  // changes, committedOrgId lags by one render — orgChanged is true for that render,
  // causing resolvedStores to return []. After the immediate re-render triggered by
  // setCommittedOrgId, committedOrgId catches up and isLoading takes over until the
  // new fetch settles.
  const [committedOrgId, setCommittedOrgId] = useState<string | null>(selectedOrgId);
  const orgChanged = committedOrgId !== selectedOrgId;
  if (orgChanged) setCommittedOrgId(selectedOrgId);

  const resolvedStores = useMemo(
    () => (orgChanged || isLoading || stores == null ? [] : stores),
    [orgChanged, isLoading, stores]
  );

  // Only honour the explicit selection when it belongs to the current org
  const effectiveStoreId =
    explicitSelection?.orgId === selectedOrgId ? explicitSelection.storeId : null;

  const selectedStore = useMemo(() => {
    if (resolvedStores.length === 0) return null;
    if (effectiveStoreId) {
      return resolvedStores.find((s) => s.id === effectiveStoreId) ?? resolvedStores[0];
    }
    return resolvedStores[0];
  }, [resolvedStores, effectiveStoreId]);

  const switchStore = useCallback(
    (storeId: string) => {
      if (selectedOrgId && resolvedStores.find((s) => s.id === storeId)) {
        const sel = { orgId: selectedOrgId, storeId };
        setExplicitSelection(sel);
        try { localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(sel)); } catch { /* quota */ }
      }
    },
    [resolvedStores, selectedOrgId]
  );

  /* Persist auto-selected store (first store) so refresh remembers it */
  useEffect(() => {
    if (selectedStore && selectedOrgId) {
      try {
        localStorage.setItem(
          STORE_STORAGE_KEY,
          JSON.stringify({ orgId: selectedOrgId, storeId: selectedStore.id }),
        );
      } catch { /* quota */ }
    }
  }, [selectedStore, selectedOrgId]);

  const value: StoreContextType = useMemo(
    () => ({
      stores: resolvedStores,
      selectedStoreId: selectedStore?.id ?? null,
      selectedStoreName: selectedStore?.name ?? null,
      switchStore,
      isLoading,
      error,
    }),
    [resolvedStores, selectedStore, switchStore, isLoading, error]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
