import { useEffect, useState } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
} from 'react-icons/fi';

function normalizeStatus(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function getReportStatus(report) {
  return normalizeStatus(report?.statusValue || report?.statusLabel || report?.status);
}

function getReportStatusText(report) {
  return `${report?.statusValue || ''} ${report?.statusLabel || ''} ${report?.status || ''}`
    .trim()
    .toLowerCase();
}

function hasPendingCompanyResponse(report) {
  const companyResponse = report?.companyResponse;
  const responseReviewStatus = normalizeStatus(companyResponse?.reviewStatus);
  const status = getReportStatus(report);

  const responseIsPending = Boolean(companyResponse) && (
    !responseReviewStatus ||
    responseReviewStatus === 'pending' ||
    responseReviewStatus === 'underreview' ||
    responseReviewStatus === 'awaitingreview'
  );

  return (
    responseIsPending ||
    Boolean(report?.pendingReviewType) ||
    status.includes('pendingadminapproval') ||
    status.includes('companyresponsereview')
  );
}

function isTerminalReport(report) {
  const status = getReportStatus(report);
  const statusText = getReportStatusText(report);

  return (
    status.includes('resolved') ||
    status.includes('rejected') ||
    status.includes('closed') ||
    status.includes('unabletoexecute') ||
    status.includes('cannotexecute') ||
    statusText.includes('تم الحل') ||
    statusText.includes('متعذر التنفيذ') ||
    statusText.includes('مرفوض') ||
    statusText.includes('مغلق')
  );
}

function canApproveCitizenReport(report) {
  if (!report || isTerminalReport(report) || hasPendingCompanyResponse(report)) {
    return false;
  }

  // وجود شركة مسند إليها البلاغ يعني أن مرحلة اعتماد بلاغ المواطن انتهت بالفعل.
  if (report.assignedCompanyId || report.assignment) {
    return false;
  }

  const status = getReportStatus(report);
  const statusText = getReportStatusText(report);

  return (
    status === 'new' ||
    status === 'pending' ||
    status === 'submitted' ||
    status === 'underreview' ||
    status === 'pendingreview' ||
    status === 'pendingadminapproval' ||
    status === 'awaitingadminreview' ||
    statusText.includes('قيد المراجعة') ||
    statusText.includes('بانتظار مراجعة الأدمن') ||
    statusText.includes('بانتظار المراجعة')
  );
}

function AdminReportStatusForm({
  report,
  onApprove,
  onReject,
}) {
  const [rejectionReason, setRejectionReason] = useState(report?.rejectionReason || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  const [formError, setFormError] = useState('');

  const showApproveAction = canApproveCitizenReport(report);
  const showManagementActions = Boolean(report) && !isTerminalReport(report);

  useEffect(() => {
    setRejectionReason(report?.rejectionReason || '');
    setFormError('');
  }, [report?.id, report?.rejectionReason]);

  if (!showManagementActions) {
    return null;
  }

  async function runAction(actionName, callback) {
    setIsSaving(true);
    setActiveAction(actionName);
    setFormError('');

    try {
      await callback?.();
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      setFormError(apiMessage || 'تعذر تنفيذ الإجراء. برجاء المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
      setActiveAction('');
    }
  }

  async function handleReject() {
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setFormError('سبب الرفض مطلوب قبل رفض البلاغ.');
      return;
    }

    await runAction('reject', () => onReject?.(trimmedReason));
  }

  return (
    <section className="admin-report-details-card admin-report-action-card">
      <header className="admin-report-card-header">
        <div>
          <h2>{showApproveAction ? 'مراجعة بلاغ المواطن' : 'إجراءات إدارة البلاغ'}</h2>
          <p>{showApproveAction ? 'Citizen Report Review' : 'Report Management Actions'}</p>
        </div>
      </header>

      <div className="admin-report-action-card__body">
        <div className="admin-report-current-status-block">
          <span>الحالة الحالية</span>
          <strong className={`admin-report-status admin-report-status--${report.statusTone}`}>
            {report.status}
          </strong>
        </div>

        <div className="admin-report-action-buttons admin-report-action-buttons--citizen-review">
          {showApproveAction ? (
            <button
              type="button"
              className="admin-report-action-button admin-report-action-button--approve"
              onClick={() => runAction('approve', onApprove)}
              disabled={isSaving}
            >
              <FiCheckCircle />
              {activeAction === 'approve' ? 'جاري الاعتماد...' : 'اعتماد البلاغ'}
            </button>
          ) : null}
        </div>

        <label className="admin-report-rejection-field">
          <span>سبب الرفض</span>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={3}
            placeholder="اكتب سببًا واضحًا قبل رفض البلاغ..."
          />
        </label>

        <button
          type="button"
          className="admin-report-action-button admin-report-action-button--reject"
          onClick={handleReject}
          disabled={isSaving}
        >
          <FiAlertTriangle />
          {activeAction === 'reject' ? 'جاري الرفض...' : 'رفض البلاغ'}
        </button>

        {formError ? <p className="admin-report-form-error">{formError}</p> : null}
      </div>
    </section>
  );
}

export default AdminReportStatusForm;
