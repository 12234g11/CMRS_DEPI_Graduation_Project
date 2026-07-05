import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEye,
  FiMapPin,
  FiNavigation,
  FiPlus,
  FiStar,
  FiUserPlus,
} from 'react-icons/fi';
import { useAuth } from '../../../auth/hooks/useAuth';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import ReportsMap from '../../../map/components/ReportsMap';
import useNearbyIssueDistances from '../../nearby-issues/hooks/useNearbyIssueDistances';
import { nearbyIssues } from '../../nearby-issues/mocks/nearbyIssuesMockData';
import useUserReports from '../../reports/hooks/useUserReports';
import UserDashboardStats from '../components/UserDashboardStats';
import UserDashboardFilters from '../components/UserDashboardFilters';
import UserMapSelectedReportCard from '../components/UserMapSelectedReportCard';
import UserDashboardReportDetailsModal from '../components/UserDashboardReportDetailsModal';
import '../user-dashboard.css';

const SOURCE_OPTIONS = [
  { value: 'all', label: 'كل البلاغات' },
  { value: 'mine', label: 'بلاغاتي' },
  { value: 'nearby', label: 'بلاغات قريبة مني' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'warning', label: 'قيد المراجعة' },
  { value: 'info', label: 'جاري الحل' },
  { value: 'success', label: 'تم الحل' },
];

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function toUserDashboardReport(report) {
  return {
    id: `mine-${report.id}`,
    originalId: report.id,
    source: 'mine',
    reportNumber: report.reportNumber,
    title: report.title || report.issue || 'بلاغ المستخدم',
    typeLabel: report.categoryLabel || report.issue || 'أخرى',
    statusLabel: report.statusLabel || 'قيد المراجعة',
    statusTone: report.statusTone || 'warning',
    priority: report.severityLabel || 'متوسطة',
    description: report.description || '',
    area: report.area,
    address: report.locationText || report.address || report.area,
    date: report.createdAt || report.date,
    distance: '',
    distanceLabel: '',
    rating: report.rating || 0,
    coverImage: report.coverImage,
    images: report.images,
    position: report.position,
  };
}

function toNearbyDashboardReport(issue) {
  return {
    id: `nearby-${issue.id}`,
    originalId: issue.id,
    source: 'nearby',
    reportNumber: issue.reportNumber,
    title: issue.title,
    typeLabel: issue.category || issue.type || 'أخرى',
    statusLabel: issue.statusLabel,
    statusTone: issue.tone || 'warning',
    priority: issue.priority || 'متوسطة',
    description: issue.description,
    area: issue.area,
    address: issue.address || issue.area,
    date: issue.reportedAt,
    distance: issue.distance,
    distanceLabel: issue.distanceLabel,
    rating: issue.rating || 0,
    coverImage: issue.coverImage,
    images: issue.images,
    position: issue.position,
  };
}

function buildMapMarker(report) {
  return {
    id: report.id,
    reportId: report.id,
    title: report.title,
    subtitle: report.typeLabel,
    area: report.area,
    statusLabel: report.statusLabel,
    tone: report.statusTone,
    address: report.address,
    position: report.position,
    distance: report.distance,
    distanceLabel: report.distanceLabel,
  };
}

function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mapSectionRef = useRef(null);

  const { reports, dashboardStats } = useUserReports(user?.id);

  const [currentLocation, setCurrentLocation] = useState(null);
  const nearbyIssuesWithDistances = useNearbyIssueDistances(
    nearbyIssues,
    currentLocation
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsReport, setDetailsReport] = useState(null);
  const [routeReportId, setRouteReportId] = useState(null);

  const [followedReports, setFollowedReports] = useState(() => new Set());
  const [reportRatings, setReportRatings] = useState({});

  const focusMapReport = location.state?.focusMapReport || null;

  const dashboardReports = useMemo(() => {
    const userDashboardReports = reports
      .filter((report) => report.position?.lat && report.position?.lng)
      .map(toUserDashboardReport);

    const nearbyDashboardReports = nearbyIssuesWithDistances
      .filter((issue) => issue.position?.lat && issue.position?.lng)
      .map(toNearbyDashboardReport);

    return [...userDashboardReports, ...nearbyDashboardReports];
  }, [nearbyIssuesWithDistances, reports]);

  const typeOptions = useMemo(() => {
    const uniqueTypes = Array.from(
      new Set(dashboardReports.map((report) => report.typeLabel).filter(Boolean))
    );

    return [
      { value: 'all', label: 'كل الأنواع' },
      ...uniqueTypes.map((type) => ({
        value: type,
        label: type,
      })),
    ];
  }, [dashboardReports]);

  const filteredReports = useMemo(() => {
    const query = normalizeText(searchTerm);

    return dashboardReports.filter((report) => {
      const matchesSource =
        sourceFilter === 'all' || report.source === sourceFilter;

      const matchesType =
        typeFilter === 'all' || report.typeLabel === typeFilter;

      const matchesStatus =
        statusFilter === 'all' || report.statusTone === statusFilter;

      const searchableText = [
        report.id,
        report.originalId,
        report.reportNumber,
        report.title,
        report.typeLabel,
        report.area,
        report.address,
        report.statusLabel,
        report.priority,
      ]
        .map(normalizeText)
        .join(' ');

      const matchesSearch = !query || searchableText.includes(query);

      return matchesSource && matchesType && matchesStatus && matchesSearch;
    });
  }, [dashboardReports, searchTerm, sourceFilter, statusFilter, typeFilter]);

  const mapMarkers = useMemo(() => {
    return filteredReports.map(buildMapMarker);
  }, [filteredReports]);

  const routeDestination = useMemo(() => {
    return dashboardReports.find((report) => report.id === routeReportId) || null;
  }, [dashboardReports, routeReportId]);

  useEffect(() => {
    if (!focusMapReport?.markerId) return;

    setActiveMarkerId(focusMapReport.markerId);

    const report = dashboardReports.find(
      (item) => item.id === focusMapReport.markerId
    );

    if (report) {
      setSelectedReport(report);
    }

    const timer = window.setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [dashboardReports, focusMapReport]);

  function handleMarkerSelect(marker) {
    const report = filteredReports.find(
      (item) => item.id === marker?.id || item.id === marker?.reportId
    );

    setRouteReportId(null);
    setActiveMarkerId(marker?.id || null);
    setSelectedReport(report || null);
  }

  function handleResetFilters() {
    setSearchTerm('');
    setSourceFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setActiveMarkerId(null);
    setSelectedReport(null);
    setRouteReportId(null);
  }

  function handleToggleFollow(report) {
    if (!report?.id) return;

    setFollowedReports((current) => {
      const next = new Set(current);

      if (next.has(report.id)) {
        next.delete(report.id);
      } else {
        next.add(report.id);
      }

      return next;
    });
  }

  function handleRate(report) {
    if (!report?.id) return;

    setReportRatings((current) => ({
      ...current,
      [report.id]: (current[report.id] || report.rating || 0) + 1,
    }));
  }

  function handleRequestDirections(report) {
    if (!report?.id) return;

    if (!currentLocation?.lat || !currentLocation?.lng) {
      window.alert(
        'حدد موقعك الحالي من زر الخريطة أولًا، ثم اضغط أقصر مسافة.'
      );
      return;
    }

    setSelectedReport(report);
    setActiveMarkerId(report.id);
    setRouteReportId(report.id);
  }

  function handleGoToReport(report) {
    if (!report) return;

    if (report.source === 'mine') {
      navigate(ROUTES.MY_REPORTS, {
        state: {
          selectedReportId: report.originalId,
          highlightReportId: report.originalId,
        },
      });

      return;
    }

    navigate(ROUTES.NEARBY_ISSUES, {
      state: {
        selectedIssueId: report.originalId,
        highlightIssueId: report.originalId,
      },
    });
  }

  function renderPopupContent(marker) {
    const report = filteredReports.find((item) => item.id === marker.id);

    if (!report) return null;

    return (
      <div className="user-dashboard-map-popup">
        <strong>{report.title}</strong>

        <span>{report.typeLabel}</span>

        <small>
          <FiMapPin />
          {report.area || report.address}
        </small>

        <div className="user-dashboard-map-popup__actions">
          <button
            type="button"
            onClick={() => setDetailsReport(report)}
          >
            <FiEye />
            عرض التفاصيل
          </button>

          <button
            type="button"
            onClick={() => handleGoToReport(report)}
          >
            صفحة البلاغ
            <FiArrowLeft />
          </button>
        </div>
      </div>
    );
  }

  const selectedReportRating =
    selectedReport ? reportRatings[selectedReport.id] || selectedReport.rating || 0 : 0;

  const detailsReportRating =
    detailsReport ? reportRatings[detailsReport.id] || detailsReport.rating || 0 : 0;

  return (
    <div className="dashboard-page user-dashboard-page">
      <PageHeader
        title="الصفحة الرئيسية"
        subtitle={`Dashboard — نظام إدارة البلاغات${
          user?.name || user?.userName ? ` • أهلاً ${user.name || user.userName}` : ''
        }`}
        action={
          <Link
            to={ROUTES.ADD_REPORT}
            className="dashboard-action-btn dashboard-action-btn--primary"
          >
            <FiPlus />
            <span>إضافة بلاغ</span>
          </Link>
        }
      />

      <UserDashboardStats stats={dashboardStats} />

      <UserDashboardFilters
        totalReports={dashboardReports.length}
        filteredCount={filteredReports.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sourceOptions={SOURCE_OPTIONS}
        typeOptions={typeOptions}
        statusOptions={STATUS_OPTIONS}
        onReset={handleResetFilters}
      />

      <section ref={mapSectionRef} className="user-dashboard-map-card">
        <header className="user-dashboard-map-card__header">
          <div>
            <h2>خريطة البلاغات</h2>
            <p>
              اضغط على أي بلاغ على الخريطة لعرض ملخص سريع أو فتح التفاصيل.
            </p>
          </div>

          {selectedReport ? (
            <span className={`user-dashboard-active-report is-${selectedReport.statusTone}`}>
              البلاغ المحدد: {selectedReport.reportNumber || selectedReport.originalId} -{' '}
              {selectedReport.typeLabel}
            </span>
          ) : (
            <span className="user-dashboard-active-report">
              لم يتم تحديد بلاغ
            </span>
          )}
        </header>

        <div className="user-dashboard-map-wrapper">
          <ReportsMap
            markers={mapMarkers}
            activeMarkerId={activeMarkerId}
            onMarkerSelect={handleMarkerSelect}
            onCurrentLocationChange={setCurrentLocation}
            routeDestination={routeDestination}
            height={620}
            renderPopupContent={renderPopupContent}
          />

          <UserMapSelectedReportCard
            report={selectedReport}
            isFollowed={selectedReport ? followedReports.has(selectedReport.id) : false}
            rating={selectedReportRating}
            onClose={() => {
              setSelectedReport(null);
              setActiveMarkerId(null);
              setRouteReportId(null);
            }}
            onOpenDetails={setDetailsReport}
            onGoToReport={handleGoToReport}
            onToggleFollow={handleToggleFollow}
            onRate={handleRate}
            onRequestDirections={handleRequestDirections}
          />
        </div>
      </section>

      <UserDashboardReportDetailsModal
        report={detailsReport}
        isFollowed={detailsReport ? followedReports.has(detailsReport.id) : false}
        rating={detailsReportRating}
        onClose={() => setDetailsReport(null)}
        onGoToReport={handleGoToReport}
        onToggleFollow={handleToggleFollow}
        onRate={handleRate}
        onRequestDirections={handleRequestDirections}
      />
    </div>
  );
}

export default UserDashboardPage;