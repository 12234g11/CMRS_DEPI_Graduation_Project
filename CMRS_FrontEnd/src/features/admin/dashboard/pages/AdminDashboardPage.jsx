import { useEffect, useMemo, useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import MapLegend from '../../../map/components/MapLegend';
import ReportsMap from '../../../map/components/ReportsMap';
import { getAdminDashboardData } from '../api/adminDashboardApi';
import AdminCompaniesGrid from '../components/AdminCompaniesGrid';
import AdminFilterSelect from '../components/AdminFilterSelect';
import AdminReportsTable from '../components/AdminReportsTable';
import AdminStatsCards from '../components/AdminStatsCards';
import {
  adminDashboardCompanies,
  adminDashboardMapMarkers,
  adminDashboardReports,
  adminDashboardReportsMapLegend,
  adminDashboardStats,
} from '../mocks/adminDashboardMockData';
import '../admin-dashboard.css';

const statusFilterOptions = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'قيد المراجعة', label: 'قيد المراجعة' },
  { value: 'جاري الحل', label: 'جاري الحل' },
  { value: 'تم الحل', label: 'تم الحل' },
];

const priorityFilterOptions = [
  { value: 'all', label: 'كل الأولويات' },
  { value: 'عالية', label: 'عالية' },
  { value: 'متوسطة', label: 'متوسطة' },
  { value: 'منخفضة', label: 'منخفضة' },
];

function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    stats: adminDashboardStats,
    mapMarkers: adminDashboardMapMarkers,
    mapLegend: adminDashboardReportsMapLegend,
    companies: adminDashboardCompanies,
    reports: adminDashboardReports,
  });

  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    getAdminDashboardData().then((data) => {
      if (isMounted) {
        setDashboardData(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return dashboardData.reports.filter((report) => {
      const matchesSearch = normalizedSearch
        ? [report.type, report.status, report.priority, report.assignedCompany, report.reviewer]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [dashboardData.reports, priorityFilter, searchTerm, statusFilter]);

  const handleMarkerSelect = (marker) => {
    setActiveMarkerId((currentId) => (currentId === marker.id ? null : marker.id));
  };

  return (
    <div className="dashboard-page admin-dashboard-page">
      <PageHeader
        title="لوحة تحكم المشرف"
        subtitle="Admin Dashboard - إدارة البلاغات وتعيين فرق الصيانة"
      />

      <AdminStatsCards stats={dashboardData.stats} />

      <div className="admin-dashboard-grid">
        <DashboardSectionCard
          title="خريطة البلاغات"
          subtitle="Reports Map"
          className="admin-dashboard-map-card"
          action={<MapLegend items={dashboardData.mapLegend} compact />}
        >
          <ReportsMap
            markers={dashboardData.mapMarkers}
            activeMarkerId={activeMarkerId}
            onMarkerSelect={handleMarkerSelect}
            height={330}
          />
        </DashboardSectionCard>

        <DashboardSectionCard
          title="الشركات"
          subtitle="Maintenance Companies"
          className="admin-dashboard-companies-card"
        >
          <AdminCompaniesGrid companies={dashboardData.companies} />
        </DashboardSectionCard>
      </div>

      <DashboardSectionCard
        title="البلاغات"
        subtitle="Reports"
        className="admin-dashboard-reports-card"
        action={
          <div className="admin-reports-toolbar">
            <div className="admin-reports-search">
              <FiSearch />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ابحث عن شارع أو منطقة..."
                aria-label="البحث في البلاغات"
              />
            </div>

            <AdminFilterSelect
              value={statusFilter}
              options={statusFilterOptions}
              onChange={setStatusFilter}
              ariaLabel="فلترة البلاغات حسب الحالة"
            />

            <AdminFilterSelect
              value={priorityFilter}
              options={priorityFilterOptions}
              onChange={setPriorityFilter}
              ariaLabel="فلترة البلاغات حسب الأولوية"
            />

            <button type="button" className="admin-filter-btn" aria-label="تطبيق الفلاتر">
              <FiFilter />
            </button>
          </div>
        }
      >
        <AdminReportsTable reports={filteredReports} />
      </DashboardSectionCard>
    </div>
  );
}

export default AdminDashboardPage;