import { useState } from "react";
import type { OrgMember } from "../../api/orgApi";
import {
  updateMemberRole,
  deactivateMember,
  activateMember,
  removeMember,
} from "../../api/orgApi";
import { OrgRole, formatRoleLabel } from "../../constants/roles";
import { extractApiError } from "../../utils";
import "./MemberRow.css";

interface MemberRowProps {
  member: OrgMember;
  actorRole: string;
  currentUserEmail: string;
  onUpdated: () => void;
}

export default function MemberRow({
  member,
  actorRole,
  currentUserEmail,
  onUpdated,
}: MemberRowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = member.org_role === OrgRole.OWNER;
  const isAdmin = member.org_role === OrgRole.ADMIN;
  const isSelf = member.email === currentUserEmail;
  const actorIsOwner = actorRole === OrgRole.OWNER;
  const isPending = !member.is_active && member.email.includes("@");

  // Can this actor modify this member?
  const canModify =
    !isOwner &&          // nobody modifies the owner
    !isSelf &&           // can't modify yourself
    (actorIsOwner || (!isAdmin));  // admin can't touch other admins

  const initials = member.email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const handleRoleChange = async (newRole: OrgRole) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateMemberRole(member.id, { org_role: newRole });
      onUpdated();
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (member.is_active) {
        await deactivateMember(member.id);
      } else {
        await activateMember(member.id);
      }
      onUpdated();
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm(`Remove ${member.email} from the organization?`)) return;
    setIsLoading(true);
    setError(null);
    try {
      await removeMember(member.id);
      onUpdated();
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Determine status
  let statusLabel: string;
  let statusClass: string;
  if (isPending) {
    statusLabel = "Pending";
    statusClass = "member-row__status--pending";
  } else if (member.is_active) {
    statusLabel = "Active";
    statusClass = "member-row__status--active";
  } else {
    statusLabel = "Inactive";
    statusClass = "member-row__status--inactive";
  }

  return (
    <div className="member-row">
      <div className="member-row__info">
        <div
          className={`member-row__avatar ${
            member.is_active
              ? "member-row__avatar--active"
              : "member-row__avatar--inactive"
          }`}
        >
          {isPending ? "?" : initials}
        </div>
        <div className="member-row__details">
          <div className="member-row__email">
            {member.email}
            {isSelf && (
              <span className="member-row__self-label">
                — you
              </span>
            )}
          </div>
          {error && (
            <div className="member-row__meta" style={{ color: "var(--color-danger)" }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="member-row__controls">
        {isOwner ? (
          <span className="member-row__owner-badge">Owner</span>
        ) : canModify ? (
          <select
            className="member-row__role-select"
            value={member.org_role}
            onChange={(e) => handleRoleChange(e.target.value as OrgRole)}
            disabled={isLoading}
          >
            {actorIsOwner && <option value={OrgRole.ADMIN}>Admin</option>}
            <option value={OrgRole.EMPLOYEE}>Employee</option>
            <option value={OrgRole.VIEWER}>Viewer</option>
          </select>
        ) : (
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
            {formatRoleLabel(member.org_role)}
          </span>
        )}

        <span className={`member-row__status ${statusClass}`}>
          {statusLabel}
        </span>

        {canModify && !isPending && (
          <button
            className="member-row__action"
            onClick={handleToggleActive}
            disabled={isLoading}
          >
            {member.is_active ? "Deactivate" : "Activate"}
          </button>
        )}

        {canModify && (
          <button
            className="member-row__action member-row__action--danger"
            onClick={handleRemove}
            disabled={isLoading}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
