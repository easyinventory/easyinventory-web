import { useEffect, useState, useCallback } from "react";
import { listMembers } from "../../api/orgApi";
import type { OrgMember } from "../../api/orgApi";
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
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listMembers();
      setMembers(data);
    } catch {
      setError("Failed to load members.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when refreshKey changes (after invite/update)
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, refreshKey]);

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

      {error && <div className="member-list__error">{error}</div>}

      {isLoading ? (
        <div className="member-list__loading">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="member-list__empty">
          No members yet. Invite someone above.
        </div>
      ) : (
        members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            actorRole={actorRole}
            currentUserEmail={currentUserEmail}
            onUpdated={fetchMembers}
          />
        ))
      )}
    </div>
  );
}
