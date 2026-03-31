import { useState, useCallback, useMemo, type ReactNode } from "react";
import { useOrg } from "../../org/context/useOrg";
import { useApiData } from "../../../shared/hooks";
import { listStores } from "../api/storeApi";
import { StoreContext, type StoreContextType } from "./store-context";

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
  const [explicitSelection, setExplicitSelection] = useState<ExplicitSelection | null>(null);

  const { data: stores, isLoading } = useApiData(listStores, [selectedOrgId]);

  const resolvedStores = useMemo(() => stores ?? [], [stores]);

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
        setExplicitSelection({ orgId: selectedOrgId, storeId });
      }
    },
    [resolvedStores, selectedOrgId]
  );

  const value: StoreContextType = useMemo(
    () => ({
      stores: resolvedStores,
      selectedStoreId: selectedStore?.id ?? null,
      selectedStoreName: selectedStore?.name ?? null,
      switchStore,
      isLoading,
    }),
    [resolvedStores, selectedStore, switchStore, isLoading]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
