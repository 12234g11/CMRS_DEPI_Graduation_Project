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
import { getCompanyDashboardData } from '../api/companyDashboardApi';
import CompanyDashboardFilterSelect from '../components/CompanyDashboardFilterSelect';
import CompanyReportDetailsModal from '../components/CompanyReportDetailsModal';
import CompanyStatsCards from '../components/CompanyStatsCards';
import {
  companyDashboardCompany,
  companyDashboardPriorityOptions,
  companyDashboardReports,
  companyDashboardStats,
  companyDashboardStatusOptions,
} from '../mocks/companyDashboardMockData';
import '../company-dashboard.css';

function buildMapMarker(report) {
  return {
    id: `company-dashboard-report-${report.id}`,
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

function CompanyDashboardPage() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    company: companyDashboardCompany,
    stats: companyDashboardStats,
    reports: companyDashboardReports,
    filters: {
      statuses: companyDashboardStatusOptions,
      priorities: companyDashboardPriorityOptions,
    },
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsReport, setDetailsReport] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getCompanyDashboardData().then((data) => {
      if (!isMounted) return;

      setDashboardData({
        company: data.company,
        stats: data.stats,
        reports: data.reports,
        filters: {
          statuses: data.filters.statuses,
          priorities: data.filters.priorities,
        },
      });
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
            report.adminNote,
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
  }, [
    dashboardData.reports,
    priorityFilter,
    searchTerm,
    statusFilter,
  ]);

  const mapMarkers = useMemo(() => {
    return filteredReports
      .filter((report) => report.position?.lat && report.position?.lng)
      .map(buildMapMarker);
  }, [filteredReports]);

  function handleMarkerSelect(marker) {
    const reportId =
      marker?.reportId ||
      String(marker?.id || '').replace('company-dashboard-report-', '');

    const report = filteredReports.find(
      (item) => String(item.id) === String(reportId),
    );

    setActiveMarkerId(marker?.id || `company-dashboard-report-${reportId}`);
    setSelectedReport(report || null);
  }

  function handleOpenDetails(report) {
    setDetailsReport(report);
  }

  function handleGoToReport(report) {
    navigate(ROUTES.COMPANY_REPORTS, {
      state: {
        selectedReportId: report.id,
      },
    });
  }

  function handleResetFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setActiveMarkerId(null);
    setSelectedReport(null);
  }

  return (
    <div className="dashboard-page company-dashboard-page">
      <PageHeader
        title="لوحة تحكم الشركة"
        subtitle={`${dashboardData.company.name} - متابعة البلاغات المسندة حسب الموقع والحالة`}
      />

      <CompanyStatsCards stats={dashboardData.stats} />

      <section className="company-dashboard-map-toolbar-card">
        <div className="company-dashboard-map-toolbar-header">
          <div>
            <h2>فلترة البلاغات المسندة على الخريطة</h2>
            <p>
              يتم عرض {filteredReports.length} بلاغ من إجمالي{' '}
              {dashboardData.reports.length} بلاغ مسند للشركة.
            </p>
          </div>

          <button
            type="button"
            className="company-dashboard-reset-btn"
            onClick={handleResetFilters}
          >
            <FiX />
            مسح الفلاتر
          </button>
        </div>

        <div className="company-dashboard-map-toolbar">
          <div className="company-dashboard-map-search">
            <FiSearch />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ابحث برقم البلاغ أو نوع المشكلة أو المنطقة..."
              aria-label="البحث في بلاغات الشركة"
            />
          </div>

          <CompanyDashboardFilterSelect
            value={statusFilter}
            options={dashboardData.filters.statuses}
            onChange={setStatusFilter}
            ariaLabel="فلترة البلاغات حسب الحالة"
          />

          <CompanyDashboardFilterSelect
            value={priorityFilter}
            options={dashboardData.filters.priorities}
            onChange={setPriorityFilter}
            ariaLabel="فلترة البلاغات حسب الأولوية"
          />

          <button
            type="button"
            className="company-dashboard-filter-icon-btn"
            aria-label="الفلاتر"
          >
            <FiFilter />
          </button>
        </div>
      </section>

      <section className="company-dashboard-map-card">
        <header className="company-dashboard-map-card__header">
          <div>
            <h2>خريطة البلاغات المسندة</h2>
            <p>
              اضغط على أي بلاغ على الخريطة لعرض ملخص سريع أو فتح التفاصيل.
            </p>
          </div>

          {selectedReport ? (
            <span className={`company-dashboard-active-report is-${selectedReport.statusTone}`}>
              البلاغ المحدد: #{selectedReport.id} - {selectedReport.type}
            </span>
          ) : (
            <span className="company-dashboard-active-report">
              لم يتم تحديد بلاغ
            </span>
          )}
        </header>

        <div className="company-dashboard-map-wrapper">
          <ReportsMap
            markers={mapMarkers}
            activeMarkerId={activeMarkerId}
            onMarkerSelect={handleMarkerSelect}
            height={560}
            showCurrentLocationControl={false}
          />

          {selectedReport ? (
            <div className="company-dashboard-selected-report-card">
              <button
                type="button"
                className="company-dashboard-selected-report-card__close"
                onClick={() => {
                  setSelectedReport(null);
                  setActiveMarkerId(null);
                }}
                aria-label="إغلاق ملخص البلاغ"
              >
                <FiX />
              </button>

              <div className="company-dashboard-selected-report-card__header">
                <span className={`is-${selectedReport.statusTone}`}>
                  {selectedReport.status}
                </span>

                <strong>{selectedReport.type}</strong>
              </div>

              <p>{selectedReport.title}</p>

              <div className="company-dashboard-selected-report-card__location">
                <FiMapPin />
                <span>{selectedReport.location}</span>
              </div>

              <div className="company-dashboard-selected-report-card__actions">
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
                  فتح في البلاغات
                  <FiArrowLeft />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <CompanyReportDetailsModal
        report={detailsReport}
        onClose={() => setDetailsReport(null)}
        onGoToReport={handleGoToReport}
      />
    </div>
  );
}

export default CompanyDashboardPage;