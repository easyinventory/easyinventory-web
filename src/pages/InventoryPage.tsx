import PageHeader from "../components/layout/PageHeader";
import "./PlaceholderPage.css";

export default function InventoryPage() {
  return (
    <div>
      <PageHeader title="Inventory" subtitle="Track stock across locations" />
      <div className="placeholder-box">
        Inventory management will go here.
      </div>
    </div>
  );
}