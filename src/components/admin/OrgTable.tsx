import { useCallback, useState } from "react";
import { listOrgs } from "../../api/adminApi";
import type { OrgListItem } from "../../api/adminApi";
import { useApiData } from "../../hooks/useApiData";
import { formatDate } from "../../utils";
import { EmptyState, ErrorBanner, LoadingState } from "../ui";
import OrgMembersModal from "./OrgMembersModal";
import "./OrgTable.css";

interface OrgTableProps {
  refreshKey: number;
}

export default function OrgTable({ refreshKey }: OrgTableProps) {
  const fetchOrgs = useCallback(() => listOrgs(), []);
  const {
    data: orgsData,
    isLoading,
    error,
  } = useApiData<OrgListItem[]>(fetchOrgs, [refreshKey]);
  const orgs = orgsData ?? [];

  const [viewMembersOrg, setViewMembersOrg] = useState<OrgListItem | null>(null);

  return (
    <div className="org-table">
      <div className="org-table__title">All organizations ({orgs.length})</div>

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <LoadingState text="Loading organizations..." />
      ) : orgs.length === 0 ? (
        <EmptyState message="No organizations yet. Create one above." />
      ) : (
        <>
          <div className="org-table__header">
            <span>Organization</span>
            <span>Owner</span>
            <span className="org-table__header-center">Members</span>
            <span>Created</span>
            <span className="org-table__header-center">Actions</span>
          </div>
          {orgs.map((org) => (
            <div key={org.id} className="org-table__row">
              <span className="org-table__org-name">{org.name}</span>
              <span className="org-table__owner">
                {org.owner_email || "—"}
              </span>
              <span className="org-table__count">{org.member_count}</span>
              <span className="org-table__date">
                {formatDate(org.created_at)}
              </span>
              <span className="org-table__actions">
                <button
                  className="org-table__action-btn"
                  title="View Members"
                  onClick={() => setViewMembersOrg(org)}
                >
                  👥
                </button>
              </span>
            </div>
          ))}
        </>
      )}

      {viewMembersOrg && (
        <OrgMembersModal
          orgId={viewMembersOrg.id}
          orgName={viewMembersOrg.name}
          onClose={() => setViewMembersOrg(null)}
        />
      )}
    </div>
  );
}