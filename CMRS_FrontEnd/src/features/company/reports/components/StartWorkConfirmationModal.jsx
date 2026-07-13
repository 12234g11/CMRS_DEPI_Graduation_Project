import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiPlayCircle,
  FiUsers,
  FiX,
} from 'react-icons/fi';

function StartWorkConfirmationModal({
  isOpen,
  isLoading = false,
  isResume = false,
  report,
  teamName,
  note,
  errorMessage = '',
  onClose,
  onConfirm,
}) {
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;

    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 0);

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isLoading) {
        onClose?.();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus?.();
    };
  }, [isLoading, isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const hasNote = Boolean(note?.trim());
  const modalTitle = isResume ? 'تأكيد استئناف التنفيذ' : 'تأكيد بدء التنفيذ';
  const confirmText = isResume ? 'تأكيد الاستئناف' : 'تأكيد بدء التنفيذ';
  const loadingText = isResume ? 'جاري استئناف التنفيذ...' : 'جاري بدء التنفيذ...';

  return createPortal(
    <div
      className="company-start-confirmation-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose?.();
      }}
    >
      <section
        ref={modalRef}
        className="company-start-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-start-confirmation-title"
        aria-describedby="company-start-confirmation-description"
        dir="rtl"
      >
        <header className="company-start-confirmation-modal__header">
          <div className="company-start-confirmation-modal__heading">
            <span className="company-start-confirmation-modal__icon" aria-hidden="true">
              <FiPlayCircle />
            </span>
            <div>
              <span className="company-start-confirmation-modal__eyebrow">إجراء يحتاج إلى تأكيد</span>
              <h3 id="company-start-confirmation-title">{modalTitle}</h3>
            </div>
          </div>

          <button
            type="button"
            className="company-start-confirmation-modal__close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="إغلاق نافذة التأكيد"
          >
            <FiX />
          </button>
        </header>

        <div className="company-start-confirmation-modal__body">
          <p
            id="company-start-confirmation-description"
            className="company-start-confirmation-modal__description"
          >
            {isResume
              ? 'سيتم استئناف العمل على البلاغ وتحويل حالته إلى جاري التنفيذ مرة أخرى.'
              : 'سيتم بدء العمل على البلاغ وتحويل حالته من تم التعيين إلى جاري التنفيذ.'}
          </p>

          <div className="company-start-confirmation-modal__report">
            <span>البلاغ</span>
            <strong>{report?.title || 'بلاغ الشركة'}</strong>
            {report?.id ? <small dir="ltr">{report.id}</small> : null}
          </div>

          <div className="company-start-confirmation-modal__summary">
            <article>
              <span className="company-start-confirmation-modal__summary-icon">
                <FiUsers />
              </span>
              <div>
                <small>الفريق المسؤول</small>
                <strong>{teamName || 'لم يتم تحديد الفريق'}</strong>
              </div>
            </article>

            <article>
              <span className="company-start-confirmation-modal__summary-icon is-success">
                <FiCheckCircle />
              </span>
              <div>
                <small>الحالة بعد التأكيد</small>
                <strong>جاري التنفيذ</strong>
              </div>
            </article>

            <article>
              <span className="company-start-confirmation-modal__summary-icon">
                <FiFileText />
              </span>
              <div>
                <small>ملاحظة البداية</small>
                <strong>{hasNote ? 'تمت إضافة ملاحظة' : 'بدون ملاحظة'}</strong>
              </div>
            </article>

          </div>

          <div className="company-start-confirmation-modal__notice">
            <FiAlertCircle />
            <p>
              تأكد من جاهزية الفريق قبل المتابعة. بعد نجاح العملية ستظهر الحالة الجديدة في تفاصيل البلاغ وجدول البلاغات.
            </p>
          </div>

          {errorMessage ? (
            <div className="company-start-confirmation-modal__error" role="alert">
              <FiAlertCircle />
              <span>{errorMessage}</span>
            </div>
          ) : null}
        </div>

        <footer className="company-start-confirmation-modal__actions">
          <button
            type="button"
            className="company-start-confirmation-modal__cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            رجوع ومراجعة البيانات
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className="company-start-confirmation-modal__confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="company-start-confirmation-modal__spinner" aria-hidden="true" />
            ) : (
              <FiPlayCircle />
            )}
            {isLoading ? loadingText : confirmText}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export default StartWorkConfirmationModal;
