import { useState, useCallback, useMemo, type ReactNode } from "react";
import { setSelectedOrgId } from "../../../shared/api/client";
import type { OrgMembership } from "../../../shared/types";
import { OrgContext, type OrgContextType } from "./org-context";

interface OrgProviderProps {
  memberships: OrgMembership[];
  children: ReactNode;
}

/**
 * Compute the org ID to use given memberships and the user's explicit choice.
 * Returns the explicit choice if still valid, otherwise the first membership.
 */
function resolveOrgId(
  memberships: OrgMembership[],
  explicitOrgId: string | null
): string | null {
  if (explicitOrgId && memberships.some((m) => m.org_id === explicitOrgId)) {
    return explicitOrgId;
  }
  return memberships.length > 0 ? memberships[0].org_id : null;
}

export function OrgProvider({ memberships, children }: OrgProviderProps) {
  const [explicitOrgId, setExplicitOrgId] = useState<string | null>(null);

  const selectedOrgId = resolveOrgId(memberships, explicitOrgId);

  // Keep API client header in sync
  setSelectedOrgId(selectedOrgId);

  const switchOrg = useCallback(
    (orgId: string) => {
      const membership = memberships.find((m) => m.org_id === orgId);
      if (!membership) return;
      setExplicitOrgId(orgId);
      setSelectedOrgId(orgId);
    },
    [memberships]
  );

  const currentMembership = useMemo(
    () => memberships.find((m) => m.org_id === selectedOrgId) ?? null,
    [memberships, selectedOrgId]
  );

  const selectedOrgName = currentMembership?.organization.name ?? null;
  const selectedOrgRole = currentMembership?.org_role ?? null;

  const value: OrgContextType = useMemo(
    () => ({
      memberships,
      selectedOrgId,
      selectedOrgName,
      selectedOrgRole,
      switchOrg,
      hasMultipleOrgs: memberships.length > 1,
    }),
    [memberships, selectedOrgId, selectedOrgName, selectedOrgRole, switchOrg]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}
