import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiArchive, FiRotateCcw, FiX } from 'react-icons/fi';

const ARCHIVABLE_STATUS_VALUES = new Set([
  'resolved',
  'unabletoexecute',
  'rejected',
]);

function normalizeStatus(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function canArchiveReport(report = {}) {
  const statusValues = [
    report.statusValue,
    report.statusLabel,
    report.status,
  ];

  if (statusValues.some((value) => ARCHIVABLE_STATUS_VALUES.has(normalizeStatus(value)))) {
    return true;
  }

  const statusText = statusValues.join(' ').toLowerCase();

  return (
    statusText.includes('تم الحل') ||
    statusText.includes('متعذر التنفيذ') ||
    statusText.includes('مرفوض')
  );
}

function getApiErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;

  return (
    responseData?.message ||
    responseData?.title ||
    error?.message ||
    fallbackMessage
  );
}

function AdminReportArchiveCard({ report, onArchive, onUnarchive }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isArchived = Boolean(report?.isArchived);
  const isArchivable = useMemo(() => canArchiveReport(report), [report]);

  useEffect(() => {
    setIsConfirmOpen(false);
    setIsSaving(false);
    setErrorMessage('');
  }, [
    report?.id,
    report?.isArchived,
    report?.statusValue,
    report?.statusLabel,
    report?.status,
  ]);

  useEffect(() => {
    if (!isConfirmOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event) {
      if (event.key === 'Escape' && !isSaving) {
        setIsConfirmOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isConfirmOpen, isSaving]);

  function handleOpenConfirmation() {
    setErrorMessage('');

    if (!isArchived && !isArchivable) {
      setErrorMessage(
        'لا يمكن إضافة هذا البلاغ إلى الأرشيف. يمكن أرشفة البلاغات التي حالتها تم الحل أو متعذر التنفيذ أو مرفوض فقط.',
      );
      return;
    }

    setIsConfirmOpen(true);
  }

  async function handleConfirm() {
    setIsSaving(true);
    setErrorMessage('');

    try {
      if (isArchived) {
        await onUnarchive?.();
      } else {
        await onArchive?.();
      }
      setIsConfirmOpen(false);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isArchived
            ? 'تعذر إخراج البلاغ من الأرشيف. برجاء المحاولة مرة أخرى.'
            : 'تعذر إضافة البلاغ إلى الأرشيف. برجاء المحاولة مرة أخرى.',
        ),
      );
      setIsConfirmOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section
        className={`admin-report-details-card admin-report-archive-card ${
          isArchived ? 'is-archived' : ''
        }`}
      >
        <div className="admin-report-archive-card__content">
          <span className="admin-report-archive-card__icon" aria-hidden="true">
            {isArchived ? <FiArchive /> : <FiArchive />}
          </span>

          <div>
            <h2>{isArchived ? 'البلاغ موجود في الأرشيف' : 'أرشفة البلاغ'}</h2>

            {isArchived ? (
              <p>
                تمت أرشفة البلاغ
                {report.archivedAtLabel && report.archivedAtLabel !== '-'
                  ? ` في ${report.archivedAtLabel}`
                  : ''}
                {report.archivedBy?.name ? ` بواسطة ${report.archivedBy.name}` : ''}.
              </p>
            ) : isArchivable ? (
              <p>
                حالة البلاغ نهائية، ويمكن نقله إلى الأرشيف لإزالته من قائمة البلاغات
                العادية مع الاحتفاظ بجميع بياناته.
              </p>
            ) : (
              <p>
                الأرشفة متاحة فقط للبلاغات التي حالتها تم الحل أو متعذر التنفيذ أو
                مرفوض.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`admin-report-archive-card__action ${
            isArchived ? 'is-unarchive' : 'is-archive'
          }`}
          onClick={handleOpenConfirmation}
          disabled={isSaving}
        >
          {isArchived ? <FiRotateCcw /> : <FiArchive />}
          {isArchived ? 'إخراج من الأرشيف' : 'إضافة إلى الأرشيف'}
        </button>

        {errorMessage ? (
          <div className="admin-report-archive-card__error" role="alert">
            <FiAlertCircle />
            <span>{errorMessage}</span>
          </div>
        ) : null}
      </section>

      {isConfirmOpen ? (
        <div className="admin-report-archive-modal-backdrop" role="presentation">
          <button
            type="button"
            className="admin-report-archive-modal-backdrop__close-area"
            onClick={() => !isSaving && setIsConfirmOpen(false)}
            aria-label="إغلاق نافذة التأكيد"
          />

          <section
            className="admin-report-archive-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-report-archive-modal-title"
          >
            <button
              type="button"
              className="admin-report-archive-modal__close"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSaving}
              aria-label="إغلاق"
            >
              <FiX />
            </button>

            <span className="admin-report-archive-modal__icon" aria-hidden="true">
              {isArchived ? <FiRotateCcw /> : <FiArchive />}
            </span>

            <h2 id="admin-report-archive-modal-title">
              {isArchived ? 'تأكيد إخراج البلاغ من الأرشيف' : 'تأكيد إضافة البلاغ إلى الأرشيف'}
            </h2>

            <p>
              {isArchived
                ? 'سيعود البلاغ إلى قائمة إدارة البلاغات بنفس حالته وجميع بياناته الحالية.'
                : 'سيختفي البلاغ من قائمة إدارة البلاغات ويظهر داخل صفحة أرشيف البلاغات.'}
            </p>

            <div className="admin-report-archive-modal__actions">
              <button
                type="button"
                className="admin-report-archive-modal__cancel"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSaving}
              >
                إلغاء
              </button>

              <button
                type="button"
                className="admin-report-archive-modal__confirm"
                onClick={handleConfirm}
                disabled={isSaving}
              >
                {isSaving
                  ? 'جاري التنفيذ...'
                  : isArchived
                    ? 'تأكيد الاسترجاع'
                    : 'تأكيد الأرشفة'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default AdminReportArchiveCard;
