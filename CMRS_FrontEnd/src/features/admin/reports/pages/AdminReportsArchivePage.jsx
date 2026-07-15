import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiArchive,
  FiCheckCircle,
  FiEye,
  FiMapPin,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import ReportsMap from '../../../map/components/ReportsMap';
import {
  getArchivedAdminReportFilterOptions,
  getArchivedAdminReports,
} from '../api/adminReportsApi';
import AdminReportsTable from '../components/AdminReportsTable';
import AdminReportsToolbar from '../components/AdminReportsToolbar';
import '../admin-reports.css';

const DEFAULT_FILTER_OPTIONS = {
  statuses: [
    { value: 'all', label: 'كل الحالات' },
    { value: 'Resolved', label: 'تم الحل' },
    { value: 'UnableToExecute', label: 'متعذر التنفيذ' },
    { value: 'Rejected', label: 'مرفوض' },
  ],
  priorities: [{ value: 'all', label: 'كل الأولويات' }],
  issueCategories: [{ value: 'all', label: 'كل التصنيفات' }],
};

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'الأحدث أولاً' },
  { value: 'createdAt-asc', label: 'الأقدم أولاً' },
  { value: 'priority-desc', label: 'الأولوية الأعلى' },
];

function getSortParams(sortValue) {
  const [sortBy, sortDirection] = String(sortValue || 'createdAt-desc').split('-');

  return { sortBy, sortDirection };
}

function hasValidPosition(report) {
  const lat = Number(report?.position?.lat);
  const lng = Number(report?.position?.lng);

  return Number.isFinite(lat) && Number.isFinite(lng);
}

function normalizeStatus(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function getArchiveMarkerTone(report) {
  const status = normalizeStatus(
    `${report?.statusValue || ''} ${report?.statusLabel || ''} ${report?.status || ''}`,
  );

  if (status.includes('resolved') || status.includes('تمالحل')) {
    return 'success';
  }

  if (
    status.includes('unabletoexecute') ||
    status.includes('cannotexecute') ||
    status.includes('متعذرالتنفيذ')
  ) {
    return 'dark';
  }

  if (status.includes('rejected') || status.includes('مرفوض')) {
    return 'danger';
  }

  return report?.statusTone || 'info';
}

function buildArchiveMapMarker(report) {
  return {
    id: `admin-archive-report-${report.id}`,
    reportId: report.id,
    title: report.type,
    subtitle: report.location,
    area: report.location,
    statusLabel: report.statusLabel || report.status,
    tone: getArchiveMarkerTone(report),
    address: report.location,
    position: {
      lat: Number(report.position.lat),
      lng: Number(report.position.lng),
    },
  };
}

function countReportsByStatus(reports, acceptedStatuses) {
  return reports.filter((report) => {
    const status = normalizeStatus(
      `${report.statusValue || ''} ${report.statusLabel || ''} ${report.status || ''}`,
    );
    return acceptedStatuses.some((acceptedStatus) => status.includes(acceptedStatus));
  }).length;
}

function getSummaryValue(summary, keys, fallbackValue = 0) {
  for (const key of keys) {
    if (summary?.[key] !== undefined && summary?.[key] !== null) {
      return summary[key];
    }
  }

  return fallbackValue;
}

function AdminReportsArchivePage() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [issueCategoryFilter, setIssueCategoryFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('createdAt-desc');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getArchivedAdminReportFilterOptions()
      .then((data) => {
        if (isMounted) {
          setFilterOptions(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFilterOptions(DEFAULT_FILTER_OPTIONS);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPageNumber(1);
  }, [
    searchTerm,
    statusFilter,
    priorityFilter,
    issueCategoryFilter,
    sortFilter,
  ]);

  useEffect(() => {
    let isMounted = true;
    const sortParams = getSortParams(sortFilter);

    setIsLoading(true);
    setErrorMessage('');

    getArchivedAdminReports({
      pageNumber,
      pageSize,
      search: searchTerm.trim(),
      status: statusFilter,
      priority: priorityFilter,
      issueCategoryId: issueCategoryFilter,
      sortBy: sortParams.sortBy,
      sortDirection: sortParams.sortDirection,
    })
      .then((payload) => {
        if (!isMounted) return;

        setReports(payload.items);
        setSummary(payload.summary);
        setTotalPages(payload.totalPages || 1);
        setTotalCount(payload.totalCount || 0);
      })
      .catch((error) => {
        if (!isMounted) return;

        setReports([]);
        setSummary(null);
        setTotalPages(1);
        setTotalCount(0);
        setErrorMessage(
          error?.response?.data?.message ||
            'تعذر تحميل البلاغات المؤرشفة من الخادم. برجاء المحاولة مرة أخرى.',
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    issueCategoryFilter,
    pageNumber,
    pageSize,
    priorityFilter,
    searchTerm,
    sortFilter,
    statusFilter,
  ]);

  const mapReports = useMemo(() => reports.filter(hasValidPosition), [reports]);
  const mapMarkers = useMemo(
    () => mapReports.map(buildArchiveMapMarker),
    [mapReports],
  );

  useEffect(() => {
    if (!selectedReport) return;

    const selectedReportStillVisible = mapReports.some(
      (report) => String(report.id) === String(selectedReport.id),
    );

    if (!selectedReportStillVisible) {
      setSelectedReport(null);
      setActiveMarkerId(null);
    }
  }, [mapReports, selectedReport]);

  const activeFiltersCount = useMemo(() => {
    const dropdownFilters = [
      statusFilter,
      priorityFilter,
      issueCategoryFilter,
    ].filter((value) => value && value !== 'all').length;

    const hasSearch = searchTerm.trim() ? 1 : 0;
    const hasCustomSort = sortFilter !== 'createdAt-desc' ? 1 : 0;

    return dropdownFilters + hasSearch + hasCustomSort;
  }, [
    issueCategoryFilter,
    priorityFilter,
    searchTerm,
    sortFilter,
    statusFilter,
  ]);

  const summaryCards = useMemo(() => {
    const resolvedFallback = countReportsByStatus(reports, ['resolved', 'تمالحل']);
    const unableFallback = countReportsByStatus(reports, [
      'unabletoexecute',
      'cannotexecute',
      'متعذرالتنفيذ',
    ]);
    const rejectedFallback = countReportsByStatus(reports, ['rejected', 'مرفوض']);

    return [
      {
        id: 'totalReports',
        label: 'إجمالي الأرشيف',
        value: totalCount,
        icon: FiArchive,
        tone: 'primary',
      },
      {
        id: 'resolvedCount',
        label: 'تم الحل',
        value: getSummaryValue(summary, ['resolvedCount'], resolvedFallback),
        icon: FiCheckCircle,
        tone: 'success',
      },
      {
        id: 'unableToExecuteCount',
        label: 'متعذر التنفيذ',
        value: getSummaryValue(
          summary,
          ['unableToExecuteCount', 'unableCount', 'cannotExecuteCount'],
          unableFallback,
        ),
        icon: FiAlertTriangle,
        tone: 'warning',
      },
      {
        id: 'rejectedCount',
        label: 'مرفوض',
        value: getSummaryValue(summary, ['rejectedCount'], rejectedFallback),
        icon: FiXCircle,
        tone: 'danger',
      },
    ];
  }, [reports, summary, totalCount]);

  function handleClearFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setIssueCategoryFilter('all');
    setSortFilter('createdAt-desc');
    setPageNumber(1);
    setSelectedReport(null);
    setActiveMarkerId(null);
  }

  function handleMarkerSelect(marker) {
    const reportId =
      marker?.reportId ||
      String(marker?.id || '').replace('admin-archive-report-', '');
    const report = mapReports.find(
      (item) => String(item.id) === String(reportId),
    );

    setActiveMarkerId(marker?.id || `admin-archive-report-${reportId}`);
    setSelectedReport(report || null);
  }

  return (
    <div className="dashboard-page admin-manage-reports-page admin-reports-archive-page">
      <PageHeader
        title="أرشيف البلاغات"
        subtitle="Reports Archive - البلاغات النهائية التي تمت أرشفتها بواسطة الأدمن"
      />

      <section className="admin-reports-stats-grid" aria-label="ملخص أرشيف البلاغات">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.id}
              className={`admin-report-stat-card admin-report-stat-card--${card.tone}`}
            >
              <div className="admin-report-stat-card__icon" aria-hidden="true">
                <Icon />
              </div>

              <div className="admin-report-stat-card__content">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            </article>
          );
        })}
      </section>

      <AdminReportsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        issueCategoryFilter={issueCategoryFilter}
        onIssueCategoryChange={setIssueCategoryFilter}
        sortFilter={sortFilter}
        onSortChange={setSortFilter}
        statusOptions={filterOptions.statuses}
        priorityOptions={filterOptions.priorities}
        issueCategoryOptions={filterOptions.issueCategories}
        sortOptions={SORT_OPTIONS}
        totalCount={totalCount}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
        title="فلترة أرشيف البلاغات"
        mobileTitle="فلاتر أرشيف البلاغات"
        mobileDescription="اختار الفلاتر المناسبة لعرض البلاغات المؤرشفة."
        searchPlaceholder="ابحث في البلاغات المؤرشفة بالعنوان أو الوصف أو الشركة..."
        ariaLabel="فلاتر أرشيف البلاغات"
      />

      <section className="admin-archive-map-card">
        <header className="admin-archive-map-card__header">
          <div>
            <h2>خريطة البلاغات المؤرشفة</h2>
            <p>
              تعرض الخريطة البلاغات الموجودة في الصفحة الحالية ولديها إحداثيات
              صالحة. اضغط على أي علامة لعرض ملخص البلاغ.
            </p>

            <div className="admin-archive-map-legend" aria-label="دليل ألوان حالات البلاغات على الخريطة">
              <span className="admin-archive-map-legend__item admin-archive-map-legend__item--success">
                <span className="admin-archive-map-legend__dot" aria-hidden="true" />
                <span>تم الحل</span>
              </span>

              <span className="admin-archive-map-legend__item admin-archive-map-legend__item--dark">
                <span className="admin-archive-map-legend__dot" aria-hidden="true" />
                <span>متعذر التنفيذ</span>
              </span>

              <span className="admin-archive-map-legend__item admin-archive-map-legend__item--danger">
                <span className="admin-archive-map-legend__dot" aria-hidden="true" />
                <span>مرفوض</span>
              </span>
            </div>
          </div>

          <span className="admin-archive-map-card__count">
            {mapReports.length} بلاغ على الخريطة
          </span>
        </header>

        <div className="admin-archive-map-card__body">
          <ReportsMap
            markers={mapMarkers}
            activeMarkerId={activeMarkerId}
            onMarkerSelect={handleMarkerSelect}
            height={430}
            showCurrentLocationControl={false}
          />

          {!isLoading && !mapMarkers.length ? (
            <div className="admin-archive-map-empty">
              لا توجد بلاغات في الصفحة الحالية بإحداثيات صالحة للعرض على الخريطة.
            </div>
          ) : null}

          {selectedReport ? (
            <article className="admin-archive-map-selected-card">
              <button
                type="button"
                className="admin-archive-map-selected-card__close"
                onClick={() => {
                  setSelectedReport(null);
                  setActiveMarkerId(null);
                }}
                aria-label="إغلاق ملخص البلاغ"
              >
                <FiX />
              </button>

              <div className="admin-archive-map-selected-card__header">
                <span
                  className={`admin-report-status admin-report-status--${selectedReport.statusTone}`}
                >
                  {selectedReport.status}
                </span>
                <strong>{selectedReport.type}</strong>
              </div>

              <p>{selectedReport.title || selectedReport.description}</p>

              <div className="admin-archive-map-selected-card__location">
                <FiMapPin />
                <span>{selectedReport.location}</span>
              </div>

              <Link
                to={`${ROUTES.ADMIN_ARCHIVED_REPORTS}/${selectedReport.id}`}
                className="admin-archive-map-selected-card__action"
              >
                <FiEye />
                عرض التفاصيل
              </Link>
            </article>
          ) : null}
        </div>
      </section>

      <DashboardSectionCard
        title="البلاغات المؤرشفة"
        subtitle="Archived Reports"
        className="admin-manage-reports-card admin-manage-reports-table-card"
      >
        {errorMessage ? (
          <p className="admin-reports-error-state">{errorMessage}</p>
        ) : null}

        {isLoading ? (
          <p className="admin-reports-loading-state">جاري تحميل أرشيف البلاغات...</p>
        ) : (
          <AdminReportsTable
            reports={reports}
            detailsBasePath={ROUTES.ADMIN_ARCHIVED_REPORTS}
            showCompanyReviewAction={false}
            showAssignmentAction={false}
            emptyMessage="لا توجد بلاغات مؤرشفة مطابقة للبحث أو الفلاتر الحالية."
          />
        )}

        <div className="admin-reports-pagination">
          <button
            type="button"
            onClick={() => setPageNumber((current) => Math.max(current - 1, 1))}
            disabled={pageNumber <= 1 || isLoading}
          >
            السابق
          </button>

          <span>
            صفحة {pageNumber} من {totalPages} - إجمالي {totalCount} بلاغ مؤرشف
          </span>

          <button
            type="button"
            onClick={() =>
              setPageNumber((current) => Math.min(current + 1, totalPages))
            }
            disabled={pageNumber >= totalPages || isLoading}
          >
            التالي
          </button>
        </div>
      </DashboardSectionCard>
    </div>
  );
}

export default AdminReportsArchivePage;
