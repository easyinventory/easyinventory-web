import { useContext } from "react";
import { OrgContext, type OrgContextType } from "./org-context";

export function useOrg(): OrgContextType {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}
