import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

function UnfollowConfirmationModal({
  isOpen,
  reportTitle = '',
  isLoading = false,
  onCancel,
  onConfirm,
}) {
  const [portalHost, setPortalHost] = useState(null);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      setPortalHost(null);
      return undefined;
    }

    const host = document.createElement('div');
    host.className = 'unfollow-confirmation-portal';
    host.setAttribute('data-unfollow-confirmation-portal', 'true');
    document.body.appendChild(host);
    setPortalHost(host);

    return () => {
      host.remove();
    };
  }, [isOpen]);

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

  if (!isOpen || !portalHost || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="unfollow-confirmation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="followed-unfollow-confirmation-title"
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
            <FiTrash2 />
            إلغاء المتابعة
          </span>
          <h2 id="followed-unfollow-confirmation-title">
            هل تريد إزالة هذا البلاغ من البلاغات المتابَعة؟
          </h2>
          <p>
            بعد التأكيد سيتم إلغاء المتابعة، وسيُحذف البلاغ من هذه الصفحة ومن
            جدول وخريطة البلاغات المتابَعة.
          </p>

          <div className="unfollow-confirmation__notice">
            يمكنك متابعة البلاغ مرة أخرى من صفحة «مشاكل قريبة منك» طالما ظل
            ضمن الحالات والنطاق المسموح بهما.
          </div>

          {reportTitle ? (
            <div className="unfollow-confirmation__report">
              <small>البلاغ الذي سيتم إزالته</small>
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
            الاحتفاظ بالبلاغ
          </button>
          <button
            type="button"
            className="unfollow-confirmation__confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'جاري إلغاء المتابعة...' : 'إلغاء المتابعة وإزالته'}
          </button>
        </div>
      </section>
    </div>,
    portalHost
  );
}

export default UnfollowConfirmationModal;
