import { useCallback } from "react";
import { listMembers } from "../../api/orgApi";
import type { OrgMember } from "../../api/orgApi";
import { useApiData } from "../../hooks/useApiData";
import { EmptyState, ErrorBanner, LoadingState } from "../ui";
import MemberRow from "./MemberRow";
import "./MemberList.css";

interface MemberListProps {
  actorRole: string;
  currentUserEmail: string;
  refreshKey: number;
}

export default function MemberList({
  actorRole,
  currentUserEmail,
  refreshKey,
}: MemberListProps) {
  const fetchMembers = useCallback(() => listMembers(), []);
  const {
    data: membersData,
    isLoading,
    error,
    refetch,
  } = useApiData<OrgMember[]>(fetchMembers, [refreshKey]);
  const members = membersData ?? [];

  const activeCount = members.filter((m) => m.is_active).length;
  const pendingCount = members.filter((m) => !m.is_active).length;

  return (
    <div className="member-list">
      <div className="member-list__header">
        <div className="member-list__title">
          Team members
        </div>
        <div className="member-list__count">
          {activeCount} active{pendingCount > 0 && `, ${pendingCount} pending`}
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <LoadingState text="Loading members..." />
      ) : members.length === 0 ? (
        <EmptyState message="No members yet. Invite someone above." />
      ) : (
        members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            actorRole={actorRole}
            currentUserEmail={currentUserEmail}
            onUpdated={refetch}
          />
        ))
      )}
    </div>
  );
}
