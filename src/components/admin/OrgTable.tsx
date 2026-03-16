import { useEffect, useState, useCallback } from "react";
import { listOrgs } from "../../api/adminApi";
import type { OrgListItem } from "../../api/adminApi";
import "./OrgTable.css";

interface OrgTableProps {
  refreshKey: number;
}

export default function OrgTable({ refreshKey }: OrgTableProps) {
  const [orgs, setOrgs] = useState<OrgListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrgs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listOrgs();
      setOrgs(data);
    } catch {
      setError("Failed to load organizations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs, refreshKey]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="org-table">
      <div className="org-table__title">All organizations ({orgs.length})</div>

      {error && <div className="org-table__error">{error}</div>}

      {isLoading ? (
        <div className="org-table__loading">Loading organizations...</div>
      ) : orgs.length === 0 ? (
        <div className="org-table__empty">
          No organizations yet. Create one above.
        </div>
      ) : (
        <>
          <div className="org-table__header">
            <span>Organization</span>
            <span>Owner</span>
            <span style={{ textAlign: "center" }}>Members</span>
            <span>Created</span>
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
            </div>
          ))}
        </>
      )}
    </div>
  );
}