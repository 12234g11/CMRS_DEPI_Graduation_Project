import { FiAlertTriangle, FiCheckCircle, FiSend, FiX } from 'react-icons/fi';

function DuplicateReportModal({
  duplicateReport,
  isSubmitting = false,
  onConfirmDuplicate,
  onCreateAnyway,
  onClose,
}) {
  if (!duplicateReport) return null;

  return (
    <div className="duplicate-report-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="duplicate-report-modal__backdrop"
        onClick={onClose}
        aria-label="إغلاق"
      />

      <article className="duplicate-report-modal__panel">
        <button
          type="button"
          className="duplicate-report-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
          disabled={isSubmitting}
        >
          <FiX />
        </button>

        <div className="duplicate-report-modal__icon">
          <FiAlertTriangle />
        </div>

        <header className="duplicate-report-modal__header">
          <h2>يوجد بلاغ مشابه بالفعل</h2>
          <p>
            {duplicateReport.message ||
              'تم العثور على بلاغ مشابه لنفس المشكلة.'}
          </p>
        </header>

        <div className="duplicate-report-modal__summary">
          <span>رقم البلاغ المشابه</span>
          <strong>{duplicateReport.id}</strong>

          {duplicateReport.title ? (
            <>
              <span>عنوان البلاغ</span>
              <strong>{duplicateReport.title}</strong>
            </>
          ) : null}
        </div>

        <footer className="duplicate-report-modal__actions">
          <button
            type="button"
            className="duplicate-report-modal__btn duplicate-report-modal__btn--primary"
            onClick={onConfirmDuplicate}
            disabled={isSubmitting}
          >
            <FiCheckCircle />
            {isSubmitting ? 'جاري التأكيد...' : 'متابعة البلاغ الموجود'}
          </button>

          <button
            type="button"
            className="duplicate-report-modal__btn duplicate-report-modal__btn--secondary"
            onClick={onCreateAnyway}
            disabled={isSubmitting}
          >
            <FiSend />
            إرسال كبلاغ جديد
          </button>
        </footer>
      </article>
    </div>
  );
}

export default DuplicateReportModal;