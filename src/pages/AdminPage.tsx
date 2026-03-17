import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import CreateOrgForm from "../components/admin/CreateOrgForm";
import OrgTable from "../components/admin/OrgTable";
import "./AdminPage.css";

export default function AdminPage() {
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
    </div>
  );
}