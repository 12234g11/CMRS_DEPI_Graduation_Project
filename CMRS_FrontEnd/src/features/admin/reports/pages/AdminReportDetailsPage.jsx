import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import ReportsMap from '../../../map/components/ReportsMap';
import {
  getAdminReportById,
  updateAdminReport,
} from '../api/adminReportsApi';
import AdminCompanyAssignmentPanel from '../components/AdminCompanyAssignmentPanel';
import AdminReportImagesCard from '../components/AdminReportImagesCard';
import AdminReporterCard from '../components/AdminReporterCard';
import AdminReportStatusForm from '../components/AdminReportStatusForm';
import AdminReportSummaryCard from '../components/AdminReportSummaryCard';
import { adminReports } from '../mocks/adminReportsMockData';
import '../admin-reports.css';

function AdminReportDetailsPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [report, setReport] = useState(() => (
    adminReports.find((item) => String(item.id) === String(reportId)) || null
  ));

  useEffect(() => {
    let isMounted = true;

    getAdminReportById(reportId).then((data) => {
      if (isMounted) {
        setReport(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  useEffect(() => {
    if (!report || location.hash !== '#company-assignment') return;

    const scrollTimer = window.setTimeout(() => {
      const assignmentSection = document.getElementById('company-assignment');

      assignmentSection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 250);

    return () => {
      window.clearTimeout(scrollTimer);
    };
  }, [location.hash, report]);

  const activeMarkerId = report ? `admin-report-${report.id}` : null;

  const selectedReportMapMarkers = useMemo(() => {
    if (!report?.position) return [];

    return [
      {
        id: `admin-report-${report.id}`,
        title: report.type,
        subtitle: report.location,
        area: report.location,
        statusLabel: report.status,
        tone: report.statusTone,
        address: report.location,
        position: report.position,
      },
    ];
  }, [report]);

  async function handleStatusSave(payload) {
    await updateAdminReport(report.id, payload);

    setReport((currentReport) => ({
      ...currentReport,
      ...payload,
      statusTone:
        payload.status === 'تم الحل'
          ? 'success'
          : payload.status === 'جاري الحل'
            ? 'info'
            : 'warning',
    }));
  }

  function handleCompanyAssigned(result) {
    setReport((currentReport) => ({
      ...currentReport,
      assignedCompanyId: result.companyId,
      assignedCompany: result.assignedCompany,
      concernedCompany: result.concernedCompany,
      status: result.status,
      statusTone: result.statusTone,
      assignment: result.assignment,
    }));
  }

  if (!report) {
    return (
      <div className="dashboard-page admin-report-details-page">
        <PageHeader title="عرض البلاغ" subtitle="Report Details" />

        <section className="admin-report-details-card admin-report-not-found">
          <h2>لم يتم العثور على البلاغ</h2>
          <p>البلاغ المطلوب غير موجود أو تم حذفه.</p>

          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN_REVIEW_REPORTS)}
          >
            الرجوع لإدارة البلاغات
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page admin-report-details-page">
      <PageHeader
        title="عرض البلاغ"
        subtitle={`Report Details - تفاصيل البلاغ رقم #${report.id}`}
      />

      <Link to={ROUTES.ADMIN_REVIEW_REPORTS} className="admin-report-back-link">
        <FiArrowRight />
        الرجوع إلى إدارة البلاغات
      </Link>

      <div className="admin-report-details-grid">
        <div className="admin-report-details-left">
          <section className="admin-report-details-card admin-report-description-card">
            <header className="admin-report-description-header">
              <h2>وصف المشكلة</h2>

              <span
                className={`admin-report-type-pill admin-report-type-pill--${report.priorityTone}`}
              >
                {report.type}
              </span>
            </header>

            <div className="admin-report-description-content">
              <p>{report.description}</p>
            </div>
          </section>

          <AdminReportSummaryCard report={report} />
        </div>

        <div className="admin-report-details-right">
          <AdminReportImagesCard report={report} />

          <section className="admin-report-details-card admin-report-map-card">
            <header className="admin-report-card-header">
              <div>
                <h2>موقع البلاغ على الخريطة</h2>
                <p>Report Location</p>
              </div>
            </header>

            <ReportsMap
              markers={selectedReportMapMarkers}
              activeMarkerId={activeMarkerId}
              height={330}
            />
          </section>

          <AdminReporterCard reporter={report.reporter} />

          <AdminReportStatusForm report={report} onSave={handleStatusSave} />

          <AdminCompanyAssignmentPanel
            report={report}
            onAssigned={handleCompanyAssigned}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminReportDetailsPage;