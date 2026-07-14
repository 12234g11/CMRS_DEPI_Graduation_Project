import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiActivity,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiFileText,
  FiImage,
  FiInfo,
  FiMapPin,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from 'react-icons/fi';

import ReportStatusBadge from '../../reports/components/ReportStatusBadge';

function formatDate(value, includeTime = false) {
  if (!value) return '—';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {}),
  }).format(parsedDate);
}

function DetailBlock({ icon, label, children, className = '' }) {
  return (
    <div className={`user-report-modal__detail-card ${className}`.trim()}>
      <span className="user-report-modal__detail-label">
        {icon}
        {label}
      </span>
      <div className="user-report-modal__detail-value">{children}</div>
    </div>
  );
}

function SummaryCard({ icon, label, children }) {
  return (
    <div className="user-report-modal__summary-card">
      <span className="user-report-modal__summary-label">
        {icon}
        {label}
      </span>
      <div className="user-report-modal__summary-value">{children}</div>
    </div>
  );
}

const ASSIGNMENT_CONFIRMED_STATUSES = new Set([
  'Assigned',
  'InProgress',
  'Resolved',
  'UnableToExecute',
  'NeedsCompletion',
  'PendingAdminApproval',
]);

function getHistoryStatusDate(history = [], statusKey) {
  const matches = history
    .filter((item) => item?.statusKey === statusKey && item?.changedAt)
    .map((item) => ({
      value: item.changedAt,
      timestamp: new Date(item.changedAt).getTime(),
    }));

  if (!matches.length) return null;

  const validMatches = matches.filter((item) => Number.isFinite(item.timestamp));
  if (!validMatches.length) return matches[matches.length - 1].value;

  validMatches.sort((first, second) => first.timestamp - second.timestamp);
  return validMatches[validMatches.length - 1].value;
}

function getExecutionStatePresentation({
  statusKey,
  companyName,
  assignmentConfirmed,
  publicUpdate,
  publicMessage,
  unableToExecuteReason,
}) {
  switch (statusKey) {
    case 'Accepted':
      return {
        tone: 'warning',
        icon: 'check',
        title: 'تم قبول البلاغ',
        description: assignmentConfirmed
          ? 'تم قبول البلاغ وبدأت إجراءات الإسناد.'
          : 'البلاغ مقبول وجاهز للإسناد إلى جهة التنفيذ.',
      };

    case 'Assigned':
      return {
        tone: 'info',
        icon: 'briefcase',
        title: 'تم إسناد البلاغ',
        description: companyName
          ? `تم إسناد البلاغ إلى ${companyName}.`
          : 'تم إسناد البلاغ إلى جهة التنفيذ.',
      };

    case 'InProgress':
      return {
        tone: 'info',
        icon: 'activity',
        title: 'التنفيذ جارٍ الآن',
        description: companyName
          ? `تتولى ${companyName} تنفيذ البلاغ حاليًا.`
          : 'بدأت جهة التنفيذ العمل على البلاغ.',
      };

    case 'Resolved':
      return {
        tone: 'success',
        icon: 'check',
        title: 'تم حل البلاغ',
        description: companyName
          ? `أنهت ${companyName} تنفيذ البلاغ وتم تسجيله كمحلول.`
          : 'اكتمل تنفيذ البلاغ وتم تسجيله كمحلول.',
      };

    case 'UnableToExecute':
      return {
        tone: 'secondary',
        icon: 'error',
        title: 'تعذر تنفيذ البلاغ',
        description:
          publicMessage ||
          unableToExecuteReason ||
          'لا توجد بيانات للعرض',
      };

    case 'NeedsCompletion':
      return {
        tone: 'warning',
        icon: 'info',
        title: 'البلاغ مطلوب استكماله',
        description:
          'تستكمل جهة التنفيذ العمل على البلاغ قبل اعتماد النتيجة النهائية.',
      };

    case 'PendingAdminApproval':
      return {
        tone: 'info',
        icon: 'shield',
        title: 'بانتظار مراجعة الأدمن',
        description:
          'البلاغ موجود حاليًا لدى الأدمن للمراجعة قبل اعتماد الإجراء النهائي.',
      };

    default:
      return {
        tone: 'info',
        icon: 'info',
        title: 'حالة التنفيذ',
        description: publicUpdate || 'يمكن متابعة تطور حالة البلاغ من سجل الحالة.',
      };
  }
}

function ExecutionStateIcon({ type }) {
  if (type === 'briefcase') return <FiBriefcase />;
  if (type === 'activity') return <FiActivity />;
  if (type === 'check') return <FiCheckCircle />;
  if (type === 'error') return <FiXCircle />;
  if (type === 'shield') return <FiShield />;
  return <FiInfo />;
}

function normalizeImageTypeKey(value = '') {
  return String(value || '')
    .trim()
    .replace(/[\s_-]+/g, '')
    .toLowerCase();
}

function getReportImageCollections(report = {}) {
  const normalizedImages = Array.isArray(report?.reportImages)
    ? report.reportImages
        .map((image, index) => {
          const imageType =
            image.imageType || image.ImageType || image.type || image.Type || 'report';
          const normalizedType = normalizeImageTypeKey(imageType);
          const isResolvedImage = [
            'resolved',
            'solution',
            'solved',
            'after',
            'afterfix',
            'afterresolution',
            'completed',
            'fixed',
          ].includes(normalizedType);

          return {
            ...image,
            id:
              image.imageId ||
              image.id ||
              image.fullImageUrl ||
              image.imageUrl ||
              `${index}`,
            url: image.fullImageUrl || image.imageUrl || image.url || '',
            imageType,
            kind: isResolvedImage ? 'resolved' : 'report',
          };
        })
        .filter((image) => image.url)
    : [];

  if (!normalizedImages.length && report?.coverImage) {
    return {
      allImages: [{ id: report.coverImage, url: report.coverImage, kind: 'report' }],
      reportImages: [{ id: report.coverImage, url: report.coverImage, kind: 'report' }],
      resolvedImages: [],
    };
  }

  return {
    allImages: normalizedImages,
    reportImages: normalizedImages.filter((image) => image.kind !== 'resolved'),
    resolvedImages: normalizedImages.filter((image) => image.kind === 'resolved'),
  };
}

function ReportImageGallery({
  title,
  subtitle,
  images = [],
  emptyText,
  onOpenViewer,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;
  const safeIndex = hasImages ? Math.min(activeIndex, images.length - 1) : 0;
  const activeImage = hasImages ? images[safeIndex] : null;
  const hasMultipleImages = images.length > 1;

  function showPreviousImage(event) {
    event?.stopPropagation?.();
    if (!hasImages) return;
    setActiveIndex((currentIndex) =>
      currentIndex <= 0 ? images.length - 1 : currentIndex - 1
    );
  }

  function showNextImage(event) {
    event?.stopPropagation?.();
    if (!hasImages) return;
    setActiveIndex((currentIndex) =>
      currentIndex >= images.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <section className="followed-report-modal__gallery-section">
      <div className="followed-report-modal__gallery-header">
        <div>
          <strong>{title}</strong>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>

        {hasImages ? (
          <span className="followed-report-modal__gallery-chip">{images.length} صورة</span>
        ) : null}
      </div>

      <div className="user-report-modal__image-box followed-report-modal__image-box">
        {activeImage ? (
          <>
            <div
              className="user-report-modal__image-main"
              role="button"
              tabIndex={0}
              onClick={() => onOpenViewer?.(images, safeIndex, title)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenViewer?.(images, safeIndex, title);
                }
              }}
              aria-label={`عرض ${title} بالحجم الكامل`}
            >
              <img src={activeImage.url} alt={`${title} ${safeIndex + 1}`} />
              <span className="user-report-modal__image-hint">
                <FiEye />
                مرر للمعاينة واضغط لعرض الصورة كاملة
              </span>
            </div>

            {hasMultipleImages ? (
              <>
                <button
                  type="button"
                  className="user-report-modal__image-nav user-report-modal__image-nav--prev"
                  onClick={showPreviousImage}
                  aria-label="الصورة السابقة"
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className="user-report-modal__image-nav user-report-modal__image-nav--next"
                  onClick={showNextImage}
                  aria-label="الصورة التالية"
                >
                  <FiChevronRight />
                </button>
              </>
            ) : null}

            <span className="user-report-modal__image-count">
              صورة {safeIndex + 1} من {images.length}
            </span>

            {hasMultipleImages ? (
              <div className="user-report-modal__thumbs">
                {images.map((image, index) => (
                  <button
                    key={image.id || `${title}-${index}`}
                    type="button"
                    className={`user-report-modal__thumb ${
                      index === safeIndex ? 'is-active' : ''
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`عرض الصورة ${index + 1}`}
                  >
                    <img src={image.url} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="user-report-modal__image-placeholder followed-report-modal__image-placeholder">
            <FiImage />
            <span>{emptyText}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function FollowedReportDetailsModal({
  report,
  onClose,
  onUnfollow,
  onToggleVerify,
  onShowOnMap,
  isUnfollowing = false,
  isVerifyUpLoading = false,
  isVerifyDownLoading = false,
  actionMessage = '',
  actionError = '',
}) {
  const [imageViewerState, setImageViewerState] = useState({
    isOpen: false,
    images: [],
    index: 0,
    title: '',
  });

  const { allImages, reportImages, resolvedImages } = useMemo(
    () => getReportImageCollections(report),
    [report]
  );

  if (!report) return null;
  const currentVerifyVote = Number(report.currentUserVerifyVote || 0);
  const isPositiveVerified =
    report.isVerifiedByCurrentUser && currentVerifyVote !== -1;
  const isNegativeVerified =
    report.isVerifiedByCurrentUser && currentVerifyVote === -1;
  const canToggleVerify =
    report.canCurrentUserVerify !== false || report.isVerifiedByCurrentUser;
  const reporter = report.reporterPublicInfo;
  const reporterStats = reporter?.statistics || {};
  const reporterItems = reporter
    ? [
        {
          key: 'name',
          icon: <FiUser />,
          label: 'الاسم المعروض',
          value: reporter.displayName,
        },
        {
          key: 'city',
          icon: <FiMapPin />,
          label: 'المدينة',
          value: reporter.city,
        },
        {
          key: 'trust',
          icon: <FiShield />,
          label: 'درجة الثقة',
          value: reporter.trustScore,
        },
        {
          key: 'joined',
          icon: <FiCalendar />,
          label: 'تاريخ الانضمام',
          value: reporter.joinedAt ? formatDate(reporter.joinedAt) : null,
        },
        {
          key: 'total',
          icon: <FiFileText />,
          label: 'إجمالي البلاغات',
          value: reporterStats.totalReports,
        },
        {
          key: 'accepted',
          icon: <FiCheckCircle />,
          label: 'بلاغات مقبولة',
          value: reporterStats.acceptedReports,
        },
        {
          key: 'resolved',
          icon: <FiCheckCircle />,
          label: 'بلاغات تم حلها',
          value: reporterStats.resolvedReports,
        },
      ].filter(
        (item) =>
          item.value !== null &&
          item.value !== undefined &&
          String(item.value).trim() !== ''
      )
    : [];
  const execution = report.executionInfo;
  const statusKey = report.statusKey;
  const canShowOnMap = Boolean(
    report.position?.lat &&
      report.position?.lng
  );

  const viewerImages = imageViewerState.images || [];
  const safeViewerIndex = viewerImages.length
    ? Math.min(imageViewerState.index, viewerImages.length - 1)
    : 0;
  const viewerImage = viewerImages[safeViewerIndex] || null;
  const viewerHasMultipleImages = viewerImages.length > 1;

  function openImageViewer(imagesList = [], index = 0, sectionTitle = report.title) {
    if (!imagesList.length) return;

    setImageViewerState({
      isOpen: true,
      images: imagesList,
      index,
      title: sectionTitle,
    });
  }

  function closeImageViewer() {
    setImageViewerState((currentState) => ({
      ...currentState,
      isOpen: false,
    }));
  }

  function showPreviousImage() {
    if (!viewerImages.length) return;
    setImageViewerState((currentState) => ({
      ...currentState,
      index:
        currentState.index <= 0 ? viewerImages.length - 1 : currentState.index - 1,
    }));
  }

  function showNextImage() {
    if (!viewerImages.length) return;
    setImageViewerState((currentState) => ({
      ...currentState,
      index:
        currentState.index >= viewerImages.length - 1 ? 0 : currentState.index + 1,
    }));
  }

  return (
    <div className="user-report-modal followed-report-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="user-report-modal__backdrop"
        onClick={onClose}
        aria-label="إغلاق تفاصيل البلاغ"
      />

      <article className="user-report-modal__panel followed-report-modal__panel">
        <button
          type="button"
          className="user-report-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="followed-report-modal__header">
          <div>
            <ReportStatusBadge tone={report.statusTone}>
              {report.statusLabel}
            </ReportStatusBadge>
            <h2>{report.title}</h2>
            <p>{report.reportNumber || report.reportId}</p>
          </div>

          <button
            type="button"
            className="followed-report-modal__unfollow"
            onClick={() => onUnfollow?.(report)}
            disabled={report.canCurrentUserUnfollow === false || isUnfollowing}
          >
            <FiTrash2 />
            {report.canCurrentUserUnfollow === false
              ? 'إلغاء المتابعة غير متاح'
              : isUnfollowing
                ? 'جاري إلغاء المتابعة...'
                : 'إلغاء المتابعة'}
          </button>
        </header>

        <div className="user-report-modal__content followed-report-modal__content">
          <div className="user-report-modal__details followed-report-modal__details">
            <DetailBlock icon={<FiInfo />} label="عنوان المشكلة">
              <strong>{report.title}</strong>
            </DetailBlock>

            <DetailBlock
              icon={<FiFileText />}
              label="وصف المشكلة"
              className="user-report-modal__detail-card--description"
            >
              <p>{report.description || 'لا يوجد وصف متاح لهذا البلاغ.'}</p>
            </DetailBlock>

            <DetailBlock icon={<FiMapPin />} label="الموقع">
              <strong>{report.locationText || 'لم يتم تحديد الموقع'}</strong>
            </DetailBlock>

            <div className="followed-report-modal__detail-grid">
              <DetailBlock icon={<FiActivity />} label="نوع المشكلة">
                <strong>{report.issueCategoryName || 'أخرى'}</strong>
              </DetailBlock>

              <DetailBlock icon={<FiShield />} label="الأولوية">
                <strong>{report.priorityLabel || 'غير محددة'}</strong>
              </DetailBlock>

              <DetailBlock icon={<FiCalendar />} label="تاريخ البلاغ">
                <strong>{formatDate(report.createdAt)}</strong>
              </DetailBlock>

              <DetailBlock icon={<FiCalendar />} label="تاريخ المتابعة">
                <strong>{formatDate(report.followedAt)}</strong>
              </DetailBlock>
            </div>

            {reporterItems.length ? (
              <section className="followed-report-modal__section">
                <div className="followed-report-modal__section-title">
                  <FiUser />
                  <div>
                    <strong>بيانات صاحب البلاغ</strong>
                    <span>ملخص عن صاحب البلاغ.</span>
                  </div>
                </div>

                <div className="followed-report-modal__public-info-grid">
                  {reporterItems.map((item) => (
                    <SummaryCard
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                    >
                      <strong>{item.value}</strong>
                    </SummaryCard>
                  ))}
                </div>
              </section>
            ) : null}

            {statusKey === 'UnableToExecute' ? (
              <DetailBlock
                icon={<FiXCircle />}
                label="سبب التعذر"
                className="followed-report-modal__status-reason followed-report-modal__status-reason--unable"
              >
                <p>{execution?.publicMessage || 'لم يتم ارسال اي سبب للتعذر'}</p>
              </DetailBlock>
            ) : null}

          </div>

          <div className="user-report-modal__media followed-report-modal__media">
            <div className="followed-report-modal__gallery-list">
              <ReportImageGallery
                title={resolvedImages.length ? 'صور البلاغ الأصلية' : 'صور البلاغ'}
                subtitle={
                  resolvedImages.length
                    ? 'الصور المرفوعة عند إنشاء البلاغ.'
                    : 'استعرض صور البلاغ مع إمكانية التقليب والتكبير.'
                }
                images={
                  resolvedImages.length
                    ? reportImages
                    : reportImages.length
                      ? reportImages
                      : allImages
                }
                emptyText={
                  resolvedImages.length
                    ? 'لا توجد صور أصلية للبلاغ'
                    : 'لا توجد صور لهذا البلاغ'
                }
                onOpenViewer={openImageViewer}
              />

              {resolvedImages.length ? (
                <ReportImageGallery
                  title="صور بعد الحل"
                  subtitle="صور توضح نتيجة التنفيذ بعد معالجة المشكلة."
                  images={resolvedImages}
                  emptyText="لا توجد صور مرفوعة بعد الحل"
                  onOpenViewer={openImageViewer}
                />
              ) : null}
            </div>

            <div className="user-report-modal__summary-grid">
              <SummaryCard icon={<FiInfo />} label="الحالة">
                <ReportStatusBadge tone={report.statusTone}>
                  {report.statusLabel}
                </ReportStatusBadge>
              </SummaryCard>

              <SummaryCard icon={<FiCalendar />} label="آخر تحديث">
                <strong>{formatDate(report.updatedAt, true)}</strong>
              </SummaryCard>
            </div>

            <div className="followed-report-modal__map-action-wrap">
              <button
                type="button"
                className="followed-report-modal__map-action"
                onClick={() => onShowOnMap?.(report)}
                disabled={!canShowOnMap}
                title={
                  canShowOnMap
                    ? 'إغلاق التفاصيل وعرض موقع البلاغ على الخريطة'
                    : 'لا توجد إحداثيات متاحة لهذا البلاغ'
                }
              >
                <FiMapPin />
                <span>عرض البلاغ على الخريطة</span>
              </button>
            </div>

            <div className="followed-report-modal__engagement-actions">
              <button
                type="button"
                className="followed-report-modal__engagement-btn followed-report-modal__engagement-btn--follow is-active"
                onClick={() => onUnfollow?.(report)}
                disabled={
                  report.canCurrentUserUnfollow === false || isUnfollowing
                }
                title="إلغاء متابعة البلاغ"
              >
                <span
                  className="followed-report-modal__engagement-icon"
                  aria-hidden="true"
                >
                  <FiUsers />
                </span>
                <span className="followed-report-modal__engagement-content">
                  <small>إجمالي المتابعات</small>
                  <strong>{report.followersCount ?? 0}</strong>
                  <span>
                    {isUnfollowing ? 'جاري إلغاء المتابعة...' : 'إلغاء المتابعة'}
                  </span>
                </span>
              </button>

              <button
                type="button"
                className={`followed-report-modal__engagement-btn followed-report-modal__engagement-btn--upvote ${
                  isPositiveVerified ? 'is-active' : ''
                }`}
                onClick={() => onToggleVerify?.(report, 1)}
                disabled={!canToggleVerify || isVerifyUpLoading || isVerifyDownLoading}
                title={isPositiveVerified ? 'إلغاء تصديق البلاغ' : 'البلاغ صحيح'}
              >
                <span
                  className="followed-report-modal__engagement-icon"
                  aria-hidden="true"
                >
                  <FiCheckCircle />
                </span>
                <span className="followed-report-modal__engagement-content">
                  <small>إجمالي التصديقات</small>
                  <strong>{report.upvoteCount ?? 0}</strong>
                  <span>
                    {isVerifyUpLoading
                      ? 'جاري التحديث...'
                      : isPositiveVerified
                        ? 'إلغاء التصديق'
                        : 'البلاغ صحيح'}
                  </span>
                </span>
              </button>

              <button
                type="button"
                className={`followed-report-modal__engagement-btn followed-report-modal__engagement-btn--downvote ${
                  isNegativeVerified ? 'is-active' : ''
                }`}
                onClick={() => onToggleVerify?.(report, -1)}
                disabled={!canToggleVerify || isVerifyDownLoading || isVerifyUpLoading}
                title={isNegativeVerified ? 'إلغاء تكذيب البلاغ' : 'البلاغ غير صحيح'}
              >
                <span
                  className="followed-report-modal__engagement-icon"
                  aria-hidden="true"
                >
                  <FiXCircle />
                </span>
                <span className="followed-report-modal__engagement-content">
                  <small>إجمالي التكذيبات</small>
                  <strong>{report.downvoteCount ?? 0}</strong>
                  <span>
                    {isVerifyDownLoading
                      ? 'جاري التحديث...'
                      : isNegativeVerified
                        ? 'إلغاء التكذيب'
                        : 'البلاغ غير صحيح'}
                  </span>
                </span>
              </button>
            </div>

            {actionMessage ? (
              <div className="followed-report-modal__action-feedback is-success">
                {actionMessage}
              </div>
            ) : null}

            {actionError ? (
              <div className="followed-report-modal__action-feedback is-error">
                {actionError}
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {imageViewerState.isOpen && viewerImage
        ? createPortal(
            <div className="user-report-image-viewer" role="dialog" aria-modal="true">
              <button
                type="button"
                className="user-report-image-viewer__backdrop"
                onClick={closeImageViewer}
                aria-label="إغلاق عرض الصورة"
              />

              <div className="user-report-image-viewer__panel">
                <button
                  type="button"
                  className="user-report-image-viewer__close"
                  onClick={closeImageViewer}
                  aria-label="إغلاق"
                >
                  <FiX />
                </button>

                {viewerHasMultipleImages ? (
                  <button
                    type="button"
                    className="user-report-image-viewer__nav user-report-image-viewer__nav--prev"
                    onClick={showPreviousImage}
                    aria-label="الصورة السابقة"
                  >
                    <FiChevronLeft />
                  </button>
                ) : null}

                <img src={viewerImage.url} alt={imageViewerState.title || report.title} />

                {viewerHasMultipleImages ? (
                  <button
                    type="button"
                    className="user-report-image-viewer__nav user-report-image-viewer__nav--next"
                    onClick={showNextImage}
                    aria-label="الصورة التالية"
                  >
                    <FiChevronRight />
                  </button>
                ) : null}

                <div className="user-report-image-viewer__footer">
                  <strong>{imageViewerState.title || report.title}</strong>
                  <span>
                    صورة {safeViewerIndex + 1} من {viewerImages.length}
                  </span>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default FollowedReportDetailsModal;
