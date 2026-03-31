import { createContext } from "react";
import type { Store } from "../../../shared/types";

export interface StoreContextType {
  /** All stores for the current org */
  stores: Store[];
  /** Currently selected store ID (null while loading or org has no stores) */
  selectedStoreId: string | null;
  /** Currently selected store name */
  selectedStoreName: string | null;
  /** Switch to a different store */
  switchStore: (storeId: string) => void;
  /** True while the stores list is being fetched */
  isLoading: boolean;
  /** Error message if the stores fetch failed, null otherwise */
  error: string | null;
}

export const StoreContext = createContext<StoreContextType | null>(null);
