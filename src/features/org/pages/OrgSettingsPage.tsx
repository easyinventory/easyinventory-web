import { useState } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { useOrg } from "../context/useOrg";
import PageHeader from "../../../shared/components/layout/PageHeader";
import InviteForm from "../components/InviteForm";
import MemberList from "../components/MemberList";
import { formatRoleLabel, type OrgRole } from "../../../shared/constants/roles";
import "./OrgSettingsPage.css";

export default function OrgSettingsPage() {
  const { user, profile } = useAuth();
  const { selectedOrgName } = useOrg();
  const [refreshKey, setRefreshKey] = useState(0);

  const actorRole = (profile?.org_role as OrgRole | null) || "";

  const handleInvited = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="org-settings">
      <PageHeader
        title="Organization"
        subtitle="Manage your team and org settings"
      />

      <div className="org-settings__org-card">
        <div>
          <div className="org-settings__org-name">{selectedOrgName ?? "Organization"}</div>
          <div className="org-settings__org-meta">
            Your role: {formatRoleLabel(actorRole)}
          </div>
        </div>
      </div>

      <InviteForm
        actorRole={actorRole}
        onInvited={handleInvited}
      />

      <MemberList
        actorRole={actorRole}
        actorSystemRole={profile?.system_role || ""}
        currentUserId={profile?.id || ""}
        currentUserEmail={user?.email || ""}
        refreshKey={refreshKey}
      />
    </div>
  );
}