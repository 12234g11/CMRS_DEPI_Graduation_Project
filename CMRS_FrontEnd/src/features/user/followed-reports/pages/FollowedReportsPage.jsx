import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEye,
  FiMapPin,
} from 'react-icons/fi';

import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import ReportsMap from '../../../map/components/ReportsMap';
import UserMapSelectedReportCard from '../../dashboard/components/UserMapSelectedReportCard';
import UserReportsFilters from '../../reports/components/UserReportsFilters';
import {
  FOLLOWED_REPORT_STATUS_API_VALUES,
  FOLLOWED_REPORT_STATUS_FILTER_OPTIONS,
  findFollowedReportPage,
  getFollowedReportDetails,
  getFollowedReports,
  unfollowReport,
} from '../api/followedReportsApi';
import FollowedReportDetailsModal from '../components/FollowedReportDetailsModal';
import FollowedReportsMapLegend from '../components/FollowedReportsMapLegend';
import FollowedReportsTable from '../components/FollowedReportsTable';
import '../../reports/user-reports.css';
import '../followed-reports.css';

function getNavigationReportId(location = {}) {
  const searchParams = new URLSearchParams(location.search || '');

  return String(
    location.state?.notificationReportId ||
      location.state?.selectedReportId ||
      location.state?.highlightReportId ||
      location.state?.reportId ||
      searchParams.get('reportId') ||
      ''
  ).trim();
}

function isNotificationNavigation(location = {}) {
  const searchParams = new URLSearchParams(location.search || '');

  return Boolean(
    location.state?.fromNotification ||
      location.state?.fromNotifications ||
      location.state?.source === 'notification' ||
      searchParams.get('source') === 'notification'
  );
}

function toMapReport(report = {}) {
  const reportId = report.reportId || report.id;

  return {
    id: `followed-${reportId}`,
    originalId: reportId,
    reportNumber: report.reportNumber || reportId,
    source: 'followed',
    rawReport: report,
    title: report.title || 'بلاغ متابَع',
    typeLabel: report.issueCategoryName || 'أخرى',
    statusKey: report.statusKey,
    statusLabel: report.statusLabel || 'غير محدد',
    statusTone: report.statusTone || 'warning',
    priority: report.priorityLabel || 'غير محددة',
    description:
      report.descriptionPreview ||
      report.description ||
      'لا يوجد وصف متاح لهذا البلاغ.',
    area: report.area?.city || report.areaText || '',
    address: report.locationText || '',
    date: report.createdAt,
    coverImage: report.coverImage || report.images?.[0] || '',
    images: report.images || [],
    position: report.position,
  };
}

function toMapMarker(report = {}) {
  return {
    id: report.id,
    reportId: report.id,
    originalId: report.originalId,
    title: report.title,
    subtitle: report.typeLabel,
    area: report.area,
    address: report.address,
    statusKey: report.statusKey,
    statusLabel: report.statusLabel,
    tone: report.statusTone,
    position: report.position,
  };
}

function mergeReportDetails(summary = {}, details = {}) {
  const detailCategory =
    details.issueCategoryName && details.issueCategoryName !== 'أخرى'
      ? details.issueCategoryName
      : summary.issueCategoryName;

  const detailNumber =
    details.reportNumber && details.reportNumber !== details.reportId
      ? details.reportNumber
      : summary.reportNumber;

  return {
    ...summary,
    ...details,
    reportNumber: detailNumber || details.reportId || summary.reportId,
    issueCategoryId: details.issueCategoryId || summary.issueCategoryId,
    issueCategoryName: detailCategory || 'أخرى',
    categoryLabel: detailCategory || 'أخرى',
    description:
      details.description || summary.description || summary.descriptionPreview,
    reportImages:
      details.reportImages?.length
        ? details.reportImages
        : summary.reportImages || [],
    images:
      details.images?.length ? details.images : summary.images || [],
    coverImage:
      details.coverImage || summary.coverImage || summary.images?.[0] || '',
    followedAt: details.followedAt || summary.followedAt,
  };
}

function FollowedReportsPage() {
  const location = useLocation();
  const mapSectionRef = useRef(null);
  const selectedReportCardRef = useRef(null);
  const previousSearchQueryRef = useRef('');

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });

  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(
    FOLLOWED_REPORT_STATUS_API_VALUES.all
  );
  const [reloadKey, setReloadKey] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedMapReport, setSelectedMapReport] = useState(null);
  const [routeReportId, setRouteReportId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [highlightedReportId, setHighlightedReportId] = useState(
    getNavigationReportId(location) || null
  );
  const [notificationFocusReportId, setNotificationFocusReportId] = useState(
    isNotificationNavigation(location)
      ? getNavigationReportId(location) || null
      : null
  );
  const [isNotificationFocusLoading, setIsNotificationFocusLoading] =
    useState(false);

  const [selectedReportDetails, setSelectedReportDetails] = useState(null);
  const [loadingReportId, setLoadingReportId] = useState('');
  const [unfollowingReportId, setUnfollowingReportId] = useState('');

  useEffect(() => {
    const searchChanged = previousSearchQueryRef.current !== searchQuery;
    previousSearchQueryRef.current = searchQuery;

    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());

      if (searchChanged) {
        setPageNumber(1);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const nextReportId = getNavigationReportId(location);
    const nextNotificationReportId = isNotificationNavigation(location)
      ? nextReportId || null
      : null;

    setHighlightedReportId(nextReportId || null);
    setNotificationFocusReportId(nextNotificationReportId);
  }, [location.search, location.state]);

  useEffect(() => {
    if (!notificationFocusReportId) {
      setIsNotificationFocusLoading(false);
      return undefined;
    }

    let isCanceled = false;

    async function locateNotificationReport() {
      try {
        setIsNotificationFocusLoading(true);
        setErrorMessage('');
        setSearchQuery('');
        setDebouncedSearch('');
        setStatusFilter(FOLLOWED_REPORT_STATUS_API_VALUES.all);
        clearMapSelection();

        const locatedReport = await findFollowedReportPage({
          reportId: notificationFocusReportId,
          pageSize: 10,
        });

        if (isCanceled) return;

        if (!locatedReport) {
          setErrorMessage(
            'لم يتم العثور على البلاغ المرتبط بالإشعار داخل البلاغات المتابَعة.'
          );
          return;
        }

        setHighlightedReportId(notificationFocusReportId);
        setPageNumber(locatedReport.pageNumber);
        setNotificationFocusReportId(null);
      } catch (error) {
        if (isCanceled) return;

        setErrorMessage(
          error?.message || 'تعذر الوصول إلى البلاغ المرتبط بالإشعار حاليًا.'
        );
      } finally {
        if (!isCanceled) {
          setIsNotificationFocusLoading(false);
        }
      }
    }

    locateNotificationReport();

    return () => {
      isCanceled = true;
    };
  }, [notificationFocusReportId]);

  useEffect(() => {
    let isCanceled = false;

    async function loadFollowedReports() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await getFollowedReports({
          search: debouncedSearch,
          status: statusFilter,
          pageNumber,
          pageSize: 10,
          sortBy: 'FollowedAt',
          sortDirection: 'desc',
        });

        if (isCanceled) return;

        const nextPagination = response.pagination || {};

        if (
          pageNumber > 1 &&
          Number(nextPagination.totalPages || 1) < pageNumber
        ) {
          setPageNumber(Math.max(1, Number(nextPagination.totalPages || 1)));
          return;
        }

        setReports(response.items || []);
        setPagination({
          pageNumber: Number(nextPagination.pageNumber || pageNumber),
          pageSize: Number(nextPagination.pageSize || 10),
          totalCount: Number(nextPagination.totalCount || 0),
          totalPages: Number(nextPagination.totalPages || 1),
          hasPreviousPage: Boolean(nextPagination.hasPreviousPage),
          hasNextPage: Boolean(nextPagination.hasNextPage),
        });
      } catch (error) {
        if (isCanceled) return;

        setReports([]);
        setPagination({
          pageNumber: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 1,
        });
        setErrorMessage(
          error?.message || 'تعذر تحميل البلاغات المتابَعة حاليًا.'
        );
      } finally {
        if (!isCanceled) setIsLoading(false);
      }
    }

    loadFollowedReports();

    return () => {
      isCanceled = true;
    };
  }, [debouncedSearch, pageNumber, reloadKey, statusFilter]);

  useEffect(() => {
    if (!selectedMapReport) return undefined;

    const stillAvailable = reports.some(
      (report) =>
        String(report.reportId) === String(selectedMapReport.originalId)
    );

    if (!stillAvailable) {
      setSelectedMapReport(null);
      setActiveMarkerId(null);
      setRouteReportId(null);
    }

    return undefined;
  }, [reports, selectedMapReport]);

  useEffect(() => {
    if (!selectedMapReport) return undefined;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return undefined;

    const timer = window.setTimeout(() => {
      selectedReportCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [selectedMapReport]);

  const mapReports = useMemo(
    () =>
      reports
        .map(toMapReport)
        .filter((report) => report.position?.lat && report.position?.lng),
    [reports]
  );

  const mapMarkers = useMemo(
    () => mapReports.map(toMapMarker),
    [mapReports]
  );

  const routeDestination = useMemo(
    () => mapReports.find((report) => report.id === routeReportId) || null,
    [mapReports, routeReportId]
  );

  const emptyMessage = isLoading
    ? 'جاري تحميل البلاغات المتابَعة...'
    : debouncedSearch
      ? 'لا توجد بلاغات متابَعة مطابقة للبحث.'
      : statusFilter !== FOLLOWED_REPORT_STATUS_API_VALUES.all
        ? 'لا توجد بلاغات متابَعة بالحالة المختارة.'
        : 'لم تقم بمتابعة أي بلاغ متاح حتى الآن.';

  function clearMapSelection() {
    setActiveMarkerId(null);
    setSelectedMapReport(null);
    setRouteReportId(null);
  }

  function handleSearchChange(value) {
    setSearchQuery(value);
    setSuccessMessage('');
    setPageNumber(1);
    clearMapSelection();
  }

  function handleStatusFilterChange(value) {
    setStatusFilter(value);
    setPageNumber(1);
    setSuccessMessage('');
    clearMapSelection();
  }

  function handleResetFilters() {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter(FOLLOWED_REPORT_STATUS_API_VALUES.all);
    setPageNumber(1);
    setSuccessMessage('');
    clearMapSelection();
  }

  function handleMarkerSelect(marker) {
    const report = mapReports.find(
      (item) => String(item.id) === String(marker?.id)
    );

    if (!report) return;

    setRouteReportId(null);
    setActiveMarkerId(report.id);
    setSelectedMapReport(report);
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
    const reportId = report?.originalId || report?.reportId || report?.id;
    if (!reportId) return;

    setHighlightedReportId(reportId);

    window.setTimeout(() => {
      document
        .querySelector(`[data-report-row-id="${reportId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  async function handleOpenDetails(reportOrMapReport) {
    const summary = reportOrMapReport?.rawReport || reportOrMapReport;
    const reportId = summary?.reportId || summary?.id || reportOrMapReport?.originalId;

    if (!reportId) return;

    try {
      setLoadingReportId(reportId);
      setErrorMessage('');

      const details = await getFollowedReportDetails(reportId);
      setSelectedReportDetails(mergeReportDetails(summary, details));
    } catch (error) {
      setErrorMessage(
        error?.message || 'تعذر تحميل تفاصيل البلاغ المتابَع حاليًا.'
      );
    } finally {
      setLoadingReportId('');
    }
  }

  async function handleUnfollow(reportOrMapReport) {
    const sourceReport = reportOrMapReport?.rawReport || reportOrMapReport;
    const reportId =
      sourceReport?.reportId ||
      sourceReport?.id ||
      reportOrMapReport?.originalId;

    if (!reportId || unfollowingReportId) return;

    const shouldUnfollow = window.confirm(
      'هل أنت متأكد من إلغاء متابعة هذا البلاغ؟ سيختفي من هذه الصفحة.'
    );

    if (!shouldUnfollow) return;

    try {
      setUnfollowingReportId(reportId);
      setErrorMessage('');
      setSuccessMessage('');

      await unfollowReport(reportId);

      setSelectedReportDetails(null);
      clearMapSelection();
      setHighlightedReportId(null);
      setSuccessMessage('تم إلغاء متابعة البلاغ بنجاح.');

      if (reports.length === 1 && pageNumber > 1) {
        setPageNumber((currentPage) => Math.max(1, currentPage - 1));
      } else {
        setReloadKey((currentKey) => currentKey + 1);
      }
    } catch (error) {
      setErrorMessage(error?.message || 'تعذر إلغاء متابعة البلاغ حاليًا.');
    } finally {
      setUnfollowingReportId('');
    }
  }

  function renderPopupContent(marker) {
    const report = mapReports.find(
      (item) => String(item.id) === String(marker?.id)
    );

    if (!report) return null;

    return (
      <div className="user-dashboard-map-popup">
        <strong>{report.title}</strong>

        <div className="user-dashboard-map-popup__meta">
          <span>{report.typeLabel}</span>
          <span
            className={`user-dashboard-map-popup__status user-dashboard-map-popup__status--${report.statusTone}`}
          >
            {report.statusLabel}
          </span>
        </div>

        <small>
          <FiMapPin />
          {report.area || report.address || 'لم يتم تحديد الموقع'}
        </small>

        <div className="user-dashboard-map-popup__actions">
          <button type="button" onClick={() => handleOpenDetails(report)}>
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
    <div className="dashboard-page user-dashboard-page user-reports-page followed-reports-page">
      <PageHeader
        title="البلاغات المتابَعة"
        subtitle="تابع البلاغات القريبة التي تهمك واعرض حالتها وموقعها وتفاصيلها العامة بأمان."
        action={
          <Link
            to={ROUTES.NEARBY_ISSUES}
            className="dashboard-action-btn dashboard-action-btn--primary"
          >
            <FiMapPin />
            <span>مشاكل قريبة منك</span>
          </Link>
        }
      />

      {successMessage ? (
        <div className="user-reports__success-banner">{successMessage}</div>
      ) : null}

      {errorMessage ? (
        <div className="user-reports__success-banner user-reports__success-banner--error">
          {errorMessage}
        </div>
      ) : null}

      <UserReportsFilters
        totalReports={pagination.totalCount}
        filteredCount={reports.length}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        statusOptions={FOLLOWED_REPORT_STATUS_FILTER_OPTIONS}
        onReset={handleResetFilters}
        isSearching={
          isLoading ||
          isNotificationFocusLoading ||
          searchQuery.trim() !== debouncedSearch
        }
      />

      <section ref={mapSectionRef} className="user-dashboard-map-card">
        <header className="user-dashboard-map-card__header">
          <div>
            <h2>خريطة البلاغات المتابَعة</h2>
            <p>
              تعرض الخريطة بلاغات الصفحة الحالية فقط، ويمكنك فتح التفاصيل أو الوصول إلى صف البلاغ في الجدول.
            </p>
          </div>

          <div className="user-dashboard-map-card__actions">
            <span className="dashboard-chip">
              {mapMarkers.length} من {reports.length} بلاغ على الخريطة
            </span>
            <FollowedReportsMapLegend />
          </div>
        </header>

        <div className="user-dashboard-map-wrapper">
          <ReportsMap
            markers={mapMarkers}
            activeMarkerId={activeMarkerId}
            onMarkerSelect={handleMarkerSelect}
            onCurrentLocationChange={setCurrentLocation}
            routeDestination={routeDestination}
            height={560}
            renderPopupContent={renderPopupContent}
          />

          {!mapMarkers.length ? (
            <div className="user-reports-map-empty" dir="rtl">
              <strong>لا توجد بلاغات متابَعة متاحة على الخريطة</strong>
              <span>
                قد لا تحتوي نتائج الصفحة الحالية على إحداثيات، أو لا توجد نتائج مطابقة للبحث والفلترة.
              </span>
            </div>
          ) : null}

          <div
            ref={selectedReportCardRef}
            className="user-dashboard-selected-report-card-slot"
          >
            <UserMapSelectedReportCard
              report={selectedMapReport}
              onClose={clearMapSelection}
              onOpenDetails={handleOpenDetails}
              onGoToReport={handleGoToReport}
              onRequestDirections={handleRequestDirections}
            />
          </div>
        </div>
      </section>

      <DashboardSectionCard
        title="جدول البلاغات المتابَعة"
        subtitle="Followed Reports Table"
      >
        <FollowedReportsTable
          reports={reports}
          pagination={pagination}
          highlightedReportId={highlightedReportId}
          loadingReportId={loadingReportId}
          unfollowingReportId={unfollowingReportId}
          isLoading={isLoading || isNotificationFocusLoading}
          emptyMessage={emptyMessage}
          onPageChange={(nextPage) => {
            setPageNumber(nextPage);
            clearMapSelection();
          }}
          onOpenDetails={handleOpenDetails}
          onUnfollow={handleUnfollow}
        />
      </DashboardSectionCard>

      {selectedReportDetails
        ? createPortal(
            <FollowedReportDetailsModal
              report={selectedReportDetails}
              onClose={() => setSelectedReportDetails(null)}
              onUnfollow={handleUnfollow}
              isUnfollowing={
                String(unfollowingReportId) ===
                String(selectedReportDetails.reportId)
              }
            />,
            document.body
          )
        : null}
    </div>
  );
}

export default FollowedReportsPage;
