import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiInfo,
  FiX,
  FiXCircle,
} from 'react-icons/fi';

function formatDate(value) {
  if (!value) return '—';

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsedDate);
}

function getImageUrl(image) {
  if (typeof image === 'string') return image;

  return image?.fullImageUrl || image?.imageUrl || image?.url || '';
}

function NearbyIssueImagePreview({ images = [], activeIndex, onClose, onChange }) {
  const activeImage = images[activeIndex];
  const activeImageUrl = getImageUrl(activeImage);
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!activeImageUrl) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (!hasMultipleImages) return;

      if (event.key === 'ArrowLeft') {
        onChange((activeIndex + 1) % images.length);
      }

      if (event.key === 'ArrowRight') {
        onChange((activeIndex - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImageUrl, activeIndex, hasMultipleImages, images.length, onChange, onClose]);

  if (!activeImageUrl || typeof document === 'undefined') return null;

  const showPreviousImage = () => {
    onChange((activeIndex - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    onChange((activeIndex + 1) % images.length);
  };

  return createPortal(
    <div
      className="nearby-image-preview"
      role="dialog"
      aria-modal="true"
      aria-label="معاينة صورة البلاغ"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="nearby-image-preview__dialog">
        <div className="nearby-image-preview__header">
          <div>
            <strong>صورة البلاغ</strong>
            <span>
              الصورة {activeIndex + 1} من {images.length}
            </span>
          </div>

          <button
            type="button"
            className="nearby-image-preview__close"
            onClick={onClose}
            aria-label="إغلاق معاينة الصورة"
          >
            <FiX />
          </button>
        </div>

        <div className="nearby-image-preview__stage">
          {hasMultipleImages ? (
            <button
              type="button"
              className="nearby-image-preview__nav nearby-image-preview__nav--previous"
              onClick={showPreviousImage}
              aria-label="الصورة السابقة"
            >
              <FiChevronRight />
            </button>
          ) : null}

          <img
            src={activeImageUrl}
            alt={`صورة البلاغ ${activeIndex + 1}`}
          />

          {hasMultipleImages ? (
            <button
              type="button"
              className="nearby-image-preview__nav nearby-image-preview__nav--next"
              onClick={showNextImage}
              aria-label="الصورة التالية"
            >
              <FiChevronLeft />
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}


function getPublicExecutionOutcome(issue = {}) {
  const execution = issue.executionInfo || {};
  const statusKey = String(issue.statusKey || issue.status || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
  const decisionType = String(execution.decisionType || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

  if (
    statusKey.includes('unabletoexecute') ||
    decisionType.includes('acceptcannotfix') ||
    decisionType.includes('cannotfixaccepted')
  ) {
    return {
      tone: 'unable',
      icon: <FiAlertTriangle />,
      title: execution.decisionLabel || 'تم إغلاق البلاغ لتعذر التنفيذ',
      message: execution.publicMessage || 'لا توجد بيانات للعرض',
      reason: execution.unableToExecuteReason || 'لا توجد بيانات للعرض',
      meta: execution.unableToExecuteAt
        ? `تاريخ القرار: ${formatDate(execution.unableToExecuteAt)}`
        : 'تاريخ القرار: لا توجد بيانات للعرض',
    };
  }

  if (statusKey.includes('pendingadminapproval')) {
    return {
      tone: 'pending',
      icon: <FiInfo />,
      title: 'بانتظار مراجعة الإدارة',
      message:
        'تراجع الإدارة رد جهة التنفيذ قبل اعتماد القرار النهائي.',
    };
  }

  return null;
}

function NearbyIssueDetails({
  issue,
  currentLocation = null,
  onRequestDirections,
  onClearSelection,
  onToggleFollow,
  onToggleVerify,
  activeAction = '',
  inline = false,
}) {
  const [previewImageIndex, setPreviewImageIndex] = useState(null);

  const reportImages = useMemo(
    () =>
      (Array.isArray(issue?.reportImages) ? issue.reportImages : []).filter(
        (image) => Boolean(getImageUrl(image))
      ),
    [issue?.reportImages]
  );

  useEffect(() => {
    setPreviewImageIndex(null);
  }, [issue?.reportId, issue?.id]);

  if (!issue) return null;

  const hasCurrentLocation = Boolean(
    currentLocation?.lat && currentLocation?.lng
  );

  const reportId = issue.reportId || issue.id;
  const currentVerifyVote = Number(issue.currentUserVerifyVote || 0);
  const isPositiveVerified =
    issue.isVerifiedByCurrentUser && currentVerifyVote !== -1;
  const isNegativeVerified =
    issue.isVerifiedByCurrentUser && currentVerifyVote === -1;

  const isFollowLoading = activeAction === `follow:${reportId}`;
  const isVerifyUpLoading = activeAction === `verify:${reportId}:1`;
  const isVerifyDownLoading = activeAction === `verify:${reportId}:-1`;

  const canToggleFollow =
    issue.canCurrentUserFollow !== false || issue.isFollowedByCurrentUser;

  const canToggleVerify =
    issue.canCurrentUserVerify !== false || issue.isVerifiedByCurrentUser;
  const executionOutcome = getPublicExecutionOutcome(issue);

  const handleRouteClick = () => {
    if (!hasCurrentLocation) {
      window.alert(
        'فعّل موقعك الحالي الأول من زر تحديد الموقع الموجود على الخريطة، وبعدها اضغط عرض أقصر طريق.'
      );
      return;
    }

    onRequestDirections?.(issue);
  };

  return (
    <div
      className={`nearby-issue-details ${
        inline ? 'nearby-issue-details--inline' : ''
      }`}
    >
      <div className="nearby-issue-details__header">
        <div>
          <h3>{issue.title}</h3>
          <p>{issue.area}</p>
        </div>

        <span
          className={`nearby-issue-details__status nearby-issue-details__status--${issue.statusColorClass || issue.tone}`}
        >
          {issue.statusLabel}
        </span>
      </div>

      <p className="nearby-issue-details__description">
        {issue.description}
      </p>

      {executionOutcome ? (
        <section
          className={`nearby-issue-details__execution-outcome is-${executionOutcome.tone}`}
        >
          <span>{executionOutcome.icon}</span>
          <div>
            <strong>{executionOutcome.title}</strong>
            <p>{executionOutcome.message}</p>
            {executionOutcome.reason ? (
              <small>سبب التعذر: {executionOutcome.reason}</small>
            ) : null}
            {executionOutcome.meta ? <small>{executionOutcome.meta}</small> : null}
          </div>
        </section>
      ) : null}

      <div className="nearby-issue-details__grid">
        <div className="nearby-issue-details__item">
          <span>رقم البلاغ</span>
          <strong>{issue.reportNumber || reportId}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>المسافة</span>
          <strong>{issue.distanceLabel || issue.distance || '—'}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>تاريخ الإبلاغ</span>
          <strong>
            {formatDate(issue.reportedAt || issue.createdAt || issue.date)}
          </strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>الفئة</span>
          <strong>{issue.category || issue.issueCategoryName || 'أخرى'}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>الأولوية</span>
          <strong>{issue.priorityLabel || issue.priority || '—'}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>مقدم البلاغ</span>
          <strong>{issue.ownerUserName || '—'}</strong>
        </div>
      </div>

      <div className="nearby-issue-details__address">
        <span>العنوان التفصيلي</span>
        <strong>{issue.address || 'لم يتم تحديد العنوان'}</strong>
      </div>

      {reportImages.length ? (
        <div className="nearby-issue-details__media">
          <div className="nearby-issue-details__media-heading">
            <strong>صور البلاغ</strong>
            <span>مرّر على الصورة لمعاينتها أو افتحها بالحجم الكامل</span>
          </div>

          <div className="nearby-issue-details__images">
            {reportImages.map((image, imageIndex) => {
              const imageUrl = getImageUrl(image);
              const imageKey =
                typeof image === 'string'
                  ? `${image}-${imageIndex}`
                  : image.imageId || image.id || `${imageUrl}-${imageIndex}`;

              return (
                <div className="nearby-issue-details__image-card" key={imageKey}>
                  <img
                    src={imageUrl}
                    alt={`${issue.title} - صورة ${imageIndex + 1}`}
                    loading="lazy"
                  />

                  <div className="nearby-issue-details__image-overlay">
                    <button
                      type="button"
                      className="nearby-issue-details__image-view-btn"
                      onClick={() => setPreviewImageIndex(imageIndex)}
                      aria-label={`عرض صورة البلاغ ${imageIndex + 1} بالحجم الكامل`}
                    >
                      <FiEye aria-hidden="true" />
                      <span>عرض الصورة كاملة</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="nearby-issue-details__community">
        <button
          type="button"
          className={`nearby-issue-details__community-btn nearby-issue-details__community-btn--follow ${
            issue.isFollowedByCurrentUser ? 'is-active' : ''
          }`}
          onClick={() => onToggleFollow?.(issue)}
          disabled={!canToggleFollow || isFollowLoading}
          title={issue.isFollowedByCurrentUser ? 'إلغاء متابعة البلاغ' : 'متابعة البلاغ'}
        >
          <span className="nearby-issue-details__community-icon" aria-hidden="true">
            <FiBell />
          </span>

          <span className="nearby-issue-details__community-content">
            <strong>{issue.isFollowedByCurrentUser ? 'إلغاء المتابعة' : 'متابعة'}</strong>
            <small>
              <span className="nearby-issue-details__community-count">
                {issue.followersCount ?? 0}
              </span>
              متابع
            </small>
          </span>
        </button>

        <button
          type="button"
          className={`nearby-issue-details__community-btn nearby-issue-details__community-btn--upvote ${
            isPositiveVerified ? 'is-active' : ''
          }`}
          onClick={() => onToggleVerify?.(issue, 1)}
          disabled={!canToggleVerify || isVerifyUpLoading}
          title={isPositiveVerified ? 'إلغاء تصديق البلاغ' : 'البلاغ صحيح'}
        >
          <span className="nearby-issue-details__community-icon" aria-hidden="true">
            <FiCheckCircle />
          </span>

          <span className="nearby-issue-details__community-content">
            <strong>{isPositiveVerified ? 'إلغاء التصديق' : 'البلاغ صحيح'}</strong>
            <small>
              <span className="nearby-issue-details__community-count">
                {issue.upvoteCount ?? 0}
              </span>
              تصديق
            </small>
          </span>
        </button>

        <button
          type="button"
          className={`nearby-issue-details__community-btn nearby-issue-details__community-btn--downvote ${
            isNegativeVerified ? 'is-active' : ''
          }`}
          onClick={() => onToggleVerify?.(issue, -1)}
          disabled={!canToggleVerify || isVerifyDownLoading}
          title={isNegativeVerified ? 'إلغاء تكذيب البلاغ' : 'البلاغ غير صحيح'}
        >
          <span className="nearby-issue-details__community-icon" aria-hidden="true">
            <FiXCircle />
          </span>

          <span className="nearby-issue-details__community-content">
            <strong>{isNegativeVerified ? 'إلغاء عدم الصحة' : 'البلاغ غير صحيح'}</strong>
            <small>
              <span className="nearby-issue-details__community-count">
                {issue.downvoteCount ?? 0}
              </span>
              تكذيب
            </small>
          </span>
        </button>
      </div>

      <div className="nearby-issue-details__actions">
        <button
          type="button"
          className="nearby-issue-details__route-btn"
          onClick={handleRouteClick}
        >
          عرض أقصر طريق من موقعك الحالي
        </button>

        {!hasCurrentLocation && (
          <p className="nearby-issue-details__helper-text">
            فعّل موقعك الحالي من زر الخريطة ليتم حساب المسار والمسافة الدقيقة.
          </p>
        )}

        <button
          type="button"
          className="nearby-issue-details__clear-btn"
          onClick={() => onClearSelection?.()}
        >
          إلغاء تحديد المشكلة
        </button>
      </div>

      {previewImageIndex !== null ? (
        <NearbyIssueImagePreview
          images={reportImages}
          activeIndex={previewImageIndex}
          onClose={() => setPreviewImageIndex(null)}
          onChange={setPreviewImageIndex}
        />
      ) : null}
    </div>
  );
}

export default NearbyIssueDetails;
