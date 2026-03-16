import PageHeader from "../components/layout/PageHeader";
import "./PlaceholderPage.css";

export default function ProductsPage() {
  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your product catalog" />
      <div className="placeholder-box">
        Products list will go here.
      </div>
    </div>
  );
}