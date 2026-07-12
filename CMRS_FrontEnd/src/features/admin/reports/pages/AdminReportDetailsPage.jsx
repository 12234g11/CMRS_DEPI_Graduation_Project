import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import ReportsMap from '../../../map/components/ReportsMap';
import {
  acceptCompanyCannotFix,
  acceptCompanyFix,
  approveAdminReport,
  closeAdminReport,
  getAdminReportById,
  prepareReportReassignment,
  rejectAdminReport,
  requestCompanyCompletion,
} from '../api/adminReportsApi';
import AdminCompanyAssignmentPanel from '../components/AdminCompanyAssignmentPanel';
import AdminCompanyResponseReviewCard from '../components/AdminCompanyResponseReviewCard';
import AdminReportImagesCard from '../components/AdminReportImagesCard';
import AdminReportEngagementStatsCard from '../components/AdminReportEngagementStatsCard';
import AdminReporterCard from '../components/AdminReporterCard';
import AdminReportStatusForm from '../components/AdminReportStatusForm';
import AdminReportSummaryCard from '../components/AdminReportSummaryCard';
import AdminReportTimelineCard from '../components/AdminReportTimelineCard';
import '../admin-reports.css';

function AdminReportDetailsPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);

    getAdminReportById(reportId)
      .then((data) => {
        if (isMounted) {
          setReport(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setReport(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  useEffect(() => {
    if (!report || !location.hash) return;

    const scrollTimer = window.setTimeout(() => {
      const targetSection = document.querySelector(location.hash);

      targetSection?.scrollIntoView({
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


  async function handleApproveReport() {
    const updatedReport = await approveAdminReport(report.id);
    setReport(updatedReport);
  }

  async function handleRejectReport(rejectionReason) {
    const updatedReport = await rejectAdminReport(report.id, rejectionReason);
    setReport(updatedReport);
  }

  async function handleCloseReport() {
    const updatedReport = await closeAdminReport(report.id);
    setReport(updatedReport);
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
      companyResponse: null,
      timeline: [
        ...(currentReport.timeline || []),
        {
          id: `${currentReport.id}-local-assignment-${Date.now()}`,
          actorType: 'admin',
          actor: 'الأدمن',
          title: 'تم تعيين شركة',
          description: `تم تعيين البلاغ إلى ${result.assignedCompany}.`,
          date: new Date().toLocaleString('ar-EG'),
        },
      ],
    }));
  }

  async function handleAcceptFix(payload = {}) {
    const updatedReport = await acceptCompanyFix(report.id, payload);
    setReport(updatedReport);
  }

  async function handleRequestCompletion(payload = {}) {
    const updatedReport = await requestCompanyCompletion(report.id, payload);
    setReport(updatedReport);
  }

  async function handleAcceptCannotFix(payload = {}) {
    const updatedReport = await acceptCompanyCannotFix(report.id, payload);
    setReport(updatedReport);
  }

async function handleReassign(payload = {}) {
  const updatedReport = await prepareReportReassignment(report.id, payload);

  setReport(updatedReport);

  navigate(`${ROUTES.ADMIN_REVIEW_REPORTS}/${report.id}#company-assignment`, {
    replace: true,
  });

  window.setTimeout(() => {
    const assignmentSection = document.getElementById('company-assignment');

    assignmentSection?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 350);
}
  if (isLoading) {
    return (
      <div className="dashboard-page admin-report-details-page">
        <PageHeader title="عرض البلاغ" subtitle="Report Details" />

        <section className="admin-report-details-card admin-report-not-found">
          <h2>جاري تحميل البلاغ...</h2>
          <p>برجاء الانتظار حتى يتم تحميل تفاصيل البلاغ من الخادم.</p>
        </section>
      </div>
    );
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


  const reportStatusText = `${report.statusValue || ''} ${report.statusLabel || ''} ${report.status || ''}`.toLowerCase();
  const isCitizenReviewStage =
    reportStatusText.includes('underreview') ||
    reportStatusText.includes('under review') ||
    reportStatusText.includes('pending') ||
    reportStatusText.includes('قيد المراجعة') ||
    reportStatusText.includes('بانتظار المراجعة');
  const isTerminalReport =
    reportStatusText.includes('resolved') ||
    reportStatusText.includes('rejected') ||
    reportStatusText.includes('closed') ||
    reportStatusText.includes('unabletoexecute') ||
    reportStatusText.includes('تم الحل') ||
    reportStatusText.includes('متعذر التنفيذ') ||
    reportStatusText.includes('مرفوض') ||
    reportStatusText.includes('مغلق');
  const canShowCompanyAssignmentPanel = !isCitizenReviewStage && !isTerminalReport;

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

          <AdminReportStatusForm
            report={report}
            onApprove={handleApproveReport}
            onReject={handleRejectReport}
            onCloseReport={handleCloseReport}
          />

          <AdminReportTimelineCard timeline={report.timeline || []} />
        </div>

        <div className="admin-report-details-right">
          <AdminReportImagesCard report={report} />

          <AdminReportEngagementStatsCard report={report} />

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

          <AdminCompanyResponseReviewCard
            report={report}
            onAcceptFix={handleAcceptFix}
            onRequestCompletion={handleRequestCompletion}
            onAcceptCannotFix={handleAcceptCannotFix}
            onReassign={handleReassign}
          />


          {canShowCompanyAssignmentPanel ? (
            <AdminCompanyAssignmentPanel
              report={report}
              onAssigned={handleCompanyAssigned}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AdminReportDetailsPage;