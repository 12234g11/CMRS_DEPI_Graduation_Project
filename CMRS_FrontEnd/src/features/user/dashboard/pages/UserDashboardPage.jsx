import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '../../../auth/hooks/useAuth';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../routes/routePaths';
import MapLegend from '../../../map/components/MapLegend';
import ReportsMap from '../../../map/components/ReportsMap';
import NearbyIssuesList from '../../nearby-issues/components/NearbyIssuesList';
import useNearbyIssueDistances from '../../nearby-issues/hooks/useNearbyIssueDistances';
import { nearbyIssues } from '../../nearby-issues/mocks/nearbyIssuesMockData';
import RecentReportsTable from '../../reports/components/RecentReportsTable';
import UserDashboardStats from '../components/UserDashboardStats';
import useUserReports from '../../reports/hooks/useUserReports';
import { reportMapLegend, reportMapMarkers } from '../../../map/mocks/mapMockData';
import '../user-dashboard.css';

function UserDashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const mapSectionRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const nearbyIssuesWithAccurateDistances = useNearbyIssueDistances(nearbyIssues, currentLocation);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [routeIssueId, setRouteIssueId] = useState(null);
  const { recentReports, dashboardStats, mapMarkers: userReportMarkers } = useUserReports(user?.id);

  const focusMapReport = location.state?.focusMapReport || null;

  const routeIssue = useMemo(
    () => nearbyIssuesWithAccurateDistances.find((issue) => issue.id === routeIssueId) || null,
    [nearbyIssuesWithAccurateDistances, routeIssueId]
  );

  const dashboardMapMarkers = useMemo(() => {
    const nearbyMarkers = nearbyIssuesWithAccurateDistances.map((issue) => ({
      id: issue.id,
      title: issue.title,
      subtitle: issue.area,
      area: issue.area,
      statusLabel: issue.statusLabel,
      tone: issue.tone,
      distance: issue.distance,
      distanceLabel: issue.distanceLabel,
      address: issue.address,
      position: issue.position,
    }));

    const baseMarkers = [...userReportMarkers, ...nearbyMarkers, ...reportMapMarkers];

    if (
      focusMapReport?.markerId &&
      focusMapReport?.position?.lat &&
      focusMapReport?.position?.lng &&
      !baseMarkers.some((marker) => marker.id === focusMapReport.markerId)
    ) {
      baseMarkers.unshift({
        id: focusMapReport.markerId,
        title: focusMapReport.title || 'بلاغ المستخدم',
        subtitle: focusMapReport.area,
        area: focusMapReport.area,
        statusLabel: focusMapReport.statusLabel,
        tone: focusMapReport.tone,
        address: focusMapReport.address,
        position: focusMapReport.position,
      });
    }

    return baseMarkers;
  }, [nearbyIssuesWithAccurateDistances, userReportMarkers, focusMapReport]);

  useEffect(() => {
    if (!focusMapReport?.markerId) return;

    const markerExists = dashboardMapMarkers.some(
      (marker) => marker.id === focusMapReport.markerId
    );

    if (!markerExists) return;

    setRouteIssueId(null);
    setSelectedIssueId(focusMapReport.markerId);

    const timer = window.setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [focusMapReport, dashboardMapMarkers]);

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
        title="الصفحة الرئيسية"
        subtitle={`Dashboard — نظام إدارة البلاغات${user?.name ? ` • أهلاً ${user.name}` : ''}`}
        action={
          <Link to={ROUTES.ADD_REPORT} className="dashboard-action-btn dashboard-action-btn--primary">
            <FiPlus />
            <span>إضافة بلاغ</span>
          </Link>
        }
      />

      <UserDashboardStats stats={dashboardStats} />

      <div className="dashboard-content-grid">
        <div ref={mapSectionRef} className="dashboard-map-section">
          <DashboardSectionCard
            title="خريطة البلاغات"
            subtitle="Reports Map"
            action={<MapLegend items={reportMapLegend} compact />}
          >
            <ReportsMap
              markers={dashboardMapMarkers}
              userLocation={user?.location}
              activeMarkerId={selectedIssueId}
              onMarkerSelect={handleSelectIssue}
              onCurrentLocationChange={setCurrentLocation}
              routeDestination={routeIssue}
            />
          </DashboardSectionCard>
        </div>

        <div className="dashboard-nearby-section">
          <DashboardSectionCard
            title="مشاكل قريبة منك"
            subtitle="Nearby Issues"
            action={
              <Link to={ROUTES.NEARBY_ISSUES} className="dashboard-action-btn dashboard-action-btn--primary">
                المزيد
              </Link>
            }
          >
            <NearbyIssuesList
              issues={nearbyIssuesWithAccurateDistances}
              activeIssueId={selectedIssueId}
              onSelectIssue={handleSelectIssue}
              currentLocation={currentLocation}
              onRequestDirections={handleRequestDirections}
              onClearSelection={handleClearSelection}
            />
          </DashboardSectionCard>
        </div>
      </div>

      <DashboardSectionCard title="اخر البلاغات" subtitle="Recent Reports">
        <RecentReportsTable
          reports={recentReports}
          emptyMessage="لا توجد بلاغات حديثة حتى الآن."
        />
      </DashboardSectionCard>
    </div>
  );
}

export default UserDashboardPage;