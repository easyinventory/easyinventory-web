import PageHeader from "../shared/components/layout/PageHeader";
import "./PlaceholderPage.css";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Sales trends and heatmap insights"
      />
      <div className="placeholder-box">
        Analytics and heatmaps will go here.
      </div>
    </div>
  );
}