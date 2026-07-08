import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiEye,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import ReportsMap from '../../../map/components/ReportsMap';
import { getAdminDashboardData, isRejectedReport } from '../api/adminDashboardApi';
import AdminDashboardReportDetailsModal from '../components/AdminDashboardReportDetailsModal';
import AdminFilterSelect from '../components/AdminFilterSelect';
import AdminStatsCards from '../components/AdminStatsCards';
import '../admin-dashboard.css';

const DEFAULT_DASHBOARD_DATA = {
  stats: [],
  reports: [],
  totalReportsCount: 0,
  hiddenRejectedCount: 0,
  filters: {
    problemTypes: [{ value: 'all', label: 'كل الأنواع' }],
    statuses: [{ value: 'all', label: 'كل الحالات المعروضة' }],
    priorities: [{ value: 'all', label: 'كل الأولويات' }],
  },
};

const FLAG_LEGEND = [
  {
    tone: 'warning',
    label: 'قيد المراجعة',
    description: 'بلاغ جديد أو بانتظار مراجعة الأدمن',
  },
  {
    tone: 'info',
    label: 'قيد التنفيذ',
    description: 'مقبول أو تم تعيينه أو جاري الحل',
  },
  {
    tone: 'success',
    label: 'تم الحل',
    description: 'تم اعتماد الحل أو إغلاق البلاغ',
  },
  {
    tone: 'danger',
    label: 'يحتاج إجراء',
    description: 'مطلوب متابعة أو متعذر التنفيذ',
  },
];

function getReportsTableTargetPath(report) {
  const reportId = encodeURIComponent(report.id);

  return `${ROUTES.ADMIN_REVIEW_REPORTS}?highlightReportId=${reportId}#reports-table`;
}

function hasValidPosition(report) {
  const lat = Number(report.position?.lat);
  const lng = Number(report.position?.lng);

  return Number.isFinite(lat) && Number.isFinite(lng);
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
    statusTone: report.statusTone,
    address: report.location,
    position: {
      lat: Number(report.position.lat),
      lng: Number(report.position.lng),
    },
  };
}

function valueMatchesFilter(selectedValue, ...values) {
  if (selectedValue === 'all') return true;

  const normalizedSelectedValue = String(selectedValue || '').toLowerCase();

  return values.some(
    (value) => String(value || '').toLowerCase() === normalizedSelectedValue,
  );
}

function AdminDashboardPage() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(DEFAULT_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [problemTypeFilter, setProblemTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsReport, setDetailsReport] = useState(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage('');

    getAdminDashboardData()
      .then((data) => {
        if (!isMounted) return;

        setDashboardData(data);
      })
      .catch((error) => {
        if (!isMounted) return;

        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            'تعذر تحميل بيانات لوحة التحكم.',
        );
        setDashboardData(DEFAULT_DASHBOARD_DATA);
      })
      .finally(() => {
        if (!isMounted) return;

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return dashboardData.reports.filter((report) => {
      if (isRejectedReport(report)) return false;

      const matchesSearch = normalizedSearch
        ? [
            report.id,
            report.type,
            report.title,
            report.issueCategoryName,
            report.location,
            report.city,
            report.status,
            report.statusValue,
            report.priority,
            report.priorityValue,
            report.assignedCompany,
            report.companyResponse?.companyName,
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      const matchesProblemType = valueMatchesFilter(
        problemTypeFilter,
        report.issueCategoryId,
        report.issueCategoryName,
        report.type,
      );

      const matchesStatus = valueMatchesFilter(
        statusFilter,
        report.statusValue,
        report.status,
        report.statusLabel,
      );

      const matchesPriority = valueMatchesFilter(
        priorityFilter,
        report.priorityValue,
        report.priority,
        report.priorityLabel,
      );

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

  const mapReports = useMemo(() => {
    return filteredReports.filter(hasValidPosition);
  }, [filteredReports]);

  const mapMarkers = useMemo(() => {
    return mapReports.map(buildMapMarker);
  }, [mapReports]);

  useEffect(() => {
    if (!selectedReport) return;

    const stillVisible = mapReports.some(
      (report) => String(report.id) === String(selectedReport.id),
    );

    if (!stillVisible) {
      setSelectedReport(null);
      setActiveMarkerId(null);
    }
  }, [mapReports, selectedReport]);

  function handleMarkerSelect(marker) {
    const reportId = marker?.reportId || String(marker?.id || '').replace('admin-dashboard-report-', '');

    const report = mapReports.find(
      (item) => String(item.id) === String(reportId),
    );

    setActiveMarkerId(marker?.id || `admin-dashboard-report-${reportId}`);
    setSelectedReport(report || null);
  }

  function handleOpenDetails(report) {
    setDetailsReport(report);
  }

  function handleGoToReport(report) {
    navigate(getReportsTableTargetPath(report), {
      state: {
        highlightReportId: report.id,
        scrollToReportsTable: true,
      },
    });
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
        subtitle="Admin Dashboard - متابعة البلاغات على الخريطة حسب الموقع والحالة"
      />

      <AdminStatsCards stats={dashboardData.stats} />

      <section className="admin-dashboard-map-toolbar-card">
        <div className="admin-dashboard-map-toolbar-header">
          <div>
            <h2>فلترة البلاغات على الخريطة</h2>
            <p>
              يتم عرض {mapReports.length} بلاغ على الخريطة من إجمالي{' '}
              {filteredReports.length} بلاغ مطابق للفلاتر.
              {dashboardData.hiddenRejectedCount ? (
                <span>
                  {' '}
                  تم استبعاد {dashboardData.hiddenRejectedCount} بلاغ مرفوض من الخريطة.
                </span>
              ) : null}
            </p>
          </div>

          <button
            type="button"
            className="admin-dashboard-reset-btn"
            onClick={handleResetFilters}
            disabled={isLoading}
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
              disabled={isLoading}
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
        </div>
      </section>

      <section className="admin-dashboard-map-card">
        <header className="admin-dashboard-map-card__header">
          <div>
            <h2>خريطة البلاغات</h2>
            <p>
              البلاغات المرفوضة لا تظهر على الخريطة. اضغط على أي Flag لعرض
              ملخص سريع ثم الانتقال لصف البلاغ داخل جدول البلاغات.
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

        <div className="admin-dashboard-map-legend" aria-label="معاني ألوان البلاغات على الخريطة">
          {FLAG_LEGEND.map((item) => (
            <div className="admin-dashboard-map-legend__item" key={item.tone}>
              <span className={`admin-dashboard-map-legend__flag is-${item.tone}`} />
              <div>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </div>
            </div>
          ))}
        </div>

        {errorMessage ? (
          <div className="admin-dashboard-state-card is-error">
            <FiAlertCircle />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="admin-dashboard-state-card">
            <FiRefreshCw className="admin-dashboard-state-card__spinner" />
            <span>جاري تحميل بلاغات الخريطة...</span>
          </div>
        ) : null}

        <div className="admin-dashboard-map-wrapper">
          <ReportsMap
            markers={mapMarkers}
            activeMarkerId={activeMarkerId}
            onMarkerSelect={handleMarkerSelect}
            height={560}
            showCurrentLocationControl={false}
          />

          {!isLoading && !mapMarkers.length ? (
            <div className="admin-dashboard-map-empty-card">
              لا توجد بلاغات غير مرفوضة مطابقة للفلاتر الحالية ولديها إحداثيات
              صالحة للعرض على الخريطة.
            </div>
          ) : null}

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

              <p>{selectedReport.title || selectedReport.description}</p>

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
