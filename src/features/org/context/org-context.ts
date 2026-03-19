import { createContext } from "react";
import type { OrgMembership } from "../../../shared/types";

export interface OrgContextType {
  /** All memberships for the current user */
  memberships: OrgMembership[];
  /** Currently selected org ID (null if no memberships) */
  selectedOrgId: string | null;
  /** Currently selected org name */
  selectedOrgName: string | null;
  /** Currently selected org role */
  selectedOrgRole: string | null;
  /** Switch to a different org */
  switchOrg: (orgId: string) => void;
  /** Whether the user belongs to multiple orgs */
  hasMultipleOrgs: boolean;
}

export const OrgContext = createContext<OrgContextType | null>(null);
