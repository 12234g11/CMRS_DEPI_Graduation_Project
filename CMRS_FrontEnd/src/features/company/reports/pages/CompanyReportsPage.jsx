import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiX,
} from 'react-icons/fi';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import ReportsMap from '../../../map/components/ReportsMap';
import {
  getCompanyReportFilterOptions,
  getCompanyReports,
  startCompanyReportWork,
  submitCompanyReportSolution,
} from '../api/companyReportsApi';
import CompanyReportsFilterSelect from '../components/CompanyReportsFilterSelect';
import CompanyReportsTable from '../components/CompanyReportsTable';
import SolutionUploadForm from '../components/SolutionUploadForm';
import '../company-reports.css';

const DEFAULT_PAGE_SIZE = 10;

const DEFAULT_STATUS_OPTIONS = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'تم التعيين', label: 'تم التعيين' },
  { value: 'جاري التنفيذ', label: 'جاري التنفيذ' },
  { value: 'بانتظار مراجعة الأدمن', label: 'بانتظار مراجعة الأدمن' },
  { value: 'مطلوب استكمال', label: 'مطلوب استكمال' },
  { value: 'متعذر التنفيذ', label: 'متعذر التنفيذ' },
  { value: 'تم الحل', label: 'تم الحل' },
];

const DEFAULT_PRIORITY_OPTIONS = [
  { value: 'all', label: 'كل الأولويات' },
  { value: 'عالية', label: 'عالية' },
  { value: 'متوسطة', label: 'متوسطة' },
  { value: 'منخفضة', label: 'منخفضة' },
];

function useDebouncedValue(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}

function getReportPosition(report) {
  const lat = Number(
    report?.position?.lat ??
      report?.position?.latitude ??
      report?.latitude ??
      report?.lat,
  );
  const lng = Number(
    report?.position?.lng ??
      report?.position?.lon ??
      report?.position?.longitude ??
      report?.longitude ??
      report?.lng ??
      report?.lon,
  );

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

function buildMapMarker(report) {
  const position = getReportPosition(report);

  if (!position) return null;

  return {
    id: `company-report-map-${report.id}`,
    reportId: report.id,
    title: report.title || report.type || 'بلاغ',
    subtitle: report.location,
    area: report.location,
    statusLabel: report.status,
    tone: report.statusTone || 'info',
    address: report.location,
    position,
  };
}

function CompanyReportsPage() {
  const location = useLocation();
  const routeSelectedReportId = location.state?.selectedReportId || null;
  const solutionPanelRef = useRef(null);
  const reportsTableSectionRef = useRef(null);

  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({
    totalAssignedReports: 0,
    needsCompletionCount: 0,
    pendingAdminReviewCount: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUS_OPTIONS);
  const [priorityOptions, setPriorityOptions] = useState(DEFAULT_PRIORITY_OPTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [solutionReport, setSolutionReport] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [processingReportId, setProcessingReportId] = useState(null);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedMapReport, setSelectedMapReport] = useState(null);
  const [mapHighlightedReportId, setMapHighlightedReportId] = useState(null);

  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const highlightedReportId =
    mapHighlightedReportId || routeSelectedReportId || null;

  useEffect(() => {
    let isMounted = true;

    getCompanyReportFilterOptions()
      .then((data) => {
        if (!isMounted) return;
        setStatusOptions(data.statusOptions);
        setPriorityOptions(data.priorityOptions);
      })
      .catch(() => {
        if (!isMounted) return;
        setStatusOptions(DEFAULT_STATUS_OPTIONS);
        setPriorityOptions(DEFAULT_PRIORITY_OPTIONS);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage('');

    getCompanyReports({
      search: debouncedSearchTerm.trim(),
      status: statusFilter,
      priority: priorityFilter,
      page: currentPage,
      pageSize: DEFAULT_PAGE_SIZE,
    })
      .then((data) => {
        if (!isMounted) return;

        const nextReports = data.items || [];

        setReports(nextReports);
        setSummary(
          data.summary || {
            totalAssignedReports: 0,
            needsCompletionCount: 0,
            pendingAdminReviewCount: 0,
          },
        );
        setPagination(
          data.pagination || {
            page: currentPage,
            pageSize: DEFAULT_PAGE_SIZE,
            totalItems: nextReports.length,
            totalPages: 1,
          },
        );

        setSelectedMapReport((currentReport) => {
          if (!currentReport) return null;

          return (
            nextReports.find(
              (report) => String(report.id) === String(currentReport.id),
            ) || null
          );
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        setReports([]);
        setSelectedMapReport(null);
        setActiveMarkerId(null);
        setMapHighlightedReportId(null);
        setErrorMessage(
          error.message || 'تعذر تحميل بلاغات الشركة من الخادم.',
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
    currentPage,
    debouncedSearchTerm,
    priorityFilter,
    reloadKey,
    statusFilter,
  ]);

  useEffect(() => {
    if (!routeSelectedReportId || mapHighlightedReportId) return;

    const matchingReport = reports.find(
      (report) => String(report.id) === String(routeSelectedReportId),
    );

    if (!matchingReport) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(`company-report-row-${routeSelectedReportId}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [mapHighlightedReportId, reports, routeSelectedReportId]);

  useEffect(() => {
    if (!solutionReport) return;

    const timer = window.setTimeout(() => {
      solutionPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [solutionReport]);

  const mapMarkers = useMemo(
    () => reports.map(buildMapMarker).filter(Boolean),
    [reports],
  );

  const adminFeedbackCount = useMemo(() => {
    return Number(
      summary.needsCompletionCount ??
        reports.filter(
          (report) => report.adminReview?.status === 'needs_completion',
        ).length,
    );
  }, [reports, summary.needsCompletionCount]);

  const pendingReviewCount = useMemo(() => {
    return Number(
      summary.pendingAdminReviewCount ??
        reports.filter(
          (report) => report.status === 'بانتظار مراجعة الأدمن',
        ).length,
    );
  }, [reports, summary.pendingAdminReviewCount]);

  const totalAssignedReports = Number(
    summary.totalAssignedReports ?? pagination.totalItems ?? reports.length,
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (searchTerm.trim()) count += 1;
    if (statusFilter !== 'all') count += 1;
    if (priorityFilter !== 'all') count += 1;

    return count;
  }, [priorityFilter, searchTerm, statusFilter]);

  function clearMapSelection({ clearHighlight = true } = {}) {
    setSelectedMapReport(null);
    setActiveMarkerId(null);

    if (clearHighlight) {
      setMapHighlightedReportId(null);
    }
  }

  function refreshReports() {
    clearMapSelection();
    setReloadKey((currentValue) => currentValue + 1);
  }

  function updateReportInState(updatedReport) {
    if (!updatedReport) return;

    setReports((currentReports) =>
      currentReports.map((report) =>
        String(report.id) === String(updatedReport.id)
          ? updatedReport
          : report,
      ),
    );

    setSelectedMapReport((currentReport) =>
      currentReport && String(currentReport.id) === String(updatedReport.id)
        ? updatedReport
        : currentReport,
    );
  }

  function handleSearchChange(value) {
    setSearchTerm(value);
    setCurrentPage(1);
    clearMapSelection();
  }

  function handleStatusFilterChange(value) {
    setStatusFilter(value);
    setCurrentPage(1);
    clearMapSelection();
  }

  function handlePriorityFilterChange(value) {
    setPriorityFilter(value);
    setCurrentPage(1);
    clearMapSelection();
  }

  function handleMarkerSelect(marker) {
    const reportId = marker?.reportId;
    const report = reports.find(
      (item) => String(item.id) === String(reportId),
    );

    if (!report) return;

    setActiveMarkerId(marker.id);
    setSelectedMapReport(report);
    setMapHighlightedReportId(null);
  }

  function handleRevealMapReportInTable() {
    if (!selectedMapReport) return;

    setMapHighlightedReportId(selectedMapReport.id);

    window.setTimeout(() => {
      const row = document.getElementById(
        `company-report-row-${selectedMapReport.id}`,
      );

      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.focus?.({ preventScroll: true });
        return;
      }

      reportsTableSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  }

  async function handleStartWork(report) {
    const isConfirmed = window.confirm(
      `هل أنت متأكد من بدء تنفيذ البلاغ ${report.id}؟ بعد التأكيد ستتغير الحالة إلى جاري التنفيذ.`,
    );

    if (!isConfirmed) return;

    setProcessingReportId(report.id);

    try {
      const updatedReport = await startCompanyReportWork(report.id);
      updateReportInState(updatedReport);
      refreshReports();
    } catch (error) {
      setErrorMessage(error.message || 'تعذر بدء تنفيذ البلاغ.');
    } finally {
      setProcessingReportId(null);
    }
  }

  function handleOpenSolutionPanel(report) {
    setSolutionReport(report);
  }

  async function handleSubmitSolution(payload) {
    if (!solutionReport) return;

    const updatedReport = await submitCompanyReportSolution(
      solutionReport.id,
      payload,
    );

    updateReportInState(updatedReport);
    setSolutionReport(null);
    refreshReports();
  }

  function handleResetFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCurrentPage(1);
    setIsFiltersOpen(false);
    clearMapSelection();
  }

  function handleApplyFilters() {
    setCurrentPage(1);
    setIsFiltersOpen(false);
    clearMapSelection();
  }

  function handlePreviousPage() {
    clearMapSelection();
    setCurrentPage((page) => Math.max(page - 1, 1));
  }

  function handleNextPage() {
    clearMapSelection();
    setCurrentPage((page) =>
      Math.min(page + 1, pagination.totalPages || 1),
    );
  }

  const desktopFilters = (
    <div className="company-reports-toolbar company-reports-toolbar--desktop">
      <div className="company-reports-search">
        <FiSearch />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="ابحث برقم البلاغ أو المنطقة أو الحالة..."
          aria-label="البحث في بلاغات الشركة"
        />
      </div>

      <CompanyReportsFilterSelect
        value={statusFilter}
        options={statusOptions}
        onChange={handleStatusFilterChange}
        ariaLabel="فلترة البلاغات حسب الحالة"
      />

      <CompanyReportsFilterSelect
        value={priorityFilter}
        options={priorityOptions}
        onChange={handlePriorityFilterChange}
        ariaLabel="فلترة البلاغات حسب الأولوية"
      />

      <button
        type="button"
        className="company-reports-filter-btn"
        aria-label="تحديث البلاغات"
        onClick={refreshReports}
      >
        <FiRefreshCw />
      </button>
    </div>
  );

  return (
    <div className="dashboard-page company-reports-page">
      <PageHeader
        title="البلاغات"
        subtitle="متابعة البلاغات المسندة على الخريطة وإدارة تنفيذها وإرسال الحلول للأدمن"
      />

      <section className="company-reports-inbox-summary">
        <div>
          <h2>رسائل ومراجعات الأدمن</h2>
          <p>
            يوجد {adminFeedbackCount} بلاغ يحتاج استكمال، و {pendingReviewCount}{' '}
            بلاغ بانتظار مراجعة الأدمن.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            handleStatusFilterChange('مطلوب استكمال');
            setIsFiltersOpen(false);
          }}
        >
          عرض المطلوب استكماله
        </button>
      </section>

      {solutionReport ? (
        <section
          ref={solutionPanelRef}
          id="company-solution-panel"
          className="company-reports-solution-panel"
        >
          <button
            type="button"
            className="company-reports-solution-panel__close"
            onClick={() => setSolutionReport(null)}
          >
            <FiX />
            إغلاق نموذج إرسال الحل
          </button>

          <SolutionUploadForm
            report={solutionReport}
            onSubmitSolution={handleSubmitSolution}
          />
        </section>
      ) : null}

      <section className="company-reports-filter-card">
        <div className="company-reports-filter-card__header">
          <div>
            <h2>فلترة البلاغات المسندة</h2>
            <p>
              يتم عرض {reports.length} بلاغ في الصفحة الحالية من إجمالي{' '}
              {totalAssignedReports} بلاغ مسند للشركة.
            </p>
          </div>

          <button
            type="button"
            className="company-reports-filter-card__reset-btn"
            onClick={handleResetFilters}
          >
            <FiX />
            مسح الفلاتر
          </button>
        </div>

        <div className="company-reports-filter-card__body">
          {desktopFilters}

          <div className="company-reports-filter-card__mobile-actions">
            <button
              type="button"
              className="company-reports-open-filters-btn"
              onClick={() => setIsFiltersOpen(true)}
            >
              <FiSliders />
              الفلاتر
              {activeFiltersCount ? <span>{activeFiltersCount}</span> : null}
            </button>

            <button
              type="button"
              className="company-reports-filter-card__reset-btn"
              onClick={handleResetFilters}
            >
              <FiX />
              مسح الفلاتر
            </button>
          </div>
        </div>
      </section>

      <section className="company-reports-map-card">
        <header className="company-reports-map-card__header">
          <div>
            <h2>خريطة البلاغات</h2>
            <p>
              الخريطة والجدول يعرضان نفس بلاغات الصفحة الحالية. اضغط على أي
              علامة لعرض ملخص البلاغ.
            </p>
          </div>

          <span className="company-reports-map-page-badge">
            صفحة {pagination.page} من {pagination.totalPages || 1}
          </span>
        </header>

        <div className="company-reports-map-wrapper">
          {mapMarkers.length ? (
            <ReportsMap
              markers={mapMarkers}
              activeMarkerId={activeMarkerId}
              onMarkerSelect={handleMarkerSelect}
              height={520}
              showCurrentLocationControl={false}
              showMarkerPopups={false}
            />
          ) : (
            <div className="company-reports-map-empty">
              <FiMapPin />
              <strong>لا توجد مواقع متاحة لبلاغات هذه الصفحة</strong>
              <span>
                ستظهر العلامات هنا عندما يرجع الباك إحداثيات صحيحة للبلاغات.
              </span>
            </div>
          )}

          {selectedMapReport ? (
            <aside
              className="company-reports-map-selection-card"
              aria-label="ملخص البلاغ المحدد من الخريطة"
            >
              <button
                type="button"
                className="company-reports-map-selection-card__close"
                onClick={() => clearMapSelection({ clearHighlight: false })}
                aria-label="إغلاق ملخص البلاغ"
              >
                <FiX />
              </button>

              <span
                className={`company-reports-map-selection-card__status is-${
                  selectedMapReport.statusTone || 'info'
                }`}
              >
                {selectedMapReport.status}
              </span>

              <strong>
                {selectedMapReport.title || selectedMapReport.type || 'بلاغ'}
              </strong>

              <span className="company-reports-map-selection-card__id">
                رقم البلاغ:{' '}
                <b dir="ltr">{selectedMapReport.id}</b>
              </span>

              <p>
                <FiMapPin />
                {selectedMapReport.location || 'الموقع غير متوفر'}
              </p>

              <button
                type="button"
                className="company-reports-map-selection-card__view"
                onClick={handleRevealMapReportInTable}
              >
                <FiArrowDown />
                عرض وتمييز البلاغ داخل الجدول
              </button>
            </aside>
          ) : null}
        </div>
      </section>

      <div ref={reportsTableSectionRef} className="company-reports-table-anchor">
        <DashboardSectionCard
          title="البلاغات المسندة"
          subtitle="Assigned Reports"
          className="company-reports-card"
        >
          <div className="company-reports-flow-note">
            <FiAlertCircle />
            <span>
              بعد إرسال الحل، لا يتحول البلاغ إلى تم الحل مباشرة؛ بل ينتقل إلى
              بانتظار مراجعة الأدمن، والأدمن يقرر قبول الحل أو طلب استكمال.
            </span>
          </div>

          {errorMessage ? (
            <div className="company-reports-state company-reports-state--error">
              <FiAlertCircle />
              <span>{errorMessage}</span>
              <button type="button" onClick={refreshReports}>
                إعادة المحاولة
              </button>
            </div>
          ) : null}

          {isLoading ? (
            <div className="company-reports-state">
              <FiRefreshCw />
              <span>جاري تحميل البلاغات المسندة للشركة...</span>
            </div>
          ) : null}

          {!isLoading && !errorMessage && !reports.length ? (
            <div className="company-reports-state">
              <FiAlertCircle />
              <span>لا توجد بلاغات مطابقة للفلاتر الحالية.</span>
            </div>
          ) : null}

          {!errorMessage && reports.length ? (
            <>
              <CompanyReportsTable
                reports={reports}
                highlightedReportId={highlightedReportId}
                onSubmitSolution={handleOpenSolutionPanel}
                onStartWork={handleStartWork}
                processingReportId={processingReportId}
              />

              <div className="company-reports-pagination">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  <FiChevronRight />
                  السابق
                </button>

                <span>
                  صفحة {pagination.page} من {pagination.totalPages || 1}
                </span>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={
                    pagination.page >= pagination.totalPages || isLoading
                  }
                >
                  التالي
                  <FiChevronLeft />
                </button>
              </div>
            </>
          ) : null}
        </DashboardSectionCard>
      </div>

      {isFiltersOpen ? (
        <div className="company-reports-filters-backdrop">
          <section
            className="company-reports-filters-panel"
            role="dialog"
            aria-modal="true"
          >
            <header className="company-reports-filters-panel__header">
              <button
                type="button"
                className="company-reports-filters-panel__close"
                onClick={() => setIsFiltersOpen(false)}
                aria-label="إغلاق الفلاتر"
              >
                <FiX />
              </button>

              <div>
                <h2>فلترة البلاغات</h2>

                <p>اختر الحالة أو الأولوية أو ابحث داخل البلاغات المسندة.</p>
              </div>
            </header>

            <div className="company-reports-filters-panel__body">
              <div className="company-reports-search company-reports-search--panel">
                <FiSearch />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="ابحث برقم البلاغ أو المنطقة..."
                  aria-label="البحث في بلاغات الشركة"
                />
              </div>

              <CompanyReportsFilterSelect
                value={statusFilter}
                options={statusOptions}
                onChange={handleStatusFilterChange}
                ariaLabel="فلترة البلاغات حسب الحالة"
              />

              <CompanyReportsFilterSelect
                value={priorityFilter}
                options={priorityOptions}
                onChange={handlePriorityFilterChange}
                ariaLabel="فلترة البلاغات حسب الأولوية"
              />
            </div>

            <footer className="company-reports-filters-panel__actions">
              <button
                type="button"
                className="company-reports-filter-apply-btn"
                onClick={handleApplyFilters}
              >
                <FiFilter />
                تطبيق الفلاتر
              </button>

              <button
                type="button"
                className="company-reports-filter-reset-btn"
                onClick={handleResetFilters}
              >
                <FiX />
                مسح الفلاتر
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default CompanyReportsPage;
