import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import PageHeader from "../components/layout/PageHeader";
import CreateOrgForm from "../components/admin/CreateOrgForm";
import OrgTable from "../components/admin/OrgTable";
import UserTable from "../components/admin/UserTable";
import "./AdminPage.css";

export default function AdminPage() {
  const { user } = useAuth();
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
          subtitle="Manage all users across the system and permanently delete accounts"
        />
        <UserTable
          refreshKey={refreshKey}
          currentUserEmail={user?.email || ""}
        />
      </div>
    </div>
  );
}