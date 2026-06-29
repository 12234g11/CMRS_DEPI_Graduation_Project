import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiAlertCircle,
  FiFilter,
  FiSearch,
  FiSliders,
  FiX,
} from 'react-icons/fi';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import {
  getCompanyReports,
  startCompanyReportWork,
  submitCompanyReportSolution,
} from '../api/companyReportsApi';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import CompanyReportsFilterSelect from '../components/CompanyReportsFilterSelect';
import CompanyReportsTable from '../components/CompanyReportsTable';
import SolutionUploadForm from '../components/SolutionUploadForm';
import {
  companyReportPriorityOptions,
  companyReports,
  companyReportStatusOptions,
} from '../mocks/companyReportsMockData';
import '../company-reports.css';

function CompanyReportsPage() {
  const location = useLocation();
  const highlightedReportId = location.state?.selectedReportId;
  const solutionPanelRef = useRef(null);

  const [reports, setReports] = useState(companyReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignReport, setAssignReport] = useState(null);
  const [solutionReport, setSolutionReport] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCompanyReports().then((data) => {
      if (isMounted) {
        setReports(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!highlightedReportId) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(`company-report-row-${highlightedReportId}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [highlightedReportId, reports]);

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

  const adminFeedbackCount = useMemo(() => {
    return reports.filter(
      (report) => report.adminReview?.status === 'needs_completion',
    ).length;
  }, [reports]);

  const pendingReviewCount = useMemo(() => {
    return reports.filter(
      (report) => report.status === 'بانتظار مراجعة الأدمن',
    ).length;
  }, [reports]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (searchTerm.trim()) count += 1;
    if (statusFilter !== 'all') count += 1;
    if (priorityFilter !== 'all') count += 1;

    return count;
  }, [priorityFilter, searchTerm, statusFilter]);

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch = normalizedSearch
        ? [
            report.id,
            report.type,
            report.title,
            report.location,
            report.status,
            report.priority,
            report.assignedTeam?.name,
            report.adminReview?.note,
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      const matchesStatus =
        statusFilter === 'all' || report.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' || report.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [priorityFilter, reports, searchTerm, statusFilter]);

  function updateReportInState(updatedReport) {
    setReports((currentReports) =>
      currentReports.map((report) =>
        String(report.id) === String(updatedReport.id)
          ? updatedReport
          : report,
      ),
    );
  }

  async function handleStartWork(report) {
    const updatedReport = await startCompanyReportWork(report.id);
    updateReportInState(updatedReport);
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
  }

  function handleResetFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  }

  function handleApplyFilters() {
    setIsFiltersOpen(false);
  }

  const desktopFilters = (
    <div className="company-reports-toolbar company-reports-toolbar--desktop">
      <div className="company-reports-search">
        <FiSearch />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="ابحث برقم البلاغ أو المنطقة أو الحالة..."
          aria-label="البحث في بلاغات الشركة"
        />
      </div>

      <CompanyReportsFilterSelect
        value={statusFilter}
        options={companyReportStatusOptions}
        onChange={setStatusFilter}
        ariaLabel="فلترة البلاغات حسب الحالة"
      />

      <CompanyReportsFilterSelect
        value={priorityFilter}
        options={companyReportPriorityOptions}
        onChange={setPriorityFilter}
        ariaLabel="فلترة البلاغات حسب الأولوية"
      />

      <button
        type="button"
        className="company-reports-filter-btn"
        aria-label="الفلاتر"
      >
        <FiFilter />
      </button>

      <button
        type="button"
        className="company-reports-reset-btn"
        onClick={handleResetFilters}
      >
        <FiX />
        مسح
      </button>
    </div>
  );

  const mobileFiltersButton = (
    <button
      type="button"
      className="company-reports-open-filters-btn"
      onClick={() => setIsFiltersOpen(true)}
    >
      <FiSliders />
      الفلاتر
      {activeFiltersCount ? <span>{activeFiltersCount}</span> : null}
    </button>
  );

  return (
    <div className="dashboard-page company-reports-page">
      <PageHeader
        title="بلاغات الشركة"
        subtitle="Company Reports - متابعة البلاغات المسندة وإرسال الحلول للأدمن"
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
            setStatusFilter('مطلوب استكمال');
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

      <DashboardSectionCard
        title="البلاغات المسندة"
        subtitle="Assigned Reports"
        className="company-reports-card"
        action={
          <>
            {desktopFilters}
            {mobileFiltersButton}
          </>
        }
      >
        <div className="company-reports-flow-note">
          <FiAlertCircle />
          <span>
            بعد إرسال الحل، لا يتحول البلاغ إلى تم الحل مباشرة؛ بل ينتقل إلى
            بانتظار مراجعة الأدمن، والأدمن يقرر قبول الحل أو طلب استكمال.
          </span>
        </div>

        <CompanyReportsTable
          reports={filteredReports}
          highlightedReportId={highlightedReportId}
          onAssignTechnician={setAssignReport}
          onSubmitSolution={handleOpenSolutionPanel}
          onStartWork={handleStartWork}
        />
      </DashboardSectionCard>

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

                <p>
                  اختر الحالة أو الأولوية أو ابحث داخل البلاغات المسندة.
                </p>
              </div>
            </header>

            <div className="company-reports-filters-panel__body">
              <div className="company-reports-search company-reports-search--panel">
                <FiSearch />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ابحث برقم البلاغ أو المنطقة..."
                  aria-label="البحث في بلاغات الشركة"
                />
              </div>

              <CompanyReportsFilterSelect
                value={statusFilter}
                options={companyReportStatusOptions}
                onChange={setStatusFilter}
                ariaLabel="فلترة البلاغات حسب الحالة"
              />

              <CompanyReportsFilterSelect
                value={priorityFilter}
                options={companyReportPriorityOptions}
                onChange={setPriorityFilter}
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

      <AssignTechnicianModal
        report={assignReport}
        isOpen={Boolean(assignReport)}
        onClose={() => setAssignReport(null)}
        onAssigned={updateReportInState}
      />
    </div>
  );
}

export default CompanyReportsPage;