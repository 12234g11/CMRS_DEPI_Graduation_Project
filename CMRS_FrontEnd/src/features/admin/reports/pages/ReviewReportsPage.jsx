import { useEffect, useMemo, useState } from 'react';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { getAdminReports } from '../api/adminReportsApi';
import AdminReportsTable from '../components/AdminReportsTable';
import AdminReportsToolbar from '../components/AdminReportsToolbar';
import { adminReports } from '../mocks/adminReportsMockData';
import '../admin-reports.css';

function ReviewReportsPage() {
  const [reports, setReports] = useState(adminReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    getAdminReports().then((data) => {
      if (isMounted) {
        setReports(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingCompanyReviewCount = useMemo(() => {
    return reports.filter(
      (report) => report.companyResponse?.reviewStatus === 'pending',
    ).length;
  }, [reports]);

  const filteredReports = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch = normalizedSearch
        ? [
            report.type,
            report.title,
            report.location,
            report.status,
            report.priority,
            report.assignedCompany,
            report.companyResponse?.companyName,
            report.companyResponse?.statusLabel,
            report.companyResponse?.note,
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [priorityFilter, reports, searchTerm, statusFilter]);

  return (
    <div className="dashboard-page admin-manage-reports-page">
      <PageHeader
        title="إدارة البلاغات"
        subtitle="Manage Reports - إدارة البلاغات وتعيين فرق الصيانة"
      />

      <section className="admin-company-review-inbox-summary">
        <div>
          <h2>ردود الشركات بانتظار المراجعة</h2>
          <p>
            يوجد {pendingCompanyReviewCount} بلاغ يحتاج قرار الأدمن بعد رد الشركة.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStatusFilter('بانتظار مراجعة الأدمن')}
        >
          عرض البلاغات المنتظرة
        </button>
      </section>

      <DashboardSectionCard
        title="البلاغات"
        subtitle="Reports"
        className="admin-manage-reports-card"
        action={
          <AdminReportsToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />
        }
      >
        <AdminReportsTable reports={filteredReports} />
      </DashboardSectionCard>
    </div>
  );
}

export default ReviewReportsPage;