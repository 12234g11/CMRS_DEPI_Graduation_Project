import { useEffect, useMemo, useState } from 'react';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import MapFilters from '../../../map/components/MapFilters';
import MapLegend from '../../../map/components/MapLegend';
import ReportsMap from '../../../map/components/ReportsMap';
import NearbyIssuesList from '../components/NearbyIssuesList';
import useNearbyIssueDistances from '../hooks/useNearbyIssueDistances';
import { nearbyIssues } from '../mocks/nearbyIssuesMockData';
import { reportMapLegend } from '../../../map/mocks/mapMockData';

const FILTER_OPTIONS = [
  { label: 'الكل', value: 'all' },
  { label: 'قيد المراجعة', value: 'warning' },
  { label: 'جاري الحل', value: 'info' },
  { label: 'تم الحل', value: 'success' },
];

function NearbyIssuesPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentLocation, setCurrentLocation] = useState(null);
  const issuesWithAccurateDistances = useNearbyIssueDistances(nearbyIssues, currentLocation);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [routeIssueId, setRouteIssueId] = useState(null);

  const filteredIssues = useMemo(() => {
    if (activeFilter === 'all') return issuesWithAccurateDistances;
    return issuesWithAccurateDistances.filter((issue) => issue.tone === activeFilter);
  }, [activeFilter, issuesWithAccurateDistances]);

  useEffect(() => {
    if (selectedIssueId && !filteredIssues.some((issue) => issue.id === selectedIssueId)) {
      setSelectedIssueId(null);
    }

    if (routeIssueId && !filteredIssues.some((issue) => issue.id === routeIssueId)) {
      setRouteIssueId(null);
    }
  }, [filteredIssues, routeIssueId, selectedIssueId]);

  const routeIssue = useMemo(
    () => issuesWithAccurateDistances.find((issue) => issue.id === routeIssueId) || null,
    [issuesWithAccurateDistances, routeIssueId]
  );

  const mapMarkers = useMemo(
    () =>
      filteredIssues.map((issue) => ({
        ...issue,
        subtitle: issue.area,
      })),
    [filteredIssues]
  );

  const handleSelectIssue = (issue) => {
    if (!issue?.id) return;

    setRouteIssueId(null);
    setSelectedIssueId((currentId) => (currentId === issue.id ? null : issue.id));
  };

  const handleClearSelection = () => {
    setSelectedIssueId(null);
    setRouteIssueId(null);
  };

  const handleRequestDirections = (issue) => {
    if (!issue?.id) return;

    setSelectedIssueId(issue.id);
    setRouteIssueId(issue.id);
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="مشاكل قريبة منك"
        subtitle="Nearby Issues — خريطة ومتابعة سريعة للمشكلات القريبة"
      />

      <MapFilters options={FILTER_OPTIONS} value={activeFilter} onChange={setActiveFilter} />

      <div className="dashboard-content-grid">
        <DashboardSectionCard
          title="الخريطة"
          subtitle="Reports Map"
          action={<MapLegend items={reportMapLegend} compact />}
        >
          <ReportsMap
            markers={mapMarkers}
            height={420}
            activeMarkerId={selectedIssueId}
            onMarkerSelect={handleSelectIssue}
            onCurrentLocationChange={setCurrentLocation}
            routeDestination={routeIssue}
          />
        </DashboardSectionCard>

        <DashboardSectionCard title="القائمة" subtitle="Nearby Issues List">
          <NearbyIssuesList
            issues={filteredIssues}
            activeIssueId={selectedIssueId}
            onSelectIssue={handleSelectIssue}
            currentLocation={currentLocation}
            onRequestDirections={handleRequestDirections}
            onClearSelection={handleClearSelection}
          />
        </DashboardSectionCard>
      </div>
    </div>
  );
}

export default NearbyIssuesPage;