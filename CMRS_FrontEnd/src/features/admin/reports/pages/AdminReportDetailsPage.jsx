import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import ReportsMap from '../../../map/components/ReportsMap';
import {
  acceptCompanyCannotFix,
  acceptCompanyFix,
  archiveAdminReport,
  approveAdminReport,
  getAdminReportById,
  prepareCompanyReassignment,
  rejectAdminReport,
  rejectCompanyCannotFix,
  requestCompanyCompletion,
  unarchiveAdminReport,
} from '../api/adminReportsApi';
import AdminCompanyAssignmentPanel from '../components/AdminCompanyAssignmentPanel';
import AdminCompanyResponseReviewCard from '../components/AdminCompanyResponseReviewCard';
import AdminReportImagesCard from '../components/AdminReportImagesCard';
import AdminReportEngagementStatsCard from '../components/AdminReportEngagementStatsCard';
import AdminReporterCard from '../components/AdminReporterCard';
import AdminReportStatusForm from '../components/AdminReportStatusForm';
import AdminReportSummaryCard from '../components/AdminReportSummaryCard';
import AdminReportTimelineCard from '../components/AdminReportTimelineCard';
import AdminReportArchiveCard from '../components/AdminReportArchiveCard';
import '../admin-reports.css';

function hasPreparedReassignment(report = {}) {
  const reassignmentState = String(
    report.reassignmentStatus ||
      report.assignmentMode ||
      report.assignmentState ||
      report.adminDecision?.decisionType ||
      report.adminDecision?.decision ||
      '',
  ).toLowerCase();

  return Boolean(
    report.reassignmentPending ||
      report.isReassignmentPending ||
      report.canSelectNewCompany ||
      reassignmentState.includes('reassign') ||
      reassignmentState.includes('selectnewcompany') ||
      reassignmentState.includes('pendingcompanyselection')
  );
}

function hasAssignedCompany(report = {}) {
  const assignedCompanyName =
    report.assignedCompanyName ||
    report.assignedCompany ||
    report.concernedCompanyName ||
    report.concernedCompany ||
    '';

  return Boolean(
    report.assignedCompanyId ||
      (assignedCompanyName && assignedCompanyName !== 'غير معين')
  );
}

function getReassignmentStorageKey(reportId) {
  return `admin-report-reassignment:${reportId}`;
}

function getStoredReassignment(reportId) {
  const rawValue = window.sessionStorage.getItem(
    getReassignmentStorageKey(reportId),
  );

  if (!rawValue) return null;
  if (rawValue === 'true') return { isActive: true };

  try {
    const parsedValue = JSON.parse(rawValue);

    return parsedValue && typeof parsedValue === 'object'
      ? { ...parsedValue, isActive: true }
      : { isActive: true };
  } catch {
    return { isActive: true };
  }
}

function mergeStoredReassignment(report, storedReassignment) {
  if (!storedReassignment) return report;

  return {
    ...report,
    adminDecision: {
      ...(report.adminDecision || {}),
      decisionType:
        report.adminDecision?.decisionType || storedReassignment.decisionType || 'reassign',
      decisionLabel:
        report.adminDecision?.decisionLabel ||
        storedReassignment.decisionLabel ||
        'بانتظار تعيين شركة جديدة',
      previousCompanyId:
        report.adminDecision?.previousCompanyId ||
        storedReassignment.previousCompanyId ||
        '',
      previousCompanyName:
        report.adminDecision?.previousCompanyName ||
        storedReassignment.previousCompanyName ||
        '',
      companyResponseId:
        report.adminDecision?.companyResponseId ||
        storedReassignment.companyResponseId ||
        '',
    },
  };
}

function AdminReportDetailsPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isArchiveRoute = location.pathname.startsWith(
    ROUTES.ADMIN_ARCHIVED_REPORTS,
  );

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReassignmentMode, setIsReassignmentMode] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setIsReassignmentMode(false);

    getAdminReportById(reportId)
      .then((data) => {
        if (isMounted) {
          const storedReassignment = getStoredReassignment(reportId);
          const preparedData = mergeStoredReassignment(data, storedReassignment);

          setReport(preparedData);
          setIsReassignmentMode(
            hasPreparedReassignment(preparedData) ||
              Boolean(storedReassignment?.isActive),
          );
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

  function clearReassignmentMode() {
    setIsReassignmentMode(false);
    window.sessionStorage.removeItem(getReassignmentStorageKey(report.id));
  }

  async function handleCompanyAssigned(updatedReport) {
    clearReassignmentMode();

    if (updatedReport?.id) {
      setReport(updatedReport);
      return;
    }

    setReport(await getAdminReportById(report.id));
  }

  async function handleAcceptFix(payload = {}) {
    const updatedReport = await acceptCompanyFix(report.id, payload);
    clearReassignmentMode();
    setReport(updatedReport);
  }

  async function handleRequestCompletion(payload = {}) {
    const updatedReport = await requestCompanyCompletion(report.id, payload);

    // طلب الاستكمال يُبقي البلاغ مع الشركة الحالية، لذلك لا نعرض اختيار شركة أخرى.
    clearReassignmentMode();
    setReport(updatedReport);
  }

  async function handleAcceptCannotFix(payload = {}) {
    const updatedReport = await acceptCompanyCannotFix(report.id, payload);
    clearReassignmentMode();
    setReport(updatedReport);
  }

  async function handleRejectCannotFix(payload = {}) {
    const updatedReport = await rejectCompanyCannotFix(report.id, payload);
    clearReassignmentMode();
    setReport(updatedReport);
  }

  async function handleArchiveReport() {
    const updatedReport = await archiveAdminReport(report.id);

    clearReassignmentMode();
    setReport(updatedReport);
    navigate(`${ROUTES.ADMIN_ARCHIVED_REPORTS}/${report.id}`, {
      replace: true,
    });
  }

  async function handleUnarchiveReport() {
    const updatedReport = await unarchiveAdminReport(report.id);

    clearReassignmentMode();
    setReport(updatedReport);
    navigate(`${ROUTES.ADMIN_REVIEW_REPORTS}/${report.id}`, {
      replace: true,
    });
  }

  async function handleReassign() {
    const previousCompanyId = report.assignedCompanyId || '';
    const previousCompanyName =
      report.assignedCompanyName ||
      report.assignedCompany ||
      report.concernedCompanyName ||
      '';
    const updatedReport = await prepareCompanyReassignment(report.id);
    const preparedReport = {
      ...updatedReport,
      adminDecision: {
        ...(updatedReport.adminDecision || {}),
        decisionType: updatedReport.adminDecision?.decisionType || 'reassign',
        decisionLabel:
          updatedReport.adminDecision?.decisionLabel || 'بانتظار تعيين شركة جديدة',
        previousCompanyId:
          updatedReport.adminDecision?.previousCompanyId || previousCompanyId,
        previousCompanyName:
          updatedReport.adminDecision?.previousCompanyName || previousCompanyName,
        companyResponseId:
          updatedReport.adminDecision?.companyResponseId ||
          report.companyResponse?.submissionId ||
          report.companyResponse?.id ||
          '',
      },
    };

    window.sessionStorage.setItem(
      getReassignmentStorageKey(report.id),
      JSON.stringify({
        isActive: true,
        decisionType: 'reassign',
        decisionLabel: 'بانتظار تعيين شركة جديدة',
        previousCompanyId,
        previousCompanyName,
        companyResponseId:
          report.companyResponse?.submissionId ||
          report.companyResponse?.id ||
          '',
      }),
    );
    setReport(preparedReport);
    setIsReassignmentMode(true);

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
    const fallbackRoute = isArchiveRoute
      ? ROUTES.ADMIN_ARCHIVED_REPORTS
      : ROUTES.ADMIN_REVIEW_REPORTS;

    return (
      <div className="dashboard-page admin-report-details-page">
        <PageHeader title="عرض البلاغ" subtitle="Report Details" />

        <section className="admin-report-details-card admin-report-not-found">
          <h2>لم يتم العثور على البلاغ</h2>
          <p>البلاغ المطلوب غير موجود أو تم حذفه.</p>

          <button
            type="button"
            onClick={() => navigate(fallbackRoute)}
          >
            {isArchiveRoute ? 'الرجوع إلى أرشيف البلاغات' : 'الرجوع لإدارة البلاغات'}
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
  const reportHasAssignedCompany = hasAssignedCompany(report);
  const isArchiveContext = isArchiveRoute || report.isArchived;
  const backRoute = isArchiveContext
    ? ROUTES.ADMIN_ARCHIVED_REPORTS
    : ROUTES.ADMIN_REVIEW_REPORTS;
  const canShowCompanyAssignmentPanel =
    !report.isArchived &&
    !isTerminalReport &&
    (
      isReassignmentMode ||
      (!isCitizenReviewStage && !reportHasAssignedCompany)
    );

  return (
    <div className="dashboard-page admin-report-details-page">
      <PageHeader
        title={isArchiveContext ? 'تفاصيل البلاغ المؤرشف' : 'عرض البلاغ'}
        subtitle={`Report Details - تفاصيل البلاغ رقم #${report.id}`}
      />

      <Link to={backRoute} className="admin-report-back-link">
        <FiArrowRight />
        {isArchiveContext ? 'الرجوع إلى أرشيف البلاغات' : 'الرجوع إلى إدارة البلاغات'}
      </Link>

      <AdminReportArchiveCard
        report={report}
        onArchive={handleArchiveReport}
        onUnarchive={handleUnarchiveReport}
      />

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

          {!isReassignmentMode ? (
            <AdminCompanyResponseReviewCard
              report={report}
              onAcceptFix={handleAcceptFix}
              onRequestCompletion={handleRequestCompletion}
              onAcceptCannotFix={handleAcceptCannotFix}
              onRejectCannotFix={handleRejectCannotFix}
              onReassign={handleReassign}
            />
          ) : null}

          {canShowCompanyAssignmentPanel ? (
            <AdminCompanyAssignmentPanel
              report={report}
              onAssigned={handleCompanyAssigned}
              allowReassignment={isReassignmentMode}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AdminReportDetailsPage;