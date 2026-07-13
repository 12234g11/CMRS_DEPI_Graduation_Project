import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiBellOff, FiX } from 'react-icons/fi';

function UnfollowConfirmationModal({
  isOpen,
  reportTitle = '',
  isLoading = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isLoading) {
        onCancel?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, isOpen, onCancel]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="unfollow-confirmation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nearby-unfollow-confirmation-title"
      dir="rtl"
    >
      <button
        type="button"
        className="unfollow-confirmation__backdrop"
        onClick={() => !isLoading && onCancel?.()}
        aria-label="إغلاق نافذة تأكيد إلغاء المتابعة"
      />

      <section className="unfollow-confirmation__panel">
        <button
          type="button"
          className="unfollow-confirmation__close"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <div className="unfollow-confirmation__icon" aria-hidden="true">
          <FiAlertTriangle />
        </div>

        <div className="unfollow-confirmation__content">
          <span className="unfollow-confirmation__eyebrow">
            <FiBellOff />
            إلغاء المتابعة
          </span>
          <h2 id="nearby-unfollow-confirmation-title">
            هل تريد إلغاء متابعة هذا البلاغ؟
          </h2>
          <p>
            لن يظهر البلاغ ضمن البلاغات التي تتابعها، ولن تظل متابعًا لتحديثاته.
          </p>

          {reportTitle ? (
            <div className="unfollow-confirmation__report">
              <small>البلاغ المحدد</small>
              <strong>{reportTitle}</strong>
            </div>
          ) : null}
        </div>

        <div className="unfollow-confirmation__actions">
          <button
            type="button"
            className="unfollow-confirmation__cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            الرجوع
          </button>
          <button
            type="button"
            className="unfollow-confirmation__confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'جاري إلغاء المتابعة...' : 'تأكيد إلغاء المتابعة'}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default UnfollowConfirmationModal;
