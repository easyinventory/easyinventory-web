import PageHeader from "../../../shared/components/layout/PageHeader";
import "../../../shared/components/ui/PlaceholderPage.css";
import "./AnalyticsPage.css";

export default function AnalyticsPage() {
  return (
    <div className="analytics-page">
      <PageHeader
        title="Analytics"
        subtitle="Sales trends and heatmap insights"
      />

      <div className="analytics-page__cards">
        <div className="placeholder-box analytics-page__card">
          <h3>Inventory Heatmap</h3>
          <p>Visualize stock levels across your store layout zones.</p>
        </div>

        <div className="placeholder-box analytics-page__card">
          <h3>Stock Health</h3>
          <p>Monitor low-stock and out-of-stock items at a glance.</p>
        </div>

        <div className="placeholder-box analytics-page__card">
          <h3>Zone Summary</h3>
          <p>Compare inventory totals and turnover across zones.</p>
        </div>
      </div>
    </div>
  );
}