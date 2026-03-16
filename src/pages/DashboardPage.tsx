import PageHeader from "../components/layout/PageHeader";
import "./PlaceholderPage.css";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your store performance"
      />
      <div className="placeholder-box">
        Dashboard content will go here.
      </div>
    </div>
  );
}