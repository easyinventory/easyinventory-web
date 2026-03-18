import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import PageHeader from "../components/layout/PageHeader";
import CreateOrgForm from "../components/admin/CreateOrgForm";
import OrgTable from "../components/admin/OrgTable";
import MemberList from "../components/org/MemberList";
import "./AdminPage.css";

export default function AdminPage() {
  const { user, profile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="System Admin"
        subtitle="Manage organizations and onboard new clients"
      />

      <CreateOrgForm onCreated={handleCreated} />
      <OrgTable refreshKey={refreshKey} />

      <div className="admin-page__members">
        <PageHeader
          title="Users"
          subtitle="Manage users in your current organization and permanently delete accounts"
        />
        <MemberList
          actorRole={profile?.org_role || ""}
          actorSystemRole={profile?.system_role || ""}
          currentUserId={profile?.id || ""}
          currentUserEmail={user?.email || ""}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
}