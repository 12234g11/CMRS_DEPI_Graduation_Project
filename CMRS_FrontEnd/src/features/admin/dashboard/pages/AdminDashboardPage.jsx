import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowLeft,
  FiEye,
  FiFilter,
  FiMapPin,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import ReportsMap from '../../../map/components/ReportsMap';
import { getAdminDashboardData } from '../api/adminDashboardApi';
import AdminDashboardReportDetailsModal from '../components/AdminDashboardReportDetailsModal';
import AdminFilterSelect from '../components/AdminFilterSelect';
import AdminStatsCards from '../components/AdminStatsCards';
import {
  adminDashboardPriorityOptions,
  adminDashboardProblemTypeOptions,
  adminDashboardReports,
  adminDashboardStats,
  adminDashboardStatusOptions,
} from '../mocks/adminDashboardMockData';
import '../admin-dashboard.css';

function getReportTargetPath(report) {
  const basePath = `${ROUTES.ADMIN_REVIEW_REPORTS}/${report.id}`;

  if (report.companyResponse) {
    return `${basePath}#company-response`;
  }

  return `${basePath}#company-assignment`;
}

function buildMapMarker(report) {
  return {
    id: `admin-dashboard-report-${report.id}`,
    reportId: report.id,
    title: report.type,
    subtitle: report.location,
    area: report.location,
    statusLabel: report.status,
    tone: report.statusTone,
    address: report.location,
    position: report.position,
  };
}

function AdminDashboardPage() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    stats: adminDashboardStats,
    reports: adminDashboardReports,
    filters: {
      problemTypes: adminDashboardProblemTypeOptions,
      statuses: adminDashboardStatusOptions,
      priorities: adminDashboardPriorityOptions,
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [problemTypeFilter, setProblemTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsReport, setDetailsReport] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getAdminDashboardData().then((data) => {
      if (!isMounted) return;

      setDashboardData(data);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return dashboardData.reports.filter((report) => {
      const matchesSearch = normalizedSearch
        ? [
          report.id,
          report.type,
          report.title,
          report.location,
          report.status,
          report.priority,
          report.assignedCompany,
          report.companyResponse?.companyName,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
        : true;

      const matchesProblemType =
        problemTypeFilter === 'all' || report.type === problemTypeFilter;

      const matchesStatus =
        statusFilter === 'all' || report.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' || report.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesProblemType &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    dashboardData.reports,
    priorityFilter,
    problemTypeFilter,
    searchTerm,
    statusFilter,
  ]);

  const mapMarkers = useMemo(() => {
    return filteredReports
      .filter((report) => report.position?.lat && report.position?.lng)
      .map(buildMapMarker);
  }, [filteredReports]);

  function handleMarkerSelect(marker) {
    const reportId = marker?.reportId || String(marker?.id || '').replace('admin-dashboard-report-', '');

    const report = filteredReports.find(
      (item) => String(item.id) === String(reportId),
    );

    setActiveMarkerId(marker?.id || `admin-dashboard-report-${reportId}`);
    setSelectedReport(report || null);
  }

  function handleOpenDetails(report) {
    setDetailsReport(report);
  }

  function handleGoToReport(report) {
    navigate(getReportTargetPath(report));
  }

  function handleResetFilters() {
    setSearchTerm('');
    setProblemTypeFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setActiveMarkerId(null);
    setSelectedReport(null);
  }

  return (
    <div className="dashboard-page admin-dashboard-page">
      <PageHeader
        title="لوحة تحكم المشرف"
        subtitle="Admin Dashboard - إدارة البلاغات حسب الموقع والحالة"
      />

      <AdminStatsCards stats={dashboardData.stats} />

      <section className="admin-dashboard-map-toolbar-card">
        <div className="admin-dashboard-map-toolbar-header">
          <div>
            <h2>فلترة البلاغات على الخريطة</h2>
            <p>
              يتم عرض {filteredReports.length} بلاغ من إجمالي{' '}
              {dashboardData.reports.length} بلاغ.
            </p>
          </div>

          <button
            type="button"
            className="admin-dashboard-reset-btn"
            onClick={handleResetFilters}
          >
            <FiX />
            مسح الفلاتر
          </button>
        </div>

        <div className="admin-dashboard-map-toolbar">
          <div className="admin-dashboard-map-search">
            <FiSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ابحث برقم البلاغ أو نوع المشكلة أو المنطقة..."
              aria-label="البحث في البلاغات"
            />
          </div>

          <AdminFilterSelect
            value={problemTypeFilter}
            options={dashboardData.filters.problemTypes}
            onChange={setProblemTypeFilter}
            ariaLabel="فلترة البلاغات حسب نوع المشكلة"
          />

          <AdminFilterSelect
            value={statusFilter}
            options={dashboardData.filters.statuses}
            onChange={setStatusFilter}
            ariaLabel="فلترة البلاغات حسب الحالة"
          />

          <AdminFilterSelect
            value={priorityFilter}
            options={dashboardData.filters.priorities}
            onChange={setPriorityFilter}
            ariaLabel="فلترة البلاغات حسب الأولوية"
          />

          <button
            type="button"
            className="admin-dashboard-filter-icon-btn"
            aria-label="الفلاتر"
          >
            <FiFilter />
          </button>
        </div>
      </section>

      <section className="admin-dashboard-map-card">
        <header className="admin-dashboard-map-card__header">
          <div>
            <h2>خريطة البلاغات</h2>
            <p>
              اضغط على أي بلاغ على الخريطة لعرض ملخص سريع، ثم افتح التفاصيل
              الكاملة.
            </p>
          </div>

          {selectedReport ? (
            <span className={`admin-dashboard-active-report is-${selectedReport.statusTone}`}>
              البلاغ المحدد: #{selectedReport.id} - {selectedReport.type}
            </span>
          ) : (
            <span className="admin-dashboard-active-report">
              لم يتم تحديد بلاغ
            </span>
          )}
        </header>

        <div className="admin-dashboard-map-wrapper">
          <ReportsMap
            markers={mapMarkers}
            activeMarkerId={activeMarkerId}
            onMarkerSelect={handleMarkerSelect}
            height={560}
            showCurrentLocationControl={false}
          />

          {selectedReport ? (
            <div className="admin-dashboard-selected-report-card">
              <button
                type="button"
                className="admin-dashboard-selected-report-card__close"
                onClick={() => {
                  setSelectedReport(null);
                  setActiveMarkerId(null);
                }}
                aria-label="إغلاق ملخص البلاغ"
              >
                <FiX />
              </button>

              <div className="admin-dashboard-selected-report-card__header">
                <span className={`is-${selectedReport.statusTone}`}>
                  {selectedReport.status}
                </span>

                <strong>{selectedReport.type}</strong>
              </div>

              <p>{selectedReport.title}</p>

              <div className="admin-dashboard-selected-report-card__location">
                <FiMapPin />
                <span>{selectedReport.location}</span>
              </div>

              <div className="admin-dashboard-selected-report-card__actions">
                <button
                  type="button"
                  onClick={() => handleOpenDetails(selectedReport)}
                >
                  <FiEye />
                  عرض التفاصيل
                </button>

                <button
                  type="button"
                  onClick={() => handleGoToReport(selectedReport)}
                >
                  صفحة البلاغ
                  <FiArrowLeft />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <AdminDashboardReportDetailsModal
        report={detailsReport}
        onClose={() => setDetailsReport(null)}
        onGoToReport={handleGoToReport}
      />
    </div>
  );
}

export default AdminDashboardPage;