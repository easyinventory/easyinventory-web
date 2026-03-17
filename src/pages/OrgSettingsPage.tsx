import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import PageHeader from "../components/layout/PageHeader";
import InviteForm from "../components/org/InviteForm";
import MemberList from "../components/org/MemberList";
import "./OrgSettingsPage.css";

export default function OrgSettingsPage() {
  const { user, profile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const actorRole = profile?.org_role || "";

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
          <div className="org-settings__org-name">Default Organization</div>
          <div className="org-settings__org-meta">
            Your role: {actorRole.replace("ORG_", "").toLowerCase()}
          </div>
        </div>
      </div>

      <InviteForm
        actorRole={actorRole}
        onInvited={handleInvited}
      />

      <MemberList
        actorRole={actorRole}
        currentUserEmail={user?.email || ""}
        refreshKey={refreshKey}
      />
    </div>
  );
}