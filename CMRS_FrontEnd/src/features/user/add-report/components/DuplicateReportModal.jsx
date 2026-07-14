import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertTriangle,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiImage,
  FiMapPin,
  FiSend,
  FiTag,
  FiUser,
  FiX,
  FiXCircle,
} from 'react-icons/fi';

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function formatDistance(distanceMeters) {
  const distance = Number(distanceMeters);

  if (!Number.isFinite(distance)) return '—';
  if (distance <= 5) return 'نفس الموقع تقريبًا';
  if (distance < 1000) return `${Math.round(distance)} متر`;

  return `${(distance / 1000).toFixed(distance < 10000 ? 1 : 0)} كم`;
}

function DuplicateReportModal({
  duplicateReport,
  isSubmitting = false,
  activeAction = '',
  actionError = '',
  actionMessage = '',
  onToggleFollow,
  onToggleVerify,
  onCreateAnyway,
  onClose,
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const images = useMemo(
    () =>
      Array.isArray(duplicateReport?.reportImages)
        ? duplicateReport.reportImages
        : [],
    [duplicateReport?.reportImages]
  );

  const isOwner = Boolean(duplicateReport?.isOwnedByCurrentUser);
  const currentVote = Number(duplicateReport?.currentUserVerifyVote || 0);
  const isUpvoted = currentVote === 1;
  const isDownvoted = currentVote === -1;
  const reportId = duplicateReport?.id;
  const isFollowLoading = activeAction === `follow:${reportId}`;
  const isUpvoteLoading = activeAction === `verify:${reportId}:1`;
  const isDownvoteLoading = activeAction === `verify:${reportId}:-1`;
  const isAnyActionRunning = Boolean(activeAction);
  const isBusy = isSubmitting || isAnyActionRunning;

  useEffect(() => {
    if (!duplicateReport) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event) {
      if (event.key !== 'Escape') return;

      if (activeImageIndex != null) {
        setActiveImageIndex(null);
        return;
      }

      if (!isBusy) {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeImageIndex, duplicateReport, isBusy, onClose]);

  useEffect(() => {
    setActiveImageIndex(null);
  }, [reportId]);

  if (!duplicateReport) return null;

  const activeImage =
    activeImageIndex != null ? images[activeImageIndex] || null : null;

  function showPreviousImage() {
    setActiveImageIndex((currentIndex) => {
      if (currentIndex == null || !images.length) return null;
      return (currentIndex - 1 + images.length) % images.length;
    });
  }

  function showNextImage() {
    setActiveImageIndex((currentIndex) => {
      if (currentIndex == null || !images.length) return null;
      return (currentIndex + 1) % images.length;
    });
  }

  return (
    <div className="duplicate-report-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="duplicate-report-modal__backdrop"
        onClick={() => {
          if (!isBusy) onClose?.();
        }}
        aria-label="إغلاق"
      />

      <article className="duplicate-report-modal__panel">
        <button
          type="button"
          className="duplicate-report-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
          disabled={isBusy}
        >
          <FiX />
        </button>

        <header className="duplicate-report-modal__hero">
          <div className="duplicate-report-modal__icon">
            <FiAlertTriangle />
          </div>

          <div className="duplicate-report-modal__header">
            <span className="duplicate-report-modal__eyebrow">
              راجع البلاغ قبل الاستكمال
            </span>
            <h2>تم العثور على بلاغ مشابه في نفس المنطقة</h2>
            <p>
              افحص بيانات وصور البلاغ الموجود أولًا. لو كانت نفس المشكلة، تفاعل
              مع البلاغ الحالي بدل إنشاء بلاغ جديد.
            </p>
          </div>
        </header>

        <section className="duplicate-report-modal__report-card">
          <div className="duplicate-report-modal__report-heading">
            <div>
              <span className="duplicate-report-modal__status">
                {duplicateReport.statusLabel || 'غير محدد'}
              </span>
              <h3>{duplicateReport.title}</h3>
            </div>

            <span className="duplicate-report-modal__distance">
              <FiMapPin />
              {formatDistance(duplicateReport.distanceMeters)}
            </span>
          </div>

          {duplicateReport.description ? (
            <p className="duplicate-report-modal__description">
              {duplicateReport.description}
            </p>
          ) : null}

          <div className="duplicate-report-modal__info-grid">
            <div className="duplicate-report-modal__info-item">
              <FiUser />
              <span>مقدم البلاغ</span>
              <strong>{duplicateReport.ownerUserName || '—'}</strong>
            </div>

            <div className="duplicate-report-modal__info-item">
              <FiTag />
              <span>فئة البلاغ</span>
              <strong>{duplicateReport.issueCategoryName || 'أخرى'}</strong>
            </div>

            <div className="duplicate-report-modal__info-item">
              <FiAlertTriangle />
              <span>الأولوية</span>
              <strong>{duplicateReport.priorityLabel || '—'}</strong>
            </div>

            <div className="duplicate-report-modal__info-item">
              <FiCalendar />
              <span>تاريخ البلاغ</span>
              <strong>{formatDate(duplicateReport.createdAt)}</strong>
            </div>
          </div>

          <div className="duplicate-report-modal__address">
            <FiMapPin />
            <div>
              <span>موقع البلاغ</span>
              <strong>{duplicateReport.address || 'لم يتم تحديد العنوان'}</strong>
            </div>
          </div>

          <div className="duplicate-report-modal__report-number">
            <span>رقم البلاغ</span>
            <strong>{duplicateReport.reportNumber || duplicateReport.id}</strong>
          </div>
        </section>

        <section className="duplicate-report-modal__images-section">
          <div className="duplicate-report-modal__section-heading">
            <div>
              <FiImage />
              <span>
                <strong>صور البلاغ الموجود</strong>
                <small>قارن الصور بالمشكلة التي تحاول الإبلاغ عنها.</small>
              </span>
            </div>
            <em>{images.length} صورة</em>
          </div>

          {images.length ? (
            <div className="duplicate-report-modal__images-grid">
              {images.map((image, index) => (
                <button
                  type="button"
                  className="duplicate-report-modal__image-card"
                  key={image.id || `${image.fullImageUrl}-${index}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img
                    src={image.fullImageUrl || image.imageUrl}
                    alt={`صورة البلاغ ${index + 1}`}
                    loading="lazy"
                  />
                  <span>
                    <FiEye />
                    عرض الصورة
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="duplicate-report-modal__empty-images">
              <FiImage />
              <span>لا توجد صور مرفقة بالبلاغ الحالي.</span>
            </div>
          )}
        </section>

        <section className="duplicate-report-modal__community-section">
          <div className="duplicate-report-modal__section-heading">
            <div>
              <FiCheckCircle />
              <span>
                <strong>هل هذا هو نفس البلاغ؟</strong>
                <small>اختر الإجراء المناسب بدل تكرار البلاغ.</small>
              </span>
            </div>
          </div>

          {isOwner ? (
            <div className="duplicate-report-modal__owner-notice">
              <FiUser />
              <div>
                <strong>هذا البلاغ مضاف من حسابك</strong>
                <span>
                  لا يمكنك متابعة أو تصديق أو تكذيب بلاغك الشخصي، لكن يمكنك
                  مراجعة بياناته وصوره.
                </span>
              </div>
            </div>
          ) : null}

          <div className="duplicate-report-modal__community-actions">
            <button
              type="button"
              className={`duplicate-report-modal__community-btn is-follow ${
                duplicateReport.isFollowedByCurrentUser ? 'is-active' : ''
              }`}
              onClick={onToggleFollow}
              disabled={isOwner || isAnyActionRunning || isSubmitting}
            >
              <span className="duplicate-report-modal__community-count">
                {duplicateReport.followersCount ?? 0}
              </span>
              <FiBell />
              <strong>
                {isFollowLoading
                  ? 'جاري التحديث...'
                  : duplicateReport.isFollowedByCurrentUser
                    ? 'إلغاء المتابعة'
                    : 'متابعة'}
              </strong>
            </button>

            <button
              type="button"
              className={`duplicate-report-modal__community-btn is-upvote ${
                isUpvoted ? 'is-active' : ''
              }`}
              onClick={() => onToggleVerify?.(1)}
              disabled={isOwner || isAnyActionRunning || isSubmitting}
            >
              <span className="duplicate-report-modal__community-count">
                {duplicateReport.upvoteCount ?? 0}
              </span>
              <FiCheckCircle />
              <strong>
                {isUpvoteLoading
                  ? 'جاري التحديث...'
                  : isUpvoted
                    ? 'إلغاء التصديق'
                    : 'تصديق'}
              </strong>
            </button>

            <button
              type="button"
              className={`duplicate-report-modal__community-btn is-downvote ${
                isDownvoted ? 'is-active' : ''
              }`}
              onClick={() => onToggleVerify?.(-1)}
              disabled={isOwner || isAnyActionRunning || isSubmitting}
            >
              <span className="duplicate-report-modal__community-count">
                {duplicateReport.downvoteCount ?? 0}
              </span>
              <FiXCircle />
              <strong>
                {isDownvoteLoading
                  ? 'جاري التحديث...'
                  : isDownvoted
                    ? 'إلغاء التكذيب'
                    : 'تكذيب'}
              </strong>
            </button>
          </div>

          {actionMessage ? (
            <p className="duplicate-report-modal__feedback is-success">
              <FiCheckCircle />
              {actionMessage}
            </p>
          ) : null}

          {actionError ? (
            <p className="duplicate-report-modal__feedback is-error">
              <FiAlertTriangle />
              {actionError}
            </p>
          ) : null}
        </section>

        <footer className="duplicate-report-modal__decision">
          <div>
            <strong>المشكلة التي تبلغ عنها مختلفة؟</strong>
            <span>
              استكمل فقط بعد التأكد أن الصور والموقع والتفاصيل لا تخص نفس
              المشكلة.
            </span>
          </div>

          <div className="duplicate-report-modal__actions">
            <button
              type="button"
              className="duplicate-report-modal__btn duplicate-report-modal__btn--secondary"
              onClick={onClose}
              disabled={isBusy}
            >
              مراجعة بياناتي
            </button>

            <button
              type="button"
              className="duplicate-report-modal__btn duplicate-report-modal__btn--primary"
              onClick={onCreateAnyway}
              disabled={isBusy}
            >
              <FiSend />
              {isSubmitting
                ? 'جاري إضافة البلاغ...'
                : 'استكمال وإضافة بلاغ جديد'}
            </button>
          </div>
        </footer>
      </article>

      {activeImage ? (
        <div className="duplicate-report-modal__viewer" role="dialog">
          <button
            type="button"
            className="duplicate-report-modal__viewer-backdrop"
            onClick={() => setActiveImageIndex(null)}
            aria-label="إغلاق معاينة الصورة"
          />

          <div className="duplicate-report-modal__viewer-panel">
            <button
              type="button"
              className="duplicate-report-modal__viewer-close"
              onClick={() => setActiveImageIndex(null)}
              aria-label="إغلاق"
            >
              <FiX />
            </button>

            {images.length > 1 ? (
              <button
                type="button"
                className="duplicate-report-modal__viewer-nav is-previous"
                onClick={showPreviousImage}
                aria-label="الصورة السابقة"
              >
                <FiChevronLeft />
              </button>
            ) : null}

            <img
              src={activeImage.fullImageUrl || activeImage.imageUrl}
              alt={`صورة البلاغ ${activeImageIndex + 1}`}
            />

            {images.length > 1 ? (
              <button
                type="button"
                className="duplicate-report-modal__viewer-nav is-next"
                onClick={showNextImage}
                aria-label="الصورة التالية"
              >
                <FiChevronRight />
              </button>
            ) : null}

            <span className="duplicate-report-modal__viewer-count">
              {activeImageIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DuplicateReportModal;
