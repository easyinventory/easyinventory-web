import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { setSelectedOrgId } from "../api/client";
import type { OrgMembership } from "../types";
import { OrgContext, type OrgContextType } from "./org-context";

interface OrgProviderProps {
  memberships: OrgMembership[];
  children: ReactNode;
}

export function OrgProvider({ memberships, children }: OrgProviderProps) {
  const [selectedOrgId, setSelectedOrgIdState] = useState<string | null>(null);

  // Sync selectedOrgId when memberships load or change
  useEffect(() => {
    if (memberships.length === 0) {
      setSelectedOrgIdState(null);
      setSelectedOrgId(null);
      return;
    }

    // If current selection is still valid, keep it
    const stillValid = memberships.some((m) => m.org_id === selectedOrgId);
    if (selectedOrgId && stillValid) return;

    // Otherwise, select the first membership
    const firstOrgId = memberships[0].org_id;
    setSelectedOrgIdState(firstOrgId);
    setSelectedOrgId(firstOrgId);
  }, [memberships]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchOrg = useCallback(
    (orgId: string) => {
      const membership = memberships.find((m) => m.org_id === orgId);
      if (!membership) return;
      setSelectedOrgIdState(orgId);
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
