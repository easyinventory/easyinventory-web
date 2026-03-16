import PageHeader from "../components/layout/PageHeader";
import "./PlaceholderPage.css";

export default function OrgSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Organization"
        subtitle="Manage your team and org settings"
      />
      <div className="placeholder-box">
        Organization settings will go here.
      </div>
    </div>
  );
}