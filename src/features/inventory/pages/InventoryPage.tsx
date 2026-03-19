import PageHeader from "../../../shared/components/layout/PageHeader";
import "../../../shared/components/ui/PlaceholderPage.css";

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