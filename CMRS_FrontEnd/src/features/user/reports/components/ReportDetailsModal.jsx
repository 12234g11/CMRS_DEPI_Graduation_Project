import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiHash,
  FiImage,
  FiInfo,
  FiMapPin,
  FiStar,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';

import { ROUTES } from '../../../../shared/navigation';
import ReportStatusBadge from './ReportStatusBadge';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const categorySymbols = {
  '1': '⚑',
  '2': 'ϟ',
  '3': '♻',
  '4': '◌',
  '5': '🚦',
  '6': '♣',
  '7': '◇',
  '8': '🔥',
  '9': '⌁',
  '10': '🛠',
  other: '?',
};

const categoryTonesById = {
  '1': 'orange',
  '2': 'amber',
  '3': 'mint',
  '4': 'sky',
  '5': 'rose',
  '6': 'emerald',
  '7': 'violet',
  '8': 'red',
  '9': 'blue',
  '10': 'slate',
};

function normalizeAssetUrl(url = '') {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${url}`;
  }

  return `${API_BASE_URL.replace(/\/$/, '')}/${url}`;
}

function formatReportDate(value) {
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

function getReportImages(report = {}) {
  if (Array.isArray(report.reportImages) && report.reportImages.length) {
    return report.reportImages
      .map((image) => ({
        id: image.imageId || image.id || image.imageUrl,
        url: normalizeAssetUrl(image.imageUrl || image.url || ''),
        uploadedAt: image.uploadedAt || '',
      }))
      .filter((image) => image.url);
  }

  if (Array.isArray(report.images) && report.images.length) {
    return report.images
      .map((image, index) => {
        if (typeof image === 'string') {
          return {
            id: `${image}-${index}`,
            url: normalizeAssetUrl(image),
            uploadedAt: '',
          };
        }

        return {
          id: image.imageId || image.id || image.imageUrl || image.url || index,
          url: normalizeAssetUrl(image.imageUrl || image.url || ''),
          uploadedAt: image.uploadedAt || '',
        };
      })
      .filter((image) => image.url);
  }

  const fallbackImage = report.coverImage || report.image || '';

  return fallbackImage
    ? [
        {
          id: fallbackImage,
          url: normalizeAssetUrl(fallbackImage),
          uploadedAt: '',
        },
      ]
    : [];
}

function getReportPosition(report = {}) {
  if (report.position?.lat && report.position?.lng) {
    return report.position;
  }

  if (report.latitude && report.longitude) {
    return {
      lat: Number(report.latitude),
      lng: Number(report.longitude),
    };
  }

  return null;
}

function getLocationText(report = {}) {
  const area = report.area || {};

  const areaText =
    typeof area === 'string'
      ? area
      : [area.city, area.address, area.detailedAddress]
          .filter(Boolean)
          .join(' - ');

  return (
    report.locationText ||
    areaText ||
    [report.city, report.address, report.detailedAddress]
      .filter(Boolean)
      .join(' - ') ||
    'لم يتم تحديد الموقع'
  );
}

function getPriorityLabel(report = {}) {
  if (report.priorityLabel) return report.priorityLabel;

  if (Number(report.priority) === 3) return 'عالية';
  if (Number(report.priority) === 2) return 'متوسطة';
  if (Number(report.priority) === 1) return 'منخفضة';

  return 'غير محددة';
}


function getRejectionReason(report = {}) {
  return (
    report.rejectionReason ||
    report.RejectionReason ||
    report.rejectReason ||
    report.RejectReason ||
    report.refusalReason ||
    report.RefusalReason ||
    report.adminRejectionReason ||
    report.AdminRejectionReason ||
    report.statusReason ||
    report.StatusReason ||
    report.notes ||
    report.Notes ||
    ''
  );
}

function isRejectedReport(report = {}) {
  const status = String(report.status || report.statusKey || '').toLowerCase();
  const statusLabel = String(report.statusLabel || '').toLowerCase();
  const statusTone = String(report.statusTone || '').toLowerCase();

  return (
    status === 'rejected' ||
    status.includes('rejected') ||
    statusLabel.includes('مرفوض') ||
    statusTone === 'danger'
  );
}

function DetailBlock({ icon, label, children, className = '' }) {
  return (
    <div className={`user-report-modal__detail-card ${className}`.trim()}>
      <div className="user-report-modal__detail-label">
        {icon}
        <span>{label}</span>
      </div>

      <div className="user-report-modal__detail-value">{children}</div>
    </div>
  );
}

function SummaryCard({ icon, label, children }) {
  return (
    <div className="user-report-modal__summary-card">
      <div className="user-report-modal__summary-label">
        {icon}
        <span>{label}</span>
      </div>

      <div className="user-report-modal__summary-value">{children}</div>
    </div>
  );
}

function ReportDetailsModal({ report, onClose }) {
  const navigate = useNavigate();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const images = useMemo(() => getReportImages(report), [report]);

  if (!report) return null;

  const reportId = report.reportId || report.id;
  const title = report.title || report.issue || 'عنوان البلاغ';
  const description = report.description || 'لا يوجد وصف متاح لهذا البلاغ.';

  const location = getLocationText(report);
  const position = getReportPosition(report);

  const categoryId = String(report.issueCategoryId || report.categoryId || '');

  const categoryLabel =
    report.issueCategoryName ||
    report.categoryLabel ||
    report.categoryName ||
    report.issue ||
    'أخرى';

  const categorySubtitle =
    report.issueCategoryDescription ||
    report.categorySubtitle ||
    report.categoryDescription ||
    'Other';

  const categoryTone =
    report.categoryTone ||
    categoryTonesById[categoryId] ||
    report.statusTone ||
    'warning';

  const categoryIcon = categorySymbols[categoryId] || categorySymbols.other;

  const activeImage = images[activeImageIndex] || null;
  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const rating = report.ratingCount ?? report.rating ?? 0;
  const followersCount = report.followersCount ?? 0;
  const reportNumber = report.reportNumber || reportId || '—';
  const ownerName = report.ownerUserName || '—';
  const priorityLabel = getPriorityLabel(report);

  const isRejected = isRejectedReport(report);
  const rejectionReason = getRejectionReason(report);

  const canShowOnMap =
    Boolean(position?.lat && position?.lng) && !isRejected;

  const mapButtonDisabledReason = isRejected
    ? 'لا يمكن عرض البلاغ المرفوض على الخريطة.'
    : 'لا توجد إحداثيات متاحة لهذا البلاغ';

  function showPreviousImage(event) {
    event?.stopPropagation?.();

    if (!hasImages) return;

    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    );
  }

  function showNextImage(event) {
    event?.stopPropagation?.();

    if (!hasImages) return;

    setActiveImageIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    );
  }

  function openImageViewer() {
    if (!activeImage) return;

    setIsImageViewerOpen(true);
  }

  function closeImageViewer() {
    setIsImageViewerOpen(false);
  }

  function handleShowOnMap() {
    if (isRejected) {
      window.alert(
        'لا يمكن عرض البلاغ المرفوض على الخريطة لأن الخريطة لا تعرض البلاغات المرفوضة.'
      );
      return;
    }

    if (!position?.lat || !position?.lng) {
      window.alert('لا توجد إحداثيات متاحة لهذا البلاغ لعرضه على الخريطة.');
      return;
    }

    onClose?.();

    navigate(ROUTES.MY_REPORTS, {
      state: {
        focusMapReport: {
          reportId,
          originalId: reportId,
          markerId: `mine-${reportId}`,
          source: 'mine',

          title,
          typeLabel: categoryLabel,
          area: typeof report.area === 'string' ? report.area : report.area?.city,
          address: location,
          description,

          reportNumber,
          statusLabel: report.statusLabel,
          statusTone: report.statusTone,
          tone: report.statusTone,

          date: report.createdAt || report.date,
          coverImage: activeImage?.url || report.coverImage,
          images: images.map((image) => image.url),

          position,
        },
      },
    });
  }

  return (
    <div className="user-report-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="user-report-modal__backdrop"
        onClick={onClose}
        aria-label="إغلاق تفاصيل البلاغ"
      />

      <article className="user-report-modal__panel">
        <button
          type="button"
          className="user-report-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <div className="user-report-modal__content">
          <div className="user-report-modal__details">
            <DetailBlock icon={<FiInfo />} label="عنوان المشكلة">
              <strong>{title}</strong>
            </DetailBlock>

            <DetailBlock
              icon={<FiInfo />}
              label="وصف المشكلة"
              className="user-report-modal__detail-card--description"
            >
              <p>{description}</p>
            </DetailBlock>

            <DetailBlock icon={<FiMapPin />} label="الموقع">
              <strong>{location}</strong>
            </DetailBlock>

            {isRejected ? (
              <DetailBlock
                icon={<FiAlertTriangle />}
                label="سبب الرفض"
                className="user-report-modal__detail-card--rejection"
              >
                <p>{rejectionReason || 'لم يتم توضيح سبب الرفض من الإدارة.'}</p>
              </DetailBlock>
            ) : null}

            <DetailBlock icon={<FiAlertTriangle />} label="نوع المشكلة">
              <div className="user-report-modal__category-box">
                <span
                  className={`user-report-modal__category-icon is-${categoryTone}`}
                >
                  {categoryIcon}
                </span>

                <div>
                  <strong>{categoryLabel}</strong>
                  <small>{categorySubtitle}</small>
                </div>
              </div>
            </DetailBlock>

            <div className="user-report-modal__extra-grid">
              <DetailBlock icon={<FiHash />} label="رقم البلاغ">
                <strong>{reportNumber}</strong>
              </DetailBlock>

              <DetailBlock icon={<FiUser />} label="مقدم البلاغ">
                <strong>{ownerName}</strong>
              </DetailBlock>

              <DetailBlock icon={<FiAlertTriangle />} label="الأولوية">
                <strong>{priorityLabel}</strong>
              </DetailBlock>

              <DetailBlock icon={<FiUsers />} label="عدد المتابعين">
                <strong>{followersCount}</strong>
              </DetailBlock>
            </div>
          </div>

          <div className="user-report-modal__media">
            <div className="user-report-modal__image-box">
              {hasImages ? (
                <>
                  <div
                    className="user-report-modal__image-main"
                    role="button"
                    tabIndex={0}
                    onClick={openImageViewer}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openImageViewer();
                      }
                    }}
                    aria-label="عرض الصورة بالحجم الكامل"
                  >
                    <img src={activeImage.url} alt={title} />

                    <span className="user-report-modal__image-hint">
                      <FiEye />
                      اضغط لعرض الصورة كاملة
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
                    صورة {activeImageIndex + 1} من {images.length}
                  </span>

                  {hasMultipleImages ? (
                    <div className="user-report-modal__thumbs">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          type="button"
                          className={`user-report-modal__thumb ${
                            index === activeImageIndex ? 'is-active' : ''
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveImageIndex(index);
                          }}
                          aria-label={`عرض الصورة ${index + 1}`}
                        >
                          <img src={image.url} alt={`صورة ${index + 1}`} />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="user-report-modal__image-placeholder">
                  <FiImage />
                  <span>لا توجد صورة للبلاغ</span>
                </div>
              )}
            </div>

            <div className="user-report-modal__summary-grid">
              <SummaryCard icon={<FiCalendar />} label="التاريخ">
                <strong>{formatReportDate(report.createdAt || report.date)}</strong>
              </SummaryCard>

              <SummaryCard icon={<FiInfo />} label="الحالة">
                <ReportStatusBadge tone={report.statusTone}>
                  {report.statusLabel || 'قيد المراجعة'}
                </ReportStatusBadge>
              </SummaryCard>

              <SummaryCard icon={<FiStar />} label="التقييم">
                <div className="user-report-modal__rating">
                  <span>★</span>
                  <strong>{rating}</strong>
                </div>
              </SummaryCard>
            </div>

            <div className="user-report-modal__map-action-wrap">
              <button
                type="button"
                className="user-report-modal__map-action-btn"
                onClick={handleShowOnMap}
                disabled={!canShowOnMap}
                title={canShowOnMap ? undefined : mapButtonDisabledReason}
              >
                <FiMapPin />
                <span>
                  {isRejected ? 'غير متاح للبلاغ المرفوض' : 'عرض المشكلة على الخريطة'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {isImageViewerOpen && activeImage
        ? createPortal(
            <div
              className="user-report-image-viewer"
              role="dialog"
              aria-modal="true"
            >
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

                {hasMultipleImages ? (
                  <button
                    type="button"
                    className="user-report-image-viewer__nav user-report-image-viewer__nav--prev"
                    onClick={showPreviousImage}
                    aria-label="الصورة السابقة"
                  >
                    <FiChevronLeft />
                  </button>
                ) : null}

                <img src={activeImage.url} alt={title} />

                {hasMultipleImages ? (
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
                  <strong>{title}</strong>
                  <span>
                    صورة {activeImageIndex + 1} من {images.length}
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

export default ReportDetailsModal;