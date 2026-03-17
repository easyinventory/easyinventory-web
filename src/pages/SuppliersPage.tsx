import PageHeader from "../components/layout/PageHeader";
import "./PlaceholderPage.css";

export default function SuppliersPage() {
  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendor contacts and information"
      />
      <div className="placeholder-box">
        Supplier list will go here.
      </div>
    </div>
  );
}