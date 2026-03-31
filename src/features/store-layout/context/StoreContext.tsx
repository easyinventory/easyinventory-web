import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useOrg } from "../../org/context/useOrg";
import { useApiData } from "../../../shared/hooks";
import { listStores } from "../api/storeApi";
import { StoreContext, type StoreContextType } from "./store-context";

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { selectedOrgId } = useOrg();
  const [explicitStoreId, setExplicitStoreId] = useState<string | null>(null);

  const {
    data: stores,
    isLoading,
  } = useApiData(listStores, [selectedOrgId]);

  const resolvedStores = stores ?? [];

  // When the stores list changes (org switch or first load), reset to the first store
  useEffect(() => {
    setExplicitStoreId(null);
  }, [selectedOrgId]);

  const selectedStore = useMemo(() => {
    if (resolvedStores.length === 0) return null;
    if (explicitStoreId) {
      return resolvedStores.find((s) => s.id === explicitStoreId) ?? resolvedStores[0];
    }
    return resolvedStores[0];
  }, [resolvedStores, explicitStoreId]);

  const switchStore = useCallback(
    (storeId: string) => {
      if (resolvedStores.find((s) => s.id === storeId)) {
        setExplicitStoreId(storeId);
      }
    },
    [resolvedStores]
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
