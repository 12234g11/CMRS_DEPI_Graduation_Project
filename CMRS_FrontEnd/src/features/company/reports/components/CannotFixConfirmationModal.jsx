import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiImage,
  FiShield,
  FiX,
  FiXCircle,
} from 'react-icons/fi';

function CannotFixConfirmationModal({
  isOpen,
  isLoading = false,
  report,
  reason,
  note,
  imagesCount = 0,
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

  const hasReason = Boolean(reason?.trim());
  const hasNote = Boolean(note?.trim());

  return createPortal(
    <div
      className="company-cannot-fix-confirmation-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose?.();
      }}
    >
      <section
        ref={modalRef}
        className="company-cannot-fix-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-cannot-fix-confirmation-title"
        aria-describedby="company-cannot-fix-confirmation-description"
        dir="rtl"
      >
        <header className="company-cannot-fix-confirmation-modal__header">
          <div className="company-cannot-fix-confirmation-modal__heading">
            <span className="company-cannot-fix-confirmation-modal__icon" aria-hidden="true">
              <FiXCircle />
            </span>
            <div>
              <span className="company-cannot-fix-confirmation-modal__eyebrow">إجراء يحتاج إلى تأكيد</span>
              <h3 id="company-cannot-fix-confirmation-title">تأكيد إرسال تعذر التنفيذ</h3>
            </div>
          </div>

          <button
            type="button"
            className="company-cannot-fix-confirmation-modal__close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="إغلاق نافذة التأكيد"
          >
            <FiX />
          </button>
        </header>

        <div className="company-cannot-fix-confirmation-modal__body">
          <p
            id="company-cannot-fix-confirmation-description"
            className="company-cannot-fix-confirmation-modal__description"
          >
            سيتم إرسال سبب التعذر والمرفقات إلى الأدمن للمراجعة قبل اتخاذ القرار المناسب على البلاغ.
          </p>

          <div className="company-cannot-fix-confirmation-modal__report">
            <span>البلاغ</span>
            <strong>{report?.title || 'بلاغ الشركة'}</strong>
            {report?.id ? <small dir="ltr">{report.id}</small> : null}
          </div>

          <div className="company-cannot-fix-confirmation-modal__summary">
            <article>
              <span className="company-cannot-fix-confirmation-modal__summary-icon is-danger">
                <FiAlertCircle />
              </span>
              <div>
                <small>سبب التعذر</small>
                <strong>{hasReason ? reason.trim() : 'غير محدد'}</strong>
              </div>
            </article>

            <article>
              <span className="company-cannot-fix-confirmation-modal__summary-icon is-success">
                <FiCheckCircle />
              </span>
              <div>
                <small>الحالة بعد الإرسال</small>
                <strong>بانتظار مراجعة الأدمن</strong>
              </div>
            </article>

            <article>
              <span className="company-cannot-fix-confirmation-modal__summary-icon">
                <FiFileText />
              </span>
              <div>
                <small>تفاصيل التعذر</small>
                <strong>{hasNote ? 'تمت إضافة تفاصيل واضحة' : 'بدون تفاصيل'}</strong>
              </div>
            </article>

            <article>
              <span className="company-cannot-fix-confirmation-modal__summary-icon">
                <FiImage />
              </span>
              <div>
                <small>الصور المرفقة</small>
                <strong>{imagesCount ? `${imagesCount} صورة` : 'لا توجد صور'}</strong>
              </div>
            </article>
          </div>

          <div className="company-cannot-fix-confirmation-modal__notice">
            <FiShield />
            <p>
              راجع البيانات جيدًا قبل الإرسال. بعد نجاح العملية سيتم إرسال الطلب للأدمن ومتابعته من خلال حالة البلاغ.
            </p>
          </div>

          {errorMessage ? (
            <div className="company-cannot-fix-confirmation-modal__error" role="alert">
              <FiAlertCircle />
              <span>{errorMessage}</span>
            </div>
          ) : null}
        </div>

        <footer className="company-cannot-fix-confirmation-modal__actions">
          <button
            type="button"
            className="company-cannot-fix-confirmation-modal__cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            رجوع ومراجعة البيانات
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className="company-cannot-fix-confirmation-modal__confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="company-cannot-fix-confirmation-modal__spinner" aria-hidden="true" />
            ) : (
              <FiXCircle />
            )}
            {isLoading ? 'جاري إرسال التعذر...' : 'تأكيد إرسال التعذر'}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export default CannotFixConfirmationModal;
