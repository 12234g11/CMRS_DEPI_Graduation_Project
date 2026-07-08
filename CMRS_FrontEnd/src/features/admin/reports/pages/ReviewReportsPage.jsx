import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiFileText,
  FiMapPin,
  FiRefreshCw,
  FiUserCheck,
  FiUserPlus,
  FiXCircle,
} from 'react-icons/fi';
import { ROUTES } from '../../../../shared/navigation';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import {
  getAdminReportById,
  getAdminReportFilterOptions,
  getAdminReports,
} from '../api/adminReportsApi';
import AdminReportsTable from '../components/AdminReportsTable';
import AdminReportsToolbar from '../components/AdminReportsToolbar';
import '../admin-reports.css';

const DEFAULT_FILTER_OPTIONS = {
  statuses: [{ value: 'all', label: 'كل الحالات' }],
  priorities: [{ value: 'all', label: 'كل الأولويات' }],
  issueCategories: [{ value: 'all', label: 'كل التصنيفات' }],
};

const COMPANY_REVIEW_STATUS_OPTIONS = [
  { value: 'all', label: 'كل مراجعات الشركات' },
  { value: 'pending', label: 'بانتظار مراجعة الأدمن' },
  { value: 'approved', label: 'تم قبول رد الشركة' },
  { value: 'rejected', label: 'تم طلب متابعة' },
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'الأحدث أولاً' },
  { value: 'createdAt-asc', label: 'الأقدم أولاً' },
  { value: 'priority-desc', label: 'الأولوية الأعلى' },
  { value: 'rating-desc', label: 'الأعلى تقييماً' },
];

function getSortParams(sortValue) {
  const [sortBy, sortDirection] = String(sortValue || 'createdAt-desc').split('-');

  return { sortBy, sortDirection };
}


function SelectedMapReportCard({ report, isLoading, errorMessage, selectedReportLabel }) {
  if (isLoading) {
    return (
      <section className="admin-map-selected-report-card admin-map-selected-report-card--loading">
        <span className="admin-map-selected-report-card__eyebrow">{selectedReportLabel}</span>
        <strong>جاري تحميل بيانات البلاغ...</strong>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="admin-map-selected-report-card admin-map-selected-report-card--error">
        <span className="admin-map-selected-report-card__eyebrow">{selectedReportLabel}</span>
        <strong>{errorMessage}</strong>
      </section>
    );
  }

  if (!report) return null;

  return (
    <section className="admin-map-selected-report-card" aria-label={selectedReportLabel}>
      <div className="admin-map-selected-report-card__content">
        <span className="admin-map-selected-report-card__eyebrow">{selectedReportLabel}</span>
        <h3>{report.title || report.type || 'بلاغ محدد'}</h3>

        <div className="admin-map-selected-report-card__meta">
          <span className={`admin-report-status admin-report-status--${report.statusTone}`}>
            {report.statusLabel || report.status}
          </span>
          <span className={`admin-report-priority admin-report-priority--${report.priorityTone}`}>
            {report.priorityLabel || report.priority}
          </span>
          <span>
            <FiMapPin />
            {report.location || report.city || 'الموقع غير متاح'}
          </span>
        </div>
      </div>

      <div className="admin-map-selected-report-card__actions">
        <Link to={`${ROUTES.ADMIN_REVIEW_REPORTS}/${report.id}`} className="admin-map-selected-report-card__btn admin-map-selected-report-card__btn--primary">
          <FiEye />
          عرض التفاصيل
        </Link>

        <Link to={`${ROUTES.ADMIN_REVIEW_REPORTS}/${report.id}#company-assignment`} className="admin-map-selected-report-card__btn admin-map-selected-report-card__btn--secondary">
          <FiUserPlus />
          تعيين شركة
        </Link>
      </div>
    </section>
  );
}

function ReviewReportsPage() {
  const location = useLocation();
  const reportsTableRef = useRef(null);
  const selectedReportCardRef = useRef(null);
  const highlightReportId = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return location.state?.highlightReportId || params.get('highlightReportId') || '';
  }, [location.search, location.state]);
  const selectedReportSource = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return location.state?.selectedReportSource || params.get('source') || 'map';
  }, [location.search, location.state]);
  const selectedReportLabel =
    selectedReportSource === 'notification'
      ? 'البلاغ المحدد من الإشعارات'
      : 'البلاغ المحدد من الخريطة';
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [issueCategoryFilter, setIssueCategoryFilter] = useState('all');
  const [companyReviewStatusFilter, setCompanyReviewStatusFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('createdAt-desc');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMapReport, setSelectedMapReport] = useState(null);
  const [isSelectedMapReportLoading, setIsSelectedMapReportLoading] = useState(false);
  const [selectedMapReportError, setSelectedMapReportError] = useState('');
  const [selectedReportPulse, setSelectedReportPulse] = useState(false);

  useEffect(() => {
    if (!highlightReportId) {
      setSelectedMapReport(null);
      setSelectedMapReportError('');
      setIsSelectedMapReportLoading(false);
      return undefined;
    }

    let isMounted = true;

    setIsSelectedMapReportLoading(true);
    setSelectedMapReportError('');

    getAdminReportById(highlightReportId)
      .then((report) => {
        if (!isMounted) return;
        setSelectedMapReport(report);
      })
      .catch(() => {
        if (!isMounted) return;
        setSelectedMapReport(null);
        setSelectedMapReportError(`تعذر تحميل ${selectedReportLabel}.`);
      })
      .finally(() => {
        if (isMounted) {
          setIsSelectedMapReportLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [highlightReportId, selectedReportLabel]);

  useEffect(() => {
    let isMounted = true;

    getAdminReportFilterOptions()
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
    companyReviewStatusFilter,
    sortFilter,
  ]);

  useEffect(() => {
    let isMounted = true;
    const sortParams = getSortParams(sortFilter);

    setIsLoading(true);
    setErrorMessage('');

    getAdminReports({
      pageNumber,
      pageSize,
      search: searchTerm.trim(),
      status: statusFilter,
      priority: priorityFilter,
      issueCategoryId: issueCategoryFilter,
      companyReviewStatus: companyReviewStatusFilter,
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
      .catch(() => {
        if (!isMounted) return;

        setReports([]);
        setSummary(null);
        setTotalPages(1);
        setTotalCount(0);
        setErrorMessage('تعذر تحميل البلاغات من الخادم. برجاء المحاولة مرة أخرى.');
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
    companyReviewStatusFilter,
    issueCategoryFilter,
    pageNumber,
    pageSize,
    priorityFilter,
    searchTerm,
    sortFilter,
    statusFilter,
  ]);

  useEffect(() => {
    if (!highlightReportId || isSelectedMapReportLoading) return undefined;

    let pulseTimer;

    const scrollTimer = window.setTimeout(() => {
      selectedReportCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      setSelectedReportPulse(true);

      pulseTimer = window.setTimeout(() => {
        setSelectedReportPulse(false);
      }, 2200);
    }, 180);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(pulseTimer);
    };
  }, [
    highlightReportId,
    isSelectedMapReportLoading,
    selectedMapReport,
    selectedMapReportError,
  ]);

  const activeFiltersCount = useMemo(() => {
    const dropdownFilters = [
      statusFilter,
      priorityFilter,
      issueCategoryFilter,
      companyReviewStatusFilter,
    ].filter((value) => value && value !== 'all').length;

    const hasSearch = searchTerm.trim() ? 1 : 0;
    const hasCustomSort = sortFilter !== 'createdAt-desc' ? 1 : 0;

    return dropdownFilters + hasSearch + hasCustomSort;
  }, [companyReviewStatusFilter, issueCategoryFilter, priorityFilter, searchTerm, sortFilter, statusFilter]);

  function handleClearFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setIssueCategoryFilter('all');
    setCompanyReviewStatusFilter('all');
    setSortFilter('createdAt-desc');
    setPageNumber(1);
  }

  const summaryCards = useMemo(() => {
    const currentSummary = summary || {};

    return [
      {
        id: 'totalReports',
        label: 'إجمالي البلاغات',
        value: totalCount,
        icon: FiFileText,
        tone: 'primary',
      },
      {
        id: 'underReviewCount',
        label: 'قيد المراجعة',
        value: currentSummary.underReviewCount ?? 0,
        icon: FiClock,
        tone: 'warning',
      },
      {
        id: 'pendingCompanyReviewCount',
        label: 'بانتظار مراجعة الشركة',
        value: currentSummary.pendingCompanyReviewCount ?? 0,
        icon: FiBriefcase,
        tone: 'purple',
      },
      {
        id: 'assignedCount',
        label: 'تم التعيين',
        value: currentSummary.assignedCount ?? 0,
        icon: FiUserCheck,
        tone: 'blue',
      },
      {
        id: 'inProgressCount',
        label: 'جاري الحل',
        value: currentSummary.inProgressCount ?? 0,
        icon: FiRefreshCw,
        tone: 'info',
      },
      {
        id: 'resolvedCount',
        label: 'تم الحل',
        value: currentSummary.resolvedCount ?? 0,
        icon: FiCheckCircle,
        tone: 'success',
      },
      {
        id: 'rejectedCount',
        label: 'مرفوض',
        value: currentSummary.rejectedCount ?? 0,
        icon: FiXCircle,
        tone: 'danger',
      },
    ];
  }, [summary, totalCount]);

  return (
    <div className="dashboard-page admin-manage-reports-page">
      <PageHeader
        title="إدارة البلاغات"
        subtitle="Manage Reports - إدارة البلاغات وتعيين شركات الصيانة"
      />

      <section className="admin-reports-stats-grid" aria-label="ملخص البلاغات">
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
        companyReviewStatusFilter={companyReviewStatusFilter}
        onCompanyReviewStatusChange={setCompanyReviewStatusFilter}
        sortFilter={sortFilter}
        onSortChange={setSortFilter}
        statusOptions={filterOptions.statuses}
        priorityOptions={filterOptions.priorities}
        issueCategoryOptions={filterOptions.issueCategories}
        companyReviewStatusOptions={COMPANY_REVIEW_STATUS_OPTIONS}
        sortOptions={SORT_OPTIONS}
        totalCount={totalCount}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
      />

      {highlightReportId ? (
        <div
          id="selected-report-card"
          ref={selectedReportCardRef}
          className={selectedReportPulse ? 'admin-selected-report-scroll-target is-attention-active' : 'admin-selected-report-scroll-target'}
        >
          <SelectedMapReportCard
            report={selectedMapReport}
            isLoading={isSelectedMapReportLoading}
            errorMessage={selectedMapReportError}
            selectedReportLabel={selectedReportLabel}
          />
        </div>
      ) : null}

      <div id="reports-table" ref={reportsTableRef}>
        <DashboardSectionCard
          title="البلاغات"
          subtitle="Reports"
          className="admin-manage-reports-card admin-manage-reports-table-card"
        >
          {errorMessage ? (
            <p className="admin-reports-error-state">{errorMessage}</p>
          ) : null}

          {isLoading ? (
            <p className="admin-reports-loading-state">جاري تحميل البلاغات...</p>
          ) : (
            <AdminReportsTable reports={reports} />
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
              صفحة {pageNumber} من {totalPages} - إجمالي {totalCount} بلاغ
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
    </div>
  );
}

export default ReviewReportsPage;
