import PageHeader from "../shared/components/layout/PageHeader";
import "./PlaceholderPage.css";

export default function StoreLayoutPage() {
  return (
    <div>
      <PageHeader
        title="Store layout"
        subtitle="Configure your store grid and zones"
      />
      <div className="placeholder-box">
        Store layout editor will go here.
      </div>
    </div>
  );
}