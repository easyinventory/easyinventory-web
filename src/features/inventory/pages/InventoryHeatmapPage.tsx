import { useCallback, useMemo, useState } from "react";
import { useStore } from "../../store-layout/context/useStore";
import { getZoneInventorySummary } from "../../analytics/api/analyticsApi";
import type { ZoneInventorySummaryResponse, ZoneInventorySummary as ZoneSummary } from "../../analytics/api/analyticsTypes";
import { HeatmapGrid, stockHealthColorScale } from "../../../shared/components/heatmap";
import type { HeatmapZone, HeatmapFixture } from "../../../shared/types";
import PageHeader from "../../../shared/components/layout/PageHeader";
import { LoadingState, ErrorBanner, EmptyState } from "../../../shared/components/ui";
import { useApiData } from "../../../shared/hooks";
import ZoneDetailContent from "../components/ZoneDetailContent";
import "./InventoryHeatmapPage.css";

export default function InventoryHeatmapPage() {
  const { selectedStoreId, selectedStoreName } = useStore();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  /* ── Fetch zone inventory summary ── */
  const fetchSummary = useCallback(
    (): Promise<ZoneInventorySummaryResponse | null> =>
      selectedStoreId
        ? getZoneInventorySummary(selectedStoreId)
        : Promise.resolve(null),
    [selectedStoreId],
  );

  const { data, isLoading, error } = useApiData(fetchSummary, [selectedStoreId]);

  /* ── Transform API data → heatmap zones ── */
  const heatmapZones: HeatmapZone[] = useMemo(() => {
    if (!data) return [];
    return data.zones.map((z) => {
      const healthRatio =
        z.total_items === 0
          ? 0
          : (z.low_stock_count + z.out_of_stock_count) / z.total_items;
      return {
        id: z.zone_id,
        name: z.zone_name,
        color: z.zone_color,
        cells: z.cells,
        heatValue: healthRatio,
      };
    });
  }, [data]);

  /* ── Transform API data → heatmap fixtures ── */
  const heatmapFixtures: HeatmapFixture[] = useMemo(() => {
    if (!data) return [];
    return data.fixtures.map((f) => ({
      id: f.fixture_id,
      name: f.fixture_name,
      fixtureType: f.fixture_type,
      cells: f.cells,
    }));
  }, [data]);

  /* ── Zone lookup for detail panel ── */
  const zoneLookup = useMemo(() => {
    if (!data) return new Map<string, ZoneSummary>();
    return new Map(data.zones.map((z) => [z.zone_id, z]));
  }, [data]);

  /* ── Detail panel render callback ── */
  const renderDetail = useCallback(
    (zone: HeatmapZone | null) => {
      if (!zone) return null;
      const zoneSummary = zoneLookup.get(zone.id);
      if (!zoneSummary) return null;
      return <ZoneDetailContent zone={zoneSummary} />;
    },
    [zoneLookup],
  );

  /* ── No store selected ── */
  if (!selectedStoreId) {
    return (
      <div className="inventory-heatmap-page">
        <PageHeader
          title="Inventory Heatmap"
          subtitle="Zone-level stock health visualization"
          backTo={{ label: "Inventory", path: "/inventory" }}
        />
        <EmptyState message="Select a store to view the inventory heatmap." />
      </div>
    );
  }

  return (
    <div className="inventory-heatmap-page">
      <PageHeader
        title="Inventory Heatmap"
        subtitle={
          selectedStoreName
            ? `Stock health for ${selectedStoreName}`
            : "Zone-level stock health visualization"
        }
        backTo={{ label: "Inventory", path: "/inventory" }}
      />

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <LoadingState text="Loading heatmap data..." />
      ) : !data ? (
        <EmptyState message="No active layout found. Create a store layout and stock products to see the heatmap." />
      ) : data.zones.length === 0 ? (
        <EmptyState message="No zones defined in the active layout. Create zones in the Store Layout editor to see the heatmap." />
      ) : (
        <>
          <HeatmapGrid
            config={{ rows: data.rows, cols: data.cols }}
            zones={heatmapZones}
            fixtures={heatmapFixtures}
            colorScale={stockHealthColorScale}
            selectedZoneId={selectedZoneId}
            onZoneClick={setSelectedZoneId}
            renderDetail={renderDetail}
            legendLowLabel="Healthy"
            legendHighLabel="Low / Out of Stock"
            detailEmptyLabel="Click a zone to view inventory details"
          />

          {/* ── Unzoned items summary ── */}
          {data.unzoned_summary.total_items > 0 && (
            <div className="inventory-heatmap-page__unzoned">
              <span className="inventory-heatmap-page__unzoned-label">
                Unassigned items:
              </span>
              <span className="inventory-heatmap-page__unzoned-count">
                {data.unzoned_summary.total_items} item{data.unzoned_summary.total_items !== 1 ? "s" : ""}
              </span>
              {data.unzoned_summary.low_stock_count > 0 && (
                <span className="inventory-heatmap-page__unzoned-warning">
                  ({data.unzoned_summary.low_stock_count} low stock)
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
