import { useCallback } from "react";
import { listOrgMembers } from "../../api/adminApi";
import type { OrgMemberDetail } from "../../types";
import { useApiData } from "../../shared/hooks/useApiData";
import { formatDate } from "../../shared/utils";
import { ErrorBanner, LoadingState } from "../../shared/components/ui";
import "./OrgMembersModal.css";

interface OrgMembersModalProps {
  orgId: string;
  orgName: string;
  onClose: () => void;
}

function formatOrgRole(role: string): string {
  return role
    .replace("ORG_", "")
    .charAt(0)
    .toUpperCase()
    + role.replace("ORG_", "").slice(1).toLowerCase();
}

export default function OrgMembersModal({
  orgId,
  orgName,
  onClose,
}: OrgMembersModalProps) {
  const fetchMembers = useCallback(() => listOrgMembers(orgId), [orgId]);
  const {
    data: membersData,
    isLoading,
    error,
  } = useApiData<OrgMemberDetail[]>(fetchMembers);
  const members = membersData ?? [];

  return (
    <div className="org-members-modal__overlay" role="dialog" aria-modal="true">
      <div className="org-members-modal__content">
        <div className="org-members-modal__header">
          <h3 className="org-members-modal__title">
            {orgName} — Members ({members.length})
          </h3>
          <button
            className="org-members-modal__close"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {error && <ErrorBanner message={error} />}

        {isLoading ? (
          <LoadingState text="Loading members..." />
        ) : members.length === 0 ? (
          <div className="org-members-modal__empty">
            No members in this organization.
          </div>
        ) : (
          <>
            <div className="org-members-modal__table-header">
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
            </div>
            {members.map((member) => (
              <div key={member.id} className="org-members-modal__row">
                <span className="org-members-modal__email">
                  {member.email}
                </span>
                <span className="org-members-modal__role">
                  {formatOrgRole(member.org_role)}
                </span>
                <span>
                  <span
                    className={`org-members-modal__badge ${
                      member.is_active
                        ? "org-members-modal__badge--active"
                        : "org-members-modal__badge--inactive"
                    }`}
                  >
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                </span>
                <span className="org-members-modal__date">
                  {formatDate(member.joined_at)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
