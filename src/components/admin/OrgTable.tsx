import { useCallback, useState } from "react";
import { listOrgs } from "../../api/adminApi";
import type { OrgListItem } from "../../api/adminApi";
import { useApiData } from "../../hooks/useApiData";
import { formatDate } from "../../utils";
import { EmptyState, ErrorBanner, LoadingState } from "../ui";
import RenameOrgModal from "./RenameOrgModal";
import DeleteOrgModal from "./DeleteOrgModal";
import TransferOwnershipModal from "./TransferOwnershipModal";
import "./OrgTable.css";

interface OrgTableProps {
  refreshKey: number;
}

type ModalState =
  | { type: "rename"; org: OrgListItem }
  | { type: "delete"; org: OrgListItem }
  | { type: "transfer"; org: OrgListItem }
  | null;

export default function OrgTable({ refreshKey }: OrgTableProps) {
  const fetchOrgs = useCallback(() => listOrgs(), []);
  const {
    data: orgsData,
    isLoading,
    error,
    refetch,
  } = useApiData<OrgListItem[]>(fetchOrgs, [refreshKey]);
  const orgs = orgsData ?? [];

  const [modal, setModal] = useState<ModalState>(null);

  const handleRenameSuccess = () => {
    setModal(null);
    refetch();
  };

  const handleDeleteSuccess = () => {
    setModal(null);
    refetch();
  };

  const handleTransferSuccess = () => {
    setModal(null);
    refetch();
  };

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
                  title="Rename"
                  onClick={() => setModal({ type: "rename", org })}
                >
                  ✏️
                </button>
                <button
                  className="org-table__action-btn"
                  title="Transfer Ownership"
                  onClick={() => setModal({ type: "transfer", org })}
                >
                  🔄
                </button>
                <button
                  className="org-table__action-btn org-table__action-btn--danger"
                  title="Delete"
                  onClick={() => setModal({ type: "delete", org })}
                >
                  🗑️
                </button>
              </span>
            </div>
          ))}
        </>
      )}

      {/* Modals */}
      {modal?.type === "rename" && (
        <RenameOrgModal
          orgId={modal.org.id}
          currentName={modal.org.name}
          onSuccess={handleRenameSuccess}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteOrgModal
          orgId={modal.org.id}
          orgName={modal.org.name}
          onSuccess={handleDeleteSuccess}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "transfer" && (
        <TransferOwnershipModal
          orgId={modal.org.id}
          orgName={modal.org.name}
          onSuccess={handleTransferSuccess}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}