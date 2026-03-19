import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import PageHeader from "../shared/components/layout/PageHeader";
import CreateOrgForm from "../components/admin/CreateOrgForm";
import OrgTable from "../components/admin/OrgTable";
import UserTable from "../components/admin/UserTable";
import "./AdminPage.css";

type AdminTab = "organizations" | "users";

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("organizations");
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

      <nav className="admin-page__tabs">
        <button
          className={`admin-page__tab ${activeTab === "organizations" ? "admin-page__tab--active" : ""}`}
          onClick={() => setActiveTab("organizations")}
        >
          Organizations
        </button>
        <button
          className={`admin-page__tab ${activeTab === "users" ? "admin-page__tab--active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </nav>

      {activeTab === "organizations" && (
        <div className="admin-page__panel">
          <CreateOrgForm onCreated={handleCreated} />
          <OrgTable refreshKey={refreshKey} />
        </div>
      )}

      {activeTab === "users" && (
        <div className="admin-page__panel">
          <UserTable
            refreshKey={refreshKey}
            currentUserEmail={user?.email || ""}
          />
        </div>
      )}
    </div>
  );
}