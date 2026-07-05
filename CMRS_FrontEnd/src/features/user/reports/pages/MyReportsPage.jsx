import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiMapPin,
  FiPlus,
} from 'react-icons/fi';

import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import { useAuth } from '../../../auth/hooks/useAuth';
import MapLegend from '../../../map/components/MapLegend';
import ReportsMap from '../../../map/components/ReportsMap';
import { reportMapLegend } from '../../../map/mocks/mapMockData';
import UserDashboardStats from '../../dashboard/components/UserDashboardStats';
import UserDashboardReportDetailsModal from '../../dashboard/components/UserDashboardReportDetailsModal';
import UserMapSelectedReportCard from '../../dashboard/components/UserMapSelectedReportCard';
import RecentReportsTable from '../components/RecentReportsTable';
import UserReportsFilters from '../components/UserReportsFilters';
import useUserReports from '../hooks/useUserReports';
import {
  getReportsByStatus,
  REPORT_STATUS_API_VALUES,
  REPORT_STATUS_FILTER_OPTIONS,
  searchReports,
} from '../api/userReportsApi';
import '../user-reports.css';

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function getCurrentUserId(user = {}) {
  return user?.id || user?.userId || user?.UserId || user?.sub || '';
}

function getReportId(report = {}) {
  return report.reportId || report.id || report.reportID || report.ReportId || '';
}

function getReportPosition(report = {}) {
  if (report.position?.lat && report.position?.lng) {
    return report.position;
  }

  if (
    Number.isFinite(Number(report.latitude)) &&
    Number.isFinite(Number(report.longitude))
  ) {
    return {
      lat: Number(report.latitude),
      lng: Number(report.longitude),
    };
  }

  return null;
}

function getAreaLabel(report = {}) {
  const area = report.area;

  if (typeof area === 'string') {
    return area;
  }

  return (
    area?.city ||
    report.city ||
    report.governorateName ||
    report.areaText ||
    ''
  );
}

function getAddressLabel(report = {}) {
  const area = report.area;

  if (report.locationText || report.address || report.detailedAddress) {
    return [report.locationText || report.address, report.detailedAddress]
      .filter(Boolean)
      .join(' - ');
  }

  if (typeof area === 'string') {
    return area;
  }

  return [area?.city, area?.address, area?.detailedAddress]
    .filter(Boolean)
    .join(' - ');
}

function getPriorityLabel(report = {}) {
  if (report.priorityLabel || report.severityLabel) {
    return report.priorityLabel || report.severityLabel;
  }

  if (Number(report.priority) === 3) return 'عالية';
  if (Number(report.priority) === 2) return 'متوسطة';
  if (Number(report.priority) === 1) return 'منخفضة';

  return report.priority || 'متوسطة';
}

function isRejectedReport(report = {}) {
  const status = normalizeText(report.status || report.statusKey);
  const statusLabel = normalizeText(report.statusLabel);
  const statusTone = normalizeText(report.statusTone || report.tone);

  return (
    status === 'rejected' ||
    status.includes('rejected') ||
    statusLabel.includes('مرفوض') ||
    statusTone === 'danger'
  );
}

function isReportOwnedByUser(report, userId) {
  if (!userId) return false;

  if (report?.isOwnedByCurrentUser === true) return true;

  const ownerId =
    report?.ownerUserId ||
    report?.userId ||
    report?.UserId ||
    report?.createdByUserId ||
    report?.reporterId ||
    report?.ownerId ||
    report?.user?.id ||
    report?.user?.userId ||
    '';

  return ownerId ? String(ownerId) === String(userId) : false;
}

function doesReportMatchStatus(report, statusFilter) {
  if (statusFilter === REPORT_STATUS_API_VALUES.all) return true;

  return (
    report.statusKey === statusFilter ||
    report.status === statusFilter ||
    report.Status === statusFilter
  );
}

function paginateItems(items = [], pageNumber = 1, pageSize = 10) {
  const startIndex = (pageNumber - 1) * pageSize;

  return items.slice(startIndex, startIndex + pageSize);
}

function getClientPagination(items = [], pageNumber = 1, pageSize = 10) {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePageNumber = Math.min(Math.max(pageNumber, 1), totalPages);

  return {
    totalCount,
    pageNumber: safePageNumber,
    pageSize,
    totalPages,
  };
}

function toMapReport(report = {}) {
  const reportId = getReportId(report);
  const position = getReportPosition(report);

  return {
    id: `mine-${reportId}`,
    originalId: reportId,
    reportNumber: report.reportNumber || reportId,
    source: 'mine',
    rawReport: report,

    title:
      report.title ||
      report.issue ||
      report.categoryLabel ||
      report.issueCategoryName ||
      'بلاغ المستخدم',
    typeLabel:
      report.issueCategoryName ||
      report.categoryLabel ||
      report.issue ||
      report.categoryName ||
      'أخرى',

    statusLabel: report.statusLabel || 'قيد المراجعة',
    statusTone: report.statusTone || report.tone || 'warning',

    priority: getPriorityLabel(report),
    description: report.description || 'لا يوجد وصف متاح لهذا البلاغ.',

    area: getAreaLabel(report),
    address: getAddressLabel(report),

    date: report.createdAt || report.date || report.reportedAt,

    coverImage: report.coverImage || report.image || report.images?.[0] || '',
    images: report.imageUrls || report.images || [],

    position,
  };
}

function toMapMarker(report) {
  return {
    id: report.id,
    reportId: report.id,
    originalId: report.originalId,
    title: report.title,
    subtitle: report.typeLabel,
    area: report.area,
    statusLabel: report.statusLabel,
    tone: report.statusTone,
    address: report.address,
    position: report.position,
  };
}

function focusStateToMapReport(focusMapReport = {}) {
  const reportId = focusMapReport.originalId || focusMapReport.reportId || focusMapReport.markerId;

  return {
    id: focusMapReport.markerId || `mine-${reportId}`,
    originalId: reportId,
    reportNumber: focusMapReport.reportNumber || reportId,
    source: 'mine',
    rawReport: {
      id: reportId,
      reportId,
      title: focusMapReport.title,
      description: focusMapReport.description,
      statusLabel: focusMapReport.statusLabel,
      statusTone: focusMapReport.statusTone || focusMapReport.tone,
      categoryLabel: focusMapReport.typeLabel,
      issueCategoryName: focusMapReport.typeLabel,
      locationText: focusMapReport.address,
      createdAt: focusMapReport.date,
      coverImage: focusMapReport.coverImage,
      images: focusMapReport.images || [],
      position: focusMapReport.position,
    },

    title: focusMapReport.title || 'بلاغ المستخدم',
    typeLabel: focusMapReport.typeLabel || focusMapReport.subtitle || 'أخرى',
    statusLabel: focusMapReport.statusLabel || 'قيد المراجعة',
    statusTone: focusMapReport.statusTone || focusMapReport.tone || 'warning',
    priority: focusMapReport.priority || 'متوسطة',
    description: focusMapReport.description || 'لا يوجد وصف متاح لهذا البلاغ.',
    area: focusMapReport.area || '',
    address: focusMapReport.address || focusMapReport.area || '',
    date: focusMapReport.date || focusMapReport.createdAt,
    coverImage: focusMapReport.coverImage || '',
    images: focusMapReport.images || [],
    position: focusMapReport.position,
  };
}

function buildDashboardStats(reports = [], totalCount = 0) {
  const pendingReports = reports.filter((report) => {
    return [
      REPORT_STATUS_API_VALUES.underReview,
      REPORT_STATUS_API_VALUES.pending,
    ].includes(report.statusKey);
  }).length;

  const inProgressReports = reports.filter((report) => {
    return [
      REPORT_STATUS_API_VALUES.accepted,
      REPORT_STATUS_API_VALUES.assigned,
      REPORT_STATUS_API_VALUES.inProgress,
    ].includes(report.statusKey);
  }).length;

  const solvedReports = reports.filter((report) => {
    return [
      REPORT_STATUS_API_VALUES.resolved,
      REPORT_STATUS_API_VALUES.completed,
      REPORT_STATUS_API_VALUES.closed,
    ].includes(report.statusKey);
  }).length;

  return [
    {
      id: 'total',
      title: 'البلاغات المقدمة',
      subtitle: 'Total Reports',
      value: totalCount || reports.length,
      tone: 'primary',
    },
    {
      id: 'pending',
      title: 'قيد المراجعة',
      subtitle: 'Pending / Under Review',
      value: pendingReports,
      tone: 'warning',
    },
    {
      id: 'in-progress',
      title: 'جاري الحل',
      subtitle: 'In Progress / Assigned',
      value: inProgressReports,
      tone: 'info',
    },
    {
      id: 'solved',
      title: 'تم الحل',
      subtitle: 'Resolved / Closed',
      value: solvedReports,
      tone: 'success',
    },
  ];
}

function ReportsPaginationControls({ pagination, onPageChange, isLoading = false }) {
  const pageNumber = Number(pagination?.pageNumber || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const totalCount = Number(pagination?.totalCount || 0);
  const pageSize = Number(pagination?.pageSize || 10);

  if (!pagination || totalPages <= 1) return null;

  const canGoPrevious = pageNumber > 1 && !isLoading;
  const canGoNext = pageNumber < totalPages && !isLoading;

  return (
    <div className="user-reports-pagination" dir="rtl">
      <button
        type="button"
        className="user-reports-pagination__btn"
        onClick={() => onPageChange?.(pageNumber - 1)}
        disabled={!canGoPrevious}
      >
        <FiChevronRight />
        السابق
      </button>

      <div className="user-reports-pagination__info">
        <strong>
          صفحة {pageNumber} من {totalPages}
        </strong>

        <span>
          إجمالي {totalCount} بلاغ — {pageSize} بلاغ في الصفحة
        </span>
      </div>

      <button
        type="button"
        className="user-reports-pagination__btn"
        onClick={() => onPageChange?.(pageNumber + 1)}
        disabled={!canGoNext}
      >
        التالي
        <FiChevronLeft />
      </button>
    </div>
  );
}

function MyReportsPage() {
  const { user } = useAuth();
  const location = useLocation();

  const userId = getCurrentUserId(user);
  const mapSectionRef = useRef(null);
  const selectedReportCardRef = useRef(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [clientPageNumber, setClientPageNumber] = useState(1);

  const { reports, pagination, isLoading, errorMessage } = useUserReports(
    userId,
    pageNumber
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(REPORT_STATUS_API_VALUES.all);

  const [searchResults, setSearchResults] = useState([]);
  const [statusResults, setStatusResults] = useState([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const [searchErrorMessage, setSearchErrorMessage] = useState('');
  const [statusErrorMessage, setStatusErrorMessage] = useState('');

  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedMapReport, setSelectedMapReport] = useState(null);
  const [detailsMapReport, setDetailsMapReport] = useState(null);
  const [routeReportId, setRouteReportId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [highlightedReportId, setHighlightedReportId] = useState(
    location.state?.createdReportId ||
      location.state?.selectedReportId ||
      location.state?.highlightReportId ||
      null
  );

  const successMessage = location.state?.successMessage || '';
  const focusMapReport = location.state?.focusMapReport || null;

  const isSearchActive = Boolean(searchQuery.trim());
  const isStatusActive = statusFilter !== REPORT_STATUS_API_VALUES.all;

  useEffect(() => {
    const nextHighlightedReportId =
      location.state?.createdReportId ||
      location.state?.selectedReportId ||
      location.state?.highlightReportId ||
      null;

    setHighlightedReportId(nextHighlightedReportId);
  }, [location.state]);

  useEffect(() => {
    if (!highlightedReportId) return;

    const timer = window.setTimeout(() => {
      document
        .querySelector(`[data-report-row-id="${highlightedReportId}"]`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [highlightedReportId, reports]);

  useEffect(() => {
    if (!isStatusActive) {
      setStatusResults([]);
      setStatusErrorMessage('');
      setIsStatusLoading(false);
      setClientPageNumber(1);
      return undefined;
    }

    let isCanceled = false;

    async function loadByStatus() {
      try {
        setIsStatusLoading(true);
        setStatusErrorMessage('');

        const response = await getReportsByStatus(statusFilter);

        if (isCanceled) return;

        const userOnlyReports = response.items.filter((report) =>
          isReportOwnedByUser(report, userId)
        );

        setStatusResults(userOnlyReports);
        setClientPageNumber(1);
      } catch (error) {
        if (isCanceled) return;

        setStatusResults([]);
        setStatusErrorMessage(
          error?.message || 'تعذر فلترة البلاغات حسب الحالة حاليًا.'
        );
      } finally {
        if (!isCanceled) {
          setIsStatusLoading(false);
        }
      }
    }

    loadByStatus();

    return () => {
      isCanceled = true;
    };
  }, [isStatusActive, statusFilter, userId]);

  useEffect(() => {
    const term = searchQuery.trim();

    if (!term) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchErrorMessage('');
      setClientPageNumber(1);
      return undefined;
    }

    let isCanceled = false;

    const timer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchErrorMessage('');

        const results = await searchReports(term);

        if (isCanceled) return;

        const userOnlyResults = results.filter((report) =>
          isReportOwnedByUser(report, userId)
        );

        setSearchResults(userOnlyResults);
        setClientPageNumber(1);
      } catch (error) {
        if (isCanceled) return;

        setSearchResults([]);
        setSearchErrorMessage(
          error?.message || 'تعذر البحث في البلاغات حاليًا.'
        );
      } finally {
        if (!isCanceled) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      isCanceled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, userId]);

  const dashboardStats = useMemo(() => {
    return buildDashboardStats(reports, pagination.totalCount || reports.length);
  }, [reports, pagination.totalCount]);

  const sourceReports = useMemo(() => {
    if (isSearchActive) {
      return searchResults.filter((report) =>
        doesReportMatchStatus(report, statusFilter)
      );
    }

    if (isStatusActive) {
      return statusResults;
    }

    return reports;
  }, [
    isSearchActive,
    searchResults,
    isStatusActive,
    statusFilter,
    statusResults,
    reports,
  ]);

  const pageSize = pagination.pageSize || 10;

  const clientPagination = useMemo(() => {
    return getClientPagination(sourceReports, clientPageNumber, pageSize);
  }, [sourceReports, clientPageNumber, pageSize]);

  const displayedReports = useMemo(() => {
    if (!isSearchActive && !isStatusActive) {
      return sourceReports;
    }

    return paginateItems(
      sourceReports,
      clientPagination.pageNumber,
      clientPagination.pageSize
    );
  }, [sourceReports, isSearchActive, isStatusActive, clientPagination]);

  const tablePagination = isSearchActive || isStatusActive ? clientPagination : pagination;

  const mapReports = useMemo(() => {
    const reportsForMap = displayedReports
      .filter((report) => !isRejectedReport(report))
      .map(toMapReport)
      .filter((report) => report.position?.lat && report.position?.lng);

    if (
      focusMapReport?.markerId &&
      focusMapReport?.position?.lat &&
      focusMapReport?.position?.lng &&
      !isRejectedReport(focusMapReport) &&
      !reportsForMap.some((report) => report.id === focusMapReport.markerId)
    ) {
      reportsForMap.unshift(focusStateToMapReport(focusMapReport));
    }

    return reportsForMap;
  }, [displayedReports, focusMapReport]);

  const mapMarkers = useMemo(() => {
    return mapReports.map(toMapMarker);
  }, [mapReports]);

  const routeDestination = useMemo(() => {
    return mapReports.find((report) => report.id === routeReportId) || null;
  }, [mapReports, routeReportId]);

  useEffect(() => {
    if (!focusMapReport?.markerId) return;

    const report = mapReports.find(
      (item) => item.id === focusMapReport.markerId
    );

    if (!report) return;

    setRouteReportId(null);
    setActiveMarkerId(report.id);
    setSelectedMapReport(report);

    const timer = window.setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [focusMapReport, mapReports]);

  useEffect(() => {
    if (!selectedMapReport) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (!isMobile) return;

    const timer = window.setTimeout(() => {
      selectedReportCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [selectedMapReport]);


  const emptyMessage =
    isLoading || isStatusLoading
      ? 'جاري تحميل البلاغات...'
      : isSearching
        ? 'جاري البحث في البلاغات...'
        : isSearchActive || isStatusActive
          ? 'لا توجد بلاغات مطابقة لعملية البحث أو الفلترة.'
          : 'لم تقم بإضافة أي بلاغ حتى الآن.';

  function clearMapSelection() {
    setActiveMarkerId(null);
    setSelectedMapReport(null);
    setDetailsMapReport(null);
    setRouteReportId(null);
  }

  function handleSearchChange(value) {
    setSearchQuery(value);
    setClientPageNumber(1);
    clearMapSelection();
  }

  function handleStatusFilterChange(value) {
    setStatusFilter(value);
    setClientPageNumber(1);
    clearMapSelection();
  }

  function handleResetFilters() {
    setSearchQuery('');
    setStatusFilter(REPORT_STATUS_API_VALUES.all);
    setSearchResults([]);
    setStatusResults([]);
    setSearchErrorMessage('');
    setStatusErrorMessage('');
    setClientPageNumber(1);
    setPageNumber(1);
    clearMapSelection();
  }

  function handlePageChange(nextPageNumber) {
    clearMapSelection();

    if (isSearchActive || isStatusActive) {
      setClientPageNumber(nextPageNumber);
      return;
    }

    setPageNumber(nextPageNumber);
  }

  function handleMarkerSelect(marker) {
    if (!marker?.id) return;

    const report = mapReports.find(
      (item) =>
        String(item.id) === String(marker.id) ||
        String(item.id) === String(marker.reportId)
    );

    setRouteReportId(null);
    setActiveMarkerId(marker.id);
    setSelectedMapReport(report || null);
  }


  function handleRequestDirections(report) {
    if (!report?.id) return;

    if (!currentLocation?.lat || !currentLocation?.lng) {
      window.alert(
        'حدد موقعك الحالي من زر الخريطة أولًا، ثم اضغط أقصر مسافة.'
      );
      return;
    }

    setSelectedMapReport(report);
    setActiveMarkerId(report.id);
    setRouteReportId(report.id);
  }

  function handleGoToReport(report) {
    if (!report) return;

    const reportId = report.originalId || getReportId(report.rawReport);

    setHighlightedReportId(reportId);

    window.setTimeout(() => {
      document
        .querySelector(`[data-report-row-id="${reportId}"]`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 80);
  }

  function renderPopupContent(marker) {
    const report = mapReports.find(
      (item) => String(item.id) === String(marker.id)
    );

    if (!report) return null;

    return (
      <div className="user-dashboard-map-popup">
        <strong>{report.title}</strong>

        <span>{report.typeLabel}</span>

        <small>
          <FiMapPin />
          {report.area || report.address || 'لم يتم تحديد الموقع'}
        </small>

        <div className="user-dashboard-map-popup__actions">
          <button
            type="button"
            onClick={() => {
              setSelectedMapReport(report);
              setDetailsMapReport(report);
            }}
          >
            <FiEye />
            عرض التفاصيل
          </button>

          <button type="button" onClick={() => handleGoToReport(report)}>
            صفحة البلاغ
            <FiArrowLeft />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page user-dashboard-page user-reports-page">
      <PageHeader
        title="بلاغاتي"
        subtitle={`متابعة بلاغاتك والإحصائيات والخريطة والجدول من مكان واحد${
          user?.name || user?.userName
            ? ` • أهلاً ${user.name || user.userName}`
            : ''
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

      {successMessage ? (
        <div className="user-reports__success-banner">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="user-reports__success-banner user-reports__success-banner--error">
          {errorMessage}
        </div>
      ) : null}

      {searchErrorMessage ? (
        <div className="user-reports__success-banner user-reports__success-banner--error">
          {searchErrorMessage}
        </div>
      ) : null}

      {statusErrorMessage ? (
        <div className="user-reports__success-banner user-reports__success-banner--error">
          {statusErrorMessage}
        </div>
      ) : null}

      <UserDashboardStats stats={dashboardStats} />

      <UserReportsFilters
        totalReports={sourceReports.length}
        filteredCount={displayedReports.length}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        statusOptions={REPORT_STATUS_FILTER_OPTIONS}
        onReset={handleResetFilters}
        isSearching={isSearching || isStatusLoading}
      />

      <section ref={mapSectionRef} className="user-dashboard-map-card">
        <header className="user-dashboard-map-card__header">
          <div>
            <h2>خريطة بلاغاتي</h2>
            <p>
              الخريطة تعرض البلاغات الخاصة بك فقط حسب البحث والفلترة، مع استبعاد البلاغات المرفوضة.
            </p>
          </div>

          <div className="user-dashboard-map-card__actions">
            <span className="dashboard-chip">
              {mapMarkers.length} بلاغ على الخريطة
            </span>
            <MapLegend items={reportMapLegend} compact />
          </div>
        </header>

        <div className="user-dashboard-map-wrapper">
          <ReportsMap
            markers={mapMarkers}
            userLocation={user?.location}
            activeMarkerId={activeMarkerId}
            onMarkerSelect={handleMarkerSelect}
            onCurrentLocationChange={setCurrentLocation}
            routeDestination={routeDestination}
            height={560}
            renderPopupContent={renderPopupContent}
          />

          {!mapMarkers.length ? (
            <div className="user-reports-map-empty" dir="rtl">
              <strong>لا توجد بلاغات متاحة على الخريطة</strong>
              <span>
                قد تكون كل النتائج بدون إحداثيات أو مرفوضة، أو لا توجد نتائج مطابقة للبحث والفلترة.
              </span>
            </div>
          ) : null}

          <div
            ref={selectedReportCardRef}
            className="user-dashboard-selected-report-card-slot"
          >
            <UserMapSelectedReportCard
              report={selectedMapReport}
              onClose={() => {
                setSelectedMapReport(null);
                setActiveMarkerId(null);
                setRouteReportId(null);
              }}
              onOpenDetails={setDetailsMapReport}
              onGoToReport={handleGoToReport}
              onRequestDirections={handleRequestDirections}
            />
          </div>
        </div>

        <div className="user-reports-map-pagination-wrap">
          <ReportsPaginationControls
            pagination={tablePagination}
            onPageChange={handlePageChange}
            isLoading={isLoading || isSearching || isStatusLoading}
          />
        </div>
      </section>

      <DashboardSectionCard
        title={isSearchActive || isStatusActive ? 'نتائج البحث والفلترة' : 'جدول البلاغات'}
        subtitle={isSearchActive || isStatusActive ? 'Search & Filter Results' : 'My Reports Table'}
      >
        <RecentReportsTable
          reports={displayedReports}
          highlightedReportId={highlightedReportId}
          emptyMessage={emptyMessage}
          pagination={tablePagination}
          onPageChange={handlePageChange}
          isLoading={isLoading || isSearching || isStatusLoading}
        />
      </DashboardSectionCard>

      {detailsMapReport
        ? createPortal(
            <UserDashboardReportDetailsModal
              report={detailsMapReport}
              onClose={() => setDetailsMapReport(null)}
              onGoToReport={handleGoToReport}
              onRequestDirections={handleRequestDirections}
            />,
            document.body
          )
        : null}
    </div>
  );
}

export default MyReportsPage;
