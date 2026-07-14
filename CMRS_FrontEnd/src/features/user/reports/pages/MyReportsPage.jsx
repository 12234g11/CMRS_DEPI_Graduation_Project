import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiMapPin,
  FiPlus,
} from 'react-icons/fi';

import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import { useAuth } from '../../../auth/hooks/useAuth';
import ReportsMap from '../../../map/components/ReportsMap';
import UserReportDetailsModal from '../components/UserReportDetailsModal';
import UserMapSelectedReportCard from '../components/UserMapSelectedReportCard';
import RecentReportsTable from '../components/RecentReportsTable';
import UserReportsFilters from '../components/UserReportsFilters';
import UserReportsMapLegend from '../components/UserReportsMapLegend';
import UserReportsStats from '../components/UserReportsStats';
import useUserReports from '../hooks/useUserReports';
import {
  findUserReportPage,
  getReportStatusKey,
  getReportsByStatus,
  getStatusTone,
  REPORT_STATUS_API_VALUES,
  REPORT_STATUS_FILTER_OPTIONS,
  searchReports,
} from '../api/userReportsApi';
import '../user-reports.css';

function getCurrentUserId(user = {}) {
  return user?.id || user?.userId || user?.UserId || user?.sub || '';
}

function isImmediatePageReload() {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return false;
  }

  const navigationEntry = performance.getEntriesByType?.('navigation')?.[0];
  const isReload =
    navigationEntry?.type === 'reload' || performance.navigation?.type === 1;

  // The navigation entry keeps its type for the whole document lifetime.
  // Limiting this check to the initial load prevents a later SPA navigation
  // from being mistaken for the original browser refresh.
  return isReload && performance.now() < 10000;
}

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

function getOwnerId(report = {}) {
  return (
    report.ownerUserId ||
    report.OwnerUserId ||
    report.userId ||
    report.UserId ||
    report.createdByUserId ||
    report.CreatedByUserId ||
    report.reporterId ||
    report.ReporterId ||
    report.ownerId ||
    report.OwnerId ||
    report.user?.id ||
    report.user?.userId ||
    report.User?.Id ||
    ''
  );
}

function isReportOwnedByUser(report = {}, userId = '') {
  if (!userId) return false;

  if (report.isOwnedByCurrentUser === true) {
    return true;
  }

  const ownerId = getOwnerId(report);

  if (!ownerId) {
    return true;
  }

  return String(ownerId) === String(userId);
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

const OPTIONAL_MAP_STATUS_KEYS = new Set([
  REPORT_STATUS_API_VALUES.resolved,
  REPORT_STATUS_API_VALUES.rejected,
  REPORT_STATUS_API_VALUES.unableToExecute,
]);

function getGroupedMapStatusKey(report = {}) {
  const statusValue =
    report.status ||
    report.statusKey ||
    report.Status ||
    report.StatusKey ||
    report.statusLabel ||
    '';

  if (statusValue) {
    return getReportStatusKey(statusValue);
  }

  const fallbackTone = String(report.statusTone || report.tone || '')
    .trim()
    .toLowerCase();

  if (fallbackTone === 'danger') return REPORT_STATUS_API_VALUES.rejected;
  if (fallbackTone === 'secondary') {
    return REPORT_STATUS_API_VALUES.unableToExecute;
  }
  if (fallbackTone === 'success') return REPORT_STATUS_API_VALUES.resolved;
  if (fallbackTone === 'info' || fallbackTone === 'primary') {
    return REPORT_STATUS_API_VALUES.inProgress;
  }

  return REPORT_STATUS_API_VALUES.underReview;
}

function canToggleMapReportVisibility(report = {}) {
  return OPTIONAL_MAP_STATUS_KEYS.has(
    report.statusKey || getGroupedMapStatusKey(report.rawReport || report)
  );
}

function toMapReport(report = {}) {
  const reportId = getReportId(report);
  const position = getReportPosition(report);
  const groupedStatusKey = getGroupedMapStatusKey(report);
  const groupedStatusTone = getStatusTone(groupedStatusKey);

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

    statusKey: groupedStatusKey,
    statusLabel: report.statusLabel || 'قيد المراجعة',
    statusTone: groupedStatusTone,

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
    statusKey: report.statusKey,
    statusLabel: report.statusLabel,
    tone: report.statusTone,
    address: report.address,
    position: report.position,
  };
}

function focusStateToMapReport(focusMapReport = {}) {
  const reportId =
    focusMapReport.originalId ||
    focusMapReport.reportId ||
    focusMapReport.markerId;
  const groupedStatusKey = getGroupedMapStatusKey(focusMapReport);
  const groupedStatusTone = getStatusTone(groupedStatusKey);

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
      statusTone: groupedStatusTone,
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
    statusKey: groupedStatusKey,
    statusLabel: focusMapReport.statusLabel || 'قيد المراجعة',
    statusTone: groupedStatusTone,
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
  const navigate = useNavigate();

  const userId = getCurrentUserId(user);
  const mapSectionRef = useRef(null);
  const tableSectionRef = useRef(null);
  const selectedReportCardRef = useRef(null);
  const previousRouteReportIdRef = useRef(null);
  const ignoreReloadSelectionRef = useRef(isImmediatePageReload());
  const reloadLocationKeyRef = useRef(location.key);

  const [pageNumber, setPageNumber] = useState(1);
  const [clientPageNumber, setClientPageNumber] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(REPORT_STATUS_API_VALUES.all);

  const [searchResults, setSearchResults] = useState([]);
  const [statusResults, setStatusResults] = useState([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const [searchErrorMessage, setSearchErrorMessage] = useState('');
  const [statusErrorMessage, setStatusErrorMessage] = useState('');

  const {
    reports,
    pagination,
    reportStats,
    isLoading,
    isStatsLoading,
    errorMessage,
    statsErrorMessage,
  } = useUserReports(userId, {
    pageNumber,
    pageSize: 10,
  });

  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedMapReport, setSelectedMapReport] = useState(null);
  const [detailsMapReport, setDetailsMapReport] = useState(null);
  const [routeReportId, setRouteReportId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directionsPromptReport, setDirectionsPromptReport] = useState(null);
  const [pendingRouteReport, setPendingRouteReport] = useState(null);
  const [showLocationControlHint, setShowLocationControlHint] = useState(false);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const [mapHeight, setMapHeight] = useState(() => {
    if (typeof window === 'undefined') return 560;
    if (window.innerWidth <= 480) return 300;
    if (window.innerWidth <= 640) return 330;
    return 560;
  });
  const [hiddenMapReportIds, setHiddenMapReportIds] = useState(() => new Set());

  const [highlightedReportId, setHighlightedReportId] = useState(() => {
    if (ignoreReloadSelectionRef.current) return null;

    return (
      location.state?.createdReportId ||
      getNavigationReportId(location) ||
      null
    );
  });

  const [notificationFocusReportId, setNotificationFocusReportId] = useState(
    () => {
      if (ignoreReloadSelectionRef.current) return null;

      return isNotificationNavigation(location)
        ? getNavigationReportId(location) || null
        : null;
    }
  );
  const [notificationFocusResults, setNotificationFocusResults] = useState([]);
  const [isNotificationFocusLoading, setIsNotificationFocusLoading] =
    useState(false);
  const [notificationFocusErrorMessage, setNotificationFocusErrorMessage] =
    useState('');

  const successMessage = location.state?.successMessage || '';
  // Do not auto-select any map report when the page opens or reloads.
  const focusMapReport = null;

  const isSearchActive = Boolean(searchQuery.trim());
  const isStatusActive = statusFilter !== REPORT_STATUS_API_VALUES.all;

  useEffect(() => {
    function updateMapHeight() {
      if (window.innerWidth <= 480) {
        setMapHeight(300);
        return;
      }

      if (window.innerWidth <= 640) {
        setMapHeight(330);
        return;
      }

      setMapHeight(560);
    }

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);

    return () => window.removeEventListener('resize', updateMapHeight);
  }, []);

  useEffect(() => {
    if (!isSearchActive) {
      setSearchResults([]);
      setSearchErrorMessage('');
      setIsSearching(false);
      setClientPageNumber(1);
      return undefined;
    }

    let isCanceled = false;

    const timer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchErrorMessage('');

        const results = await searchReports(searchQuery);

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
  }, [isSearchActive, searchQuery, userId]);

  useEffect(() => {
    if (!isStatusActive) {
      setStatusResults([]);
      setStatusErrorMessage('');
      setIsStatusLoading(false);
      setClientPageNumber(1);
      return undefined;
    }

    let isCanceled = false;

    async function loadReportsByStatus() {
      try {
        setIsStatusLoading(true);
        setStatusErrorMessage('');

        const results = await getReportsByStatus(statusFilter);

        if (isCanceled) return;

        const userOnlyResults = results.filter((report) =>
          isReportOwnedByUser(report, userId)
        );

        setStatusResults(userOnlyResults);
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

    loadReportsByStatus();

    return () => {
      isCanceled = true;
    };
  }, [isStatusActive, statusFilter, userId]);

  useEffect(() => {
    const nextNavigationReportId = getNavigationReportId(location);
    const nextNotificationReportId = isNotificationNavigation(location)
      ? nextNavigationReportId || null
      : null;

    const nextHighlightedReportId =
      location.state?.createdReportId ||
      nextNotificationReportId ||
      nextNavigationReportId ||
      null;

    // A browser refresh preserves React Router's history state. Ignore that
    // persisted id on the refreshed page so no table row is selected by itself.
    if (
      ignoreReloadSelectionRef.current &&
      location.key === reloadLocationKeyRef.current
    ) {
      return;
    }

    // Navigation state is transient. Only apply it when it actually contains
    // a report id; after it is consumed, replacing the history entry must not
    // clear the active highlight during the current visit.
    if (!nextHighlightedReportId) return;

    setHighlightedReportId(nextHighlightedReportId);
    setNotificationFocusReportId(nextNotificationReportId);
  }, [location.key, location.search, location.state]);

  useEffect(() => {
    const currentState = location.state || {};
    const searchParams = new URLSearchParams(location.search || '');

    const transientStateKeys = [
      'createdReportId',
      'notificationReportId',
      'selectedReportId',
      'highlightReportId',
      'reportId',
      'fromNotification',
      'fromNotifications',
    ];

    const hasTransientState = transientStateKeys.some(
      (key) => currentState[key] !== undefined
    );
    const hasNotificationSource = currentState.source === 'notification';
    const hasTransientSearch =
      searchParams.has('reportId') ||
      searchParams.get('source') === 'notification';

    if (!hasTransientState && !hasNotificationSource && !hasTransientSearch) {
      return;
    }

    const nextState = { ...currentState };
    transientStateKeys.forEach((key) => delete nextState[key]);

    if (nextState.source === 'notification') {
      delete nextState.source;
    }

    searchParams.delete('reportId');
    if (searchParams.get('source') === 'notification') {
      searchParams.delete('source');
    }

    const nextSearch = searchParams.toString();

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
        hash: location.hash,
      },
      {
        replace: true,
        state: Object.keys(nextState).length ? nextState : null,
      }
    );
  }, [
    location.hash,
    location.pathname,
    location.search,
    location.state,
    navigate,
  ]);

  useEffect(() => {
    if (!notificationFocusReportId) {
      setNotificationFocusResults([]);
      setNotificationFocusErrorMessage('');
      setIsNotificationFocusLoading(false);
      return undefined;
    }

    let isCanceled = false;

    async function loadNotificationReport() {
      try {
        setIsNotificationFocusLoading(true);
        setNotificationFocusErrorMessage('');
        setSearchQuery('');
        setStatusFilter(REPORT_STATUS_API_VALUES.all);
        setSearchResults([]);
        setStatusResults([]);
        setClientPageNumber(1);
        clearMapSelection();

        const locatedReport = await findUserReportPage({
          userId,
          reportId: notificationFocusReportId,
          pageSize: 10,
        });

        if (isCanceled) return;

        if (!locatedReport) {
          setNotificationFocusResults([]);
          setNotificationFocusErrorMessage(
            'لم يتم العثور على البلاغ المرتبط بالإشعار داخل بلاغاتك.'
          );
          return;
        }

        setHighlightedReportId(notificationFocusReportId);
        setPageNumber(locatedReport.pageNumber);
        setNotificationFocusResults([]);
        setNotificationFocusReportId(null);
      } catch (error) {
        if (isCanceled) return;

        setNotificationFocusResults([]);
        setNotificationFocusErrorMessage(
          error?.message || 'تعذر تحميل البلاغ المرتبط بالإشعار حاليًا.'
        );
      } finally {
        if (!isCanceled) {
          setIsNotificationFocusLoading(false);
        }
      }
    }

    loadNotificationReport();

    return () => {
      isCanceled = true;
    };
  }, [notificationFocusReportId, userId]);

  useEffect(() => {
    if (!highlightedReportId) return undefined;

    const timer = window.setTimeout(() => {
      scrollToReportRow(highlightedReportId);
    }, 160);

    return () => window.clearTimeout(timer);
  }, [
    highlightedReportId,
    reports,
    searchResults,
    statusResults,
    notificationFocusResults,
    clientPageNumber,
  ]);

  const isNotificationFocusActive = Boolean(notificationFocusReportId);

  const sourceReports = useMemo(() => {
    if (isNotificationFocusActive) {
      return notificationFocusResults;
    }

    if (isSearchActive) {
      return searchResults;
    }

    if (isStatusActive) {
      return statusResults;
    }

    return reports;
  }, [
    isNotificationFocusActive,
    notificationFocusResults,
    isSearchActive,
    searchResults,
    isStatusActive,
    statusResults,
    reports,
  ]);

  const pageSize = pagination.pageSize || 10;

  const clientPagination = useMemo(() => {
    return getClientPagination(sourceReports, clientPageNumber, pageSize);
  }, [sourceReports, clientPageNumber, pageSize]);

  const displayedReports = useMemo(() => {
    if (isNotificationFocusActive || (!isSearchActive && !isStatusActive)) {
      return sourceReports;
    }

    return paginateItems(
      sourceReports,
      clientPagination.pageNumber,
      clientPagination.pageSize
    );
  }, [
    sourceReports,
    isNotificationFocusActive,
    isSearchActive,
    isStatusActive,
    clientPagination,
  ]);

  const tablePagination =
    isNotificationFocusActive || isSearchActive || isStatusActive
      ? clientPagination
      : pagination;

  const allMapReports = useMemo(() => {
    const reportsForMap = displayedReports
      .map(toMapReport)
      .filter((report) => report.position?.lat && report.position?.lng);

    if (
      focusMapReport?.markerId &&
      focusMapReport?.position?.lat &&
      focusMapReport?.position?.lng &&
      !reportsForMap.some((report) => report.id === focusMapReport.markerId)
    ) {
      reportsForMap.unshift(focusStateToMapReport(focusMapReport));
    }

    return reportsForMap;
  }, [displayedReports, focusMapReport]);

  const mapReports = useMemo(() => {
    return allMapReports.filter(
      (report) => !hiddenMapReportIds.has(String(report.id))
    );
  }, [allMapReports, hiddenMapReportIds]);

  const hiddenMapReports = useMemo(() => {
    return allMapReports.filter((report) =>
      hiddenMapReportIds.has(String(report.id))
    );
  }, [allMapReports, hiddenMapReportIds]);

  const mapMarkers = useMemo(() => {
    return mapReports.map(toMapMarker);
  }, [mapReports]);

  const routeDestination = useMemo(() => {
    return mapReports.find((report) => report.id === routeReportId) || null;
  }, [mapReports, routeReportId]);

  useEffect(() => {
    const previousRouteReportId = previousRouteReportIdRef.current;

    if (previousRouteReportId && !routeReportId) {
      // Recreate the map after ending a route so no invisible routing layer
      // remains above the report markers and intercepts their clicks.
      setMapRenderKey((currentKey) => currentKey + 1);
    }

    previousRouteReportIdRef.current = routeReportId;
  }, [routeReportId]);

  useEffect(() => {
    const markerId = focusMapReport?.markerId;

    if (!markerId) return;

    setHiddenMapReportIds((currentIds) => {
      if (!currentIds.has(String(markerId))) return currentIds;

      const nextIds = new Set(currentIds);
      nextIds.delete(String(markerId));
      return nextIds;
    });
  }, [focusMapReport]);

  useEffect(() => {
    if (!focusMapReport?.markerId) return undefined;

    const report = mapReports.find(
      (item) => item.id === focusMapReport.markerId
    );

    if (!report) return undefined;

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


  useEffect(() => {
    if (!detailsMapReport) return undefined;

    const showDetailsReportOnMap = () => {
      const report = detailsMapReport;

      setHiddenMapReportIds((currentIds) => {
        if (!currentIds.has(String(report.id))) return currentIds;

        const nextIds = new Set(currentIds);
        nextIds.delete(String(report.id));
        return nextIds;
      });

      setRouteReportId(null);
      setActiveMarkerId(report.id);
      setSelectedMapReport(report);
      setDetailsMapReport(null);

      window.setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 120);
    };

    const prepareDetailsModalActions = () => {
      document.querySelectorAll('[role="dialog"]').forEach((dialog) => {
        const actionElements = Array.from(dialog.querySelectorAll('button, a'));
        const routeButton = actionElements.find((element) => {
          const buttonText = String(element.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();

          return buttonText.includes('أقصر مسافة');
        });
        const reportPageButton = actionElements.find((element) => {
          const buttonText = String(element.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();

          return buttonText === 'صفحة البلاغ';
        });

        if (!routeButton && !reportPageButton) return;

        if (reportPageButton) {
          reportPageButton.style.display = 'none';
          reportPageButton.setAttribute('aria-hidden', 'true');
        }

        if (dialog.querySelector('[data-details-map-button="true"]')) return;

        const actionsContainer = routeButton?.parentElement || reportPageButton?.parentElement;
        if (!actionsContainer) return;

        const mapButton = document.createElement('button');
        mapButton.type = 'button';
        mapButton.dataset.detailsMapButton = 'true';
        mapButton.className = `${routeButton?.className || ''} user-reports-details-map-button`.trim();
        mapButton.setAttribute('aria-label', 'عرض المشكلة على الخريطة');
        mapButton.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path>
            <circle cx="12" cy="10" r="2.5"></circle>
          </svg>
          <span>عرض المشكلة على الخريطة</span>
        `;
        mapButton.addEventListener('click', showDetailsReportOnMap);

        actionsContainer.appendChild(mapButton);
      });
    };

    const frameId = window.requestAnimationFrame(prepareDetailsModalActions);
    const observer = new MutationObserver(prepareDetailsModalActions);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      document
        .querySelectorAll('[data-details-map-button="true"]')
        .forEach((button) => {
          button.removeEventListener('click', showDetailsReportOnMap);
          button.remove();
        });
    };
  }, [detailsMapReport]);

  const emptyMessage =
    isLoading ||
    isSearching ||
    isStatusLoading ||
    isNotificationFocusLoading
      ? 'جاري تحميل البلاغات...'
      : isNotificationFocusActive
        ? notificationFocusErrorMessage ||
          'لا توجد بيانات للبلاغ المرتبط بالإشعار.'
        : isSearchActive
          ? 'لا توجد بلاغات مطابقة لعملية البحث.'
          : isStatusActive
            ? 'لا توجد بلاغات مطابقة للحالة المختارة.'
            : 'لم تقم بإضافة أي بلاغ حتى الآن.';

  function getReportRowElement(reportId) {
    const rows = tableSectionRef.current?.querySelectorAll(
      '[data-report-row-id]'
    );

    return (
      Array.from(rows || []).find(
        (row) => String(row.dataset.reportRowId) === String(reportId)
      ) || null
    );
  }

  function scrollToReportRow(reportId, attempt = 0) {
    if (!reportId) return;

    const row = getReportRowElement(reportId);

    if (row) {
      row.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      return;
    }

    if (attempt < 8) {
      window.setTimeout(() => scrollToReportRow(reportId, attempt + 1), 90);
    }
  }

  function resetRouteInteraction({ forceMapReset = false } = {}) {
    const routeWasActive = Boolean(routeReportId);

    setRouteReportId(null);
    setPendingRouteReport(null);
    setDirectionsPromptReport(null);
    setShowLocationControlHint(false);

    // Ending an active route is handled by the routeReportId effect above.
    // Pending-location mode has no route id, so it needs an immediate reset.
    if (forceMapReset && !routeWasActive) {
      setMapRenderKey((currentKey) => currentKey + 1);
    }
  }

  function clearMapSelection() {
    setActiveMarkerId(null);
    setSelectedMapReport(null);
    setDetailsMapReport(null);
    setHighlightedReportId(null);
    resetRouteInteraction();
  }

  function handleCloseDetailsModal() {
    setDetailsMapReport(null);

    if (routeReportId || pendingRouteReport || showLocationControlHint) {
      resetRouteInteraction({ forceMapReset: true });
    }
  }

  function clearNotificationFocus() {
    setNotificationFocusReportId(null);
    setNotificationFocusResults([]);
    setNotificationFocusErrorMessage('');
    setIsNotificationFocusLoading(false);
  }

  function handleSearchChange(value) {
    clearNotificationFocus();
    setSearchQuery(value);
    setStatusFilter(REPORT_STATUS_API_VALUES.all);
    setStatusResults([]);
    setStatusErrorMessage('');
    setClientPageNumber(1);
    clearMapSelection();
  }

  function handleStatusFilterChange(value) {
    clearNotificationFocus();
    setStatusFilter(value);
    setSearchQuery('');
    setSearchResults([]);
    setSearchErrorMessage('');
    setClientPageNumber(1);
    clearMapSelection();
  }

  function handleResetFilters() {
    clearNotificationFocus();
    setSearchQuery('');
    setStatusFilter(REPORT_STATUS_API_VALUES.all);
    setSearchResults([]);
    setStatusResults([]);
    setSearchErrorMessage('');
    setStatusErrorMessage('');
    setClientPageNumber(1);
    setPageNumber(1);
    setHiddenMapReportIds(new Set());
    clearMapSelection();
  }

  function handlePageChange(nextPageNumber) {
    clearNotificationFocus();
    clearMapSelection();

    if (isSearchActive || isStatusActive) {
      setClientPageNumber(nextPageNumber);
      return;
    }

    setPageNumber(nextPageNumber);
  }

  function hideMapReport(report) {
    if (!report?.id || !canToggleMapReportVisibility(report)) return;

    const reportId = String(report.id);

    setHiddenMapReportIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(reportId);
      return nextIds;
    });

    if (String(activeMarkerId) === reportId) {
      setActiveMarkerId(null);
    }

    if (String(routeReportId) === reportId) {
      setRouteReportId(null);
    }

    if (String(selectedMapReport?.id) === reportId) {
      setSelectedMapReport(null);
      setHighlightedReportId(null);
    }

    if (String(detailsMapReport?.id) === reportId) {
      setDetailsMapReport(null);
    }
  }

  function showMapReport(report) {
    if (!report?.id) return;

    const reportId = String(report.id);
    setHighlightedReportId(null);

    setHiddenMapReportIds((currentIds) => {
      if (!currentIds.has(reportId)) return currentIds;

      const nextIds = new Set(currentIds);
      nextIds.delete(reportId);
      return nextIds;
    });

    window.setTimeout(() => {
      setRouteReportId(null);
      setActiveMarkerId(report.id);
      setSelectedMapReport(report);
    }, 0);
  }

  function showAllHiddenMapReports() {
    setHiddenMapReportIds(new Set());
  }

  function handleMarkerSelect(marker) {
    if (!marker?.id) return;

    setHighlightedReportId(null);

    const report = mapReports.find(
      (item) =>
        String(item.id) === String(marker.id) ||
        String(item.id) === String(marker.reportId)
    );

    const isChangingReport =
      !selectedMapReport || String(selectedMapReport.id) !== String(report?.id);

    if (routeReportId || pendingRouteReport || showLocationControlHint) {
      resetRouteInteraction({ forceMapReset: isChangingReport });
    } else {
      setRouteReportId(null);
    }

    setActiveMarkerId(marker.id);
    setSelectedMapReport(report || null);
  }

  function handleRequestDirections(report) {
    if (!report?.id) return;

    setDirectionsPromptReport(report);
  }

  function closeDirectionsPrompt() {
    setDirectionsPromptReport(null);
  }

  function showRouteOnMap(report, locationPoint) {
    if (!report?.id || !locationPoint?.lat || !locationPoint?.lng) return;

    setCurrentLocation(locationPoint);
    setSelectedMapReport(report);
    setActiveMarkerId(report.id);
    setRouteReportId(report.id);
    setDetailsMapReport(null);
    setDirectionsPromptReport(null);
    setPendingRouteReport(null);
    setShowLocationControlHint(false);

    window.setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);
  }

  function handleGoToMapForLocation() {
    const report = directionsPromptReport;
    if (!report?.id) return;

    setDetailsMapReport(null);
    setDirectionsPromptReport(null);
    setSelectedMapReport(report);
    setActiveMarkerId(report.id);
    setRouteReportId(null);

    if (
      Number.isFinite(Number(currentLocation?.lat)) &&
      Number.isFinite(Number(currentLocation?.lng))
    ) {
      showRouteOnMap(report, {
        lat: Number(currentLocation.lat),
        lng: Number(currentLocation.lng),
      });
      return;
    }

    setPendingRouteReport(report);
    setShowLocationControlHint(true);

    window.setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }

  function handleCurrentLocationChange(locationPoint) {
    const normalizedLocation = {
      lat: Number(locationPoint?.lat),
      lng: Number(locationPoint?.lng),
    };

    if (
      !Number.isFinite(normalizedLocation.lat) ||
      !Number.isFinite(normalizedLocation.lng)
    ) {
      return;
    }

    setCurrentLocation(normalizedLocation);

    if (pendingRouteReport?.id) {
      showRouteOnMap(pendingRouteReport, normalizedLocation);
    }
  }


  function handleGoToReport(report) {
    if (!report) return;

    const reportId = report.originalId || getReportId(report.rawReport);
    if (!reportId) return;

    setHighlightedReportId(reportId);

    window.requestAnimationFrame(() => {
      scrollToReportRow(reportId);
    });
  }


  function renderPopupContent(marker) {
    const report = mapReports.find(
      (item) => String(item.id) === String(marker.id)
    );

    if (!report) return null;

    return (
      <div className="user-reports-map-popup">
        <strong>{report.title}</strong>

        <div className="user-reports-map-popup__meta">
          <span>{report.typeLabel}</span>
          <span
            className={`user-reports-map-popup__status user-reports-map-popup__status--${report.statusTone}`}
          >
            {report.statusLabel}
          </span>
        </div>

        <small>
          <FiMapPin />
          {report.area || report.address || 'لم يتم تحديد الموقع'}
        </small>

        <div className="user-reports-map-popup__actions">
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

          {canToggleMapReportVisibility(report) ? (
            <button
              type="button"
              className="user-reports-map-popup__visibility-btn"
              onClick={() => hideMapReport(report)}
            >
              <FiEyeOff />
              إخفاء من الخريطة
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page user-reports-layout user-reports-page">
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

      {statsErrorMessage ? (
        <div className="user-reports__success-banner user-reports__success-banner--error">
          {statsErrorMessage}
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

      {notificationFocusErrorMessage ? (
        <div className="user-reports__success-banner user-reports__success-banner--error">
          {notificationFocusErrorMessage}
        </div>
      ) : null}

      <UserReportsStats stats={reportStats} isLoading={isStatsLoading} />

      <UserReportsFilters
        totalReports={tablePagination.totalCount}
        filteredCount={displayedReports.length}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        statusOptions={REPORT_STATUS_FILTER_OPTIONS}
        onReset={handleResetFilters}
        isSearching={isLoading || isSearching || isStatusLoading}
      />

      <section ref={mapSectionRef} className="user-reports-map-card">
        <header className="user-reports-map-card__header">
          <div>
            <h2>خريطة بلاغاتي</h2>
            <p>
              الخريطة تعرض بلاغاتك حسب البحث أو الفلترة، وكل مجموعة حالات لها لون واضح وثابت.
            </p>
          </div>

          <div className="user-reports-map-card__actions">
            <span className="dashboard-chip">
              {mapMarkers.length} من {allMapReports.length} بلاغ على الخريطة
            </span>
            <UserReportsMapLegend />
          </div>
        </header>

        {hiddenMapReports.length ? (
          <div className="user-reports-map-hidden-panel" dir="rtl">
            <div className="user-reports-map-hidden-panel__header">
              <div>
                <strong>
                  <FiEyeOff />
                  بلاغات مخفية مؤقتًا ({hiddenMapReports.length})
                </strong>
                <span>
                  يمكنك إظهار أي بلاغ مرة أخرى بدون تغيير حالة البلاغ أو بياناته.
                </span>
              </div>

              <button type="button" onClick={showAllHiddenMapReports}>
                <FiEye />
                إظهار الكل
              </button>
            </div>

            <div className="user-reports-map-hidden-panel__list">
              {hiddenMapReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => showMapReport(report)}
                  title={`إظهار ${report.title} على الخريطة`}
                >
                  <FiEye />
                  <span>{report.title}</span>
                  <small>{report.statusLabel}</small>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div
          className={`user-reports-map-wrapper ${
            showLocationControlHint ? 'is-awaiting-current-location' : ''
          }`}
        >
          {showLocationControlHint ? (
            <div className="user-reports-current-location-guide" dir="rtl">
              <span className="user-reports-current-location-guide__icon" aria-hidden="true">
                <FiMapPin />
              </span>
              <div>
                <strong>اضغط زر موقعك الحالي</strong>
                <p>
                  استخدم الأيقونة الدائرية الموجودة أعلى يسار الخريطة، وبعد تحديد
                  موقعك سيظهر أقصر مسار تلقائيًا.
                </p>
              </div>
            </div>
          ) : null}

          <ReportsMap
            key={`my-reports-map-${mapRenderKey}`}
            markers={mapMarkers}
            userLocation={currentLocation || user?.location}
            activeMarkerId={activeMarkerId}
            onMarkerSelect={handleMarkerSelect}
            onCurrentLocationChange={handleCurrentLocationChange}
            routeDestination={routeDestination}
            height={mapHeight}
            renderPopupContent={renderPopupContent}
          />

          {!mapMarkers.length ? (
            <div className="user-reports-map-empty" dir="rtl">
              <strong>
                {hiddenMapReports.length
                  ? 'كل البلاغات المتاحة مخفية مؤقتًا'
                  : 'لا توجد بلاغات متاحة على الخريطة'}
              </strong>
              <span>
                {hiddenMapReports.length
                  ? 'استخدم قائمة البلاغات المخفية أعلى الخريطة لإظهارها مرة أخرى.'
                  : 'قد تكون النتائج بدون إحداثيات، أو لا توجد بلاغات مطابقة للبحث أو الفلترة.'}
              </span>
            </div>
          ) : null}

          <div
            ref={selectedReportCardRef}
            className="user-reports-selected-report-card-slot"
          >
            <UserMapSelectedReportCard
              report={selectedMapReport}
              onClose={clearMapSelection}
              onOpenDetails={setDetailsMapReport}
              onGoToReport={handleGoToReport}
              onRequestDirections={handleRequestDirections}
            />

            {selectedMapReport && canToggleMapReportVisibility(selectedMapReport) ? (
              <div className="user-reports-map-visibility-control" dir="rtl">
                <div>
                  <strong>ظهور البلاغ على الخريطة</strong>
                  <span>
                    يمكن إخفاء البلاغات التي تم حلها أو رفضها أو تعذر تنفيذها لتقليل الزحام.
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked="true"
                  onClick={() => hideMapReport(selectedMapReport)}
                >
                  <span aria-hidden="true" />
                  ظاهر الآن
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="user-reports-map-pagination-wrap">
          <ReportsPaginationControls
            pagination={tablePagination}
            onPageChange={handlePageChange}
            isLoading={
            isLoading ||
            isSearching ||
            isStatusLoading ||
            isNotificationFocusLoading
          }
          />
        </div>
      </section>

      <div ref={tableSectionRef} className="user-reports-table-section">
        <DashboardSectionCard
          title={
            isNotificationFocusActive
              ? 'البلاغ المرتبط بالإشعار'
              : isSearchActive
                ? 'نتائج البحث'
                : isStatusActive
                  ? 'نتائج الفلترة'
                  : 'جدول البلاغات'
          }
          subtitle={
            isNotificationFocusActive
              ? 'Notification Report'
              : isSearchActive
                ? 'Search Results'
                : isStatusActive
                  ? 'Filter Results'
                  : 'My Reports Table'
          }
        >
          <RecentReportsTable
            reports={displayedReports}
            highlightedReportId={highlightedReportId}
            emptyMessage={emptyMessage}
            pagination={tablePagination}
            onPageChange={handlePageChange}
            isLoading={
              isLoading ||
              isSearching ||
              isStatusLoading ||
              isNotificationFocusLoading
            }
          />
        </DashboardSectionCard>
      </div>

      {detailsMapReport
        ? createPortal(
            <UserReportDetailsModal
              report={detailsMapReport}
              onClose={handleCloseDetailsModal}
              onRequestDirections={handleRequestDirections}
            />,
            document.body
          )
        : null}

      {directionsPromptReport
        ? createPortal(
            <div
              className="user-reports-location-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-reports-location-modal-title"
              dir="rtl"
            >
              <button
                type="button"
                className="user-reports-location-modal__backdrop"
                onClick={closeDirectionsPrompt}
                aria-label="إغلاق نافذة تفعيل الموقع"
              />

              <section className="user-reports-location-modal__panel">
                <span className="user-reports-location-modal__icon" aria-hidden="true">
                  <FiMapPin />
                </span>

                <div className="user-reports-location-modal__content">
                  <strong id="user-reports-location-modal-title">
                    فعّل موقعك من الخريطة لعرض أقصر مسافة
                  </strong>
                  <p>
                    لحساب أقصر مسار إلى البلاغ
                    <b> {directionsPromptReport.title}</b>، انتقل إلى الخريطة ثم
                    اضغط زر موقعك الحالي الموجود أعلى يسارها.
                  </p>
                </div>

                <div className="user-reports-location-modal__control-guide">
                  <span aria-hidden="true">
                    <FiMapPin />
                  </span>
                  <div>
                    <strong>كيف ستتعرف على الزر؟</strong>
                    <p>
                      هو الزر الدائري الذي يحتوي على أيقونة تحديد الموقع بجوار
                      أدوات التكبير والتصغير. سنوضحه لك فوق الخريطة.
                    </p>
                  </div>
                </div>

                <div className="user-reports-location-modal__actions">
                  <button
                    type="button"
                    className="user-reports-location-modal__confirm"
                    onClick={handleGoToMapForLocation}
                  >
                    <FiMapPin />
                    الذهاب للخريطة وتفعيل الموقع
                  </button>

                  <button
                    type="button"
                    className="user-reports-location-modal__cancel"
                    onClick={closeDirectionsPrompt}
                  >
                    إلغاء
                  </button>
                </div>
              </section>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default MyReportsPage;