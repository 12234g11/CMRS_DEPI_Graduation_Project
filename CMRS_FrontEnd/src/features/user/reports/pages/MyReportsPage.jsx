import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiFilter,
  FiSearch,
  FiTool,
} from 'react-icons/fi';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { useAuth } from '../../../auth/hooks/useAuth';
import RecentReportsTable from '../components/RecentReportsTable';
import useUserReports from '../hooks/useUserReports';
import '../user-reports.css';

function getReportStatusKey(report) {
  const label = report?.statusLabel || '';
  const tone = report?.statusTone || '';

  if (
    tone === 'success' ||
    label.includes('تم الحل') ||
    label.includes('تمت المعالجة') ||
    label.toLowerCase().includes('solved')
  ) {
    return 'solved';
  }

  if (
    tone === 'info' ||
    label.includes('جاري') ||
    label.includes('قيد التنفيذ') ||
    label.toLowerCase().includes('progress')
  ) {
    return 'inProgress';
  }

  if (
    tone === 'warning' ||
    label.includes('قيد المراجعة') ||
    label.toLowerCase().includes('pending')
  ) {
    return 'pending';
  }

  return 'pending';
}

function normalizeSearchValue(value) {
  return String(value || '').toLowerCase().trim();
}

function MyReportsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { reports } = useUserReports(user?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const highlightedReportId = location.state?.createdReportId || null;
  const successMessage = location.state?.successMessage || '';

  const filterOptions = [
    { value: 'all', label: 'كل الحالات' },
    { value: 'pending', label: 'قيد المراجعة' },
    { value: 'inProgress', label: 'جاري الحل' },
    { value: 'solved', label: 'تم الحل' },
  ];

  const reportSummary = useMemo(() => {
    return reports.reduce(
      (summary, report) => {
        const statusKey = getReportStatusKey(report);

        summary.total += 1;
        summary[statusKey] += 1;

        return summary;
      },
      {
        total: 0,
        pending: 0,
        inProgress: 0,
        solved: 0,
      }
    );
  }, [reports]);

  const filteredReports = useMemo(() => {
    const query = normalizeSearchValue(searchQuery);

    return reports.filter((report) => {
      const reportStatusKey = getReportStatusKey(report);

      const matchesStatus =
        statusFilter === 'all' || reportStatusKey === statusFilter;

      const searchableText = [
        report.title,
        report.issue,
        report.categoryLabel,
        report.statusLabel,
        report.area,
        report.address,
        report.locationText,
        report.createdAt,
        report.date,
      ]
        .map(normalizeSearchValue)
        .join(' ');

      const matchesSearch = !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [reports, searchQuery, statusFilter]);

  const emptyMessage = searchQuery || statusFilter !== 'all'
    ? 'لا توجد بلاغات مطابقة لعملية البحث أو الفلترة.'
    : 'لم تقم بإضافة أي بلاغ حتى الآن.';

  return (
    <div className="dashboard-page">
      <PageHeader
        title="بلاغاتي"
        subtitle="متابعة كل البلاغات الخاصة بك في مكان واحد"
        
      />


      {successMessage ? (
        <div className="user-reports__success-banner">{successMessage}</div>
      ) : null}

      <div className="user-reports-summary-grid" dir="rtl">
        <div className="user-reports-summary-card user-reports-summary-card--total">
          <div className="user-reports-summary-card__content">
            <h3>البلاغات المقدمة</h3>
            <p>Total Reports</p>
            <strong>{reportSummary.total}</strong>
          </div>

          <span className="user-reports-summary-card__icon">
            <FiFileText />
          </span>
        </div>

        <div className="user-reports-summary-card user-reports-summary-card--pending">
          <div className="user-reports-summary-card__content">
            <h3>قيد المراجعة</h3>
            <p>Pending</p>
            <strong>{reportSummary.pending}</strong>
          </div>

          <span className="user-reports-summary-card__icon">
            <FiClock />
          </span>
        </div>

        <div className="user-reports-summary-card user-reports-summary-card--progress">
          <div className="user-reports-summary-card__content">
            <h3>جاري الحل</h3>
            <p>In Progress</p>
            <strong>{reportSummary.inProgress}</strong>
          </div>

          <span className="user-reports-summary-card__icon">
            <FiTool />
          </span>
        </div>

        <div className="user-reports-summary-card user-reports-summary-card--solved">
          <div className="user-reports-summary-card__content">
            <h3>تم الحل</h3>
            <p>Solved</p>
            <strong>{reportSummary.solved}</strong>
          </div>

          <span className="user-reports-summary-card__icon">
            <FiCheckCircle />
          </span>
        </div>
      </div>

      <DashboardSectionCard
        title="كل البلاغات"
        subtitle="All Reports"
        action={
          <div className="user-reports-search" dir="rtl">
            <div className="user-reports-search__input-wrap">
              <FiSearch />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ابحث عن شارع أو منطقة"
                aria-label="البحث في البلاغات"
              />
            </div>

            <div className="user-reports-filter">
              <button
                type="button"
                className={`user-reports-search__filter-btn ${
                  statusFilter !== 'all' ? 'is-active' : ''
                }`}
                onClick={() => setIsFilterOpen((prev) => !prev)}
                aria-label="فلترة البلاغات"
              >
                <FiFilter />
              </button>

              {isFilterOpen && (
                <div className="user-reports-filter__menu">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`user-reports-filter__item ${
                        statusFilter === option.value ? 'is-active' : ''
                      }`}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setIsFilterOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
      >
        <RecentReportsTable
          reports={filteredReports}
          highlightedReportId={highlightedReportId}
          emptyMessage={emptyMessage}
        />
      </DashboardSectionCard>
    </div>
  );
}

export default MyReportsPage;