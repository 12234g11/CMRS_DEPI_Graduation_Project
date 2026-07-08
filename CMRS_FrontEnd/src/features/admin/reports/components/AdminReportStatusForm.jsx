import { useState } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiLock,
} from 'react-icons/fi';

function getStatusText(report) {
  return `${report?.statusValue || ''} ${report?.statusLabel || ''} ${report?.status || ''}`.toLowerCase();
}

function shouldShowCitizenReviewActions(report) {
  const status = getStatusText(report);

  return (
    status.includes('underreview') ||
    status.includes('under review') ||
    status.includes('pending') ||
    status.includes('new') ||
    status.includes('قيد المراجعة') ||
    status.includes('بانتظار المراجعة')
  );
}

function AdminReportStatusForm({
  report,
  onApprove,
  onReject,
  onCloseReport,
}) {
  const [rejectionReason, setRejectionReason] = useState(report.rejectionReason || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  const [formError, setFormError] = useState('');

  const canReviewCitizenReport = shouldShowCitizenReviewActions(report);

  if (!canReviewCitizenReport) {
    return null;
  }

  async function runAction(actionName, callback) {
    setIsSaving(true);
    setActiveAction(actionName);
    setFormError('');

    try {
      await callback?.();
    } catch {
      setFormError('تعذر تنفيذ الإجراء. برجاء المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
      setActiveAction('');
    }
  }

  async function handleReject() {
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setFormError('سبب الرفض مطلوب قبل رفض بلاغ المواطن.');
      return;
    }

    await runAction('reject', () => onReject?.(trimmedReason));
  }

  return (
    <section className="admin-report-details-card admin-report-action-card">
      <header className="admin-report-card-header">
        <div>
          <h2>مراجعة بلاغ المواطن</h2>
          <p>Citizen Report Review</p>
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
          <button
            type="button"
            className="admin-report-action-button admin-report-action-button--approve"
            onClick={() => runAction('approve', onApprove)}
            disabled={isSaving}
          >
            <FiCheckCircle />
            {activeAction === 'approve' ? 'جاري الاعتماد...' : 'اعتماد البلاغ'}
          </button>

          <button
            type="button"
            className="admin-report-action-button admin-report-action-button--close"
            onClick={() => runAction('close', onCloseReport)}
            disabled={isSaving}
          >
            <FiLock />
            {activeAction === 'close' ? 'جاري الإغلاق...' : 'إغلاق بدون عقوبة'}
          </button>
        </div>

        <label className="admin-report-rejection-field">
          <span>سبب الرفض</span>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={3}
            placeholder="اكتب سبب واضح قبل رفض بلاغ المواطن..."
          />
        </label>

        <button
          type="button"
          className="admin-report-action-button admin-report-action-button--reject"
          onClick={handleReject}
          disabled={isSaving}
        >
          <FiAlertTriangle />
          {activeAction === 'reject' ? 'جاري الرفض...' : 'رفض بلاغ المواطن'}
        </button>

        {formError ? <p className="admin-report-form-error">{formError}</p> : null}
      </div>
    </section>
  );
}

export default AdminReportStatusForm;
