import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiImage,
  FiMapPin,
  FiMaximize2,
  FiStar,
  FiTag,
  FiUser,
  FiX,
} from 'react-icons/fi';

function getCompanyResponseText(response) {
  if (!response) return 'لا يوجد رد من الشركة حتى الآن';
  if (response.status === 'fixed') return 'تم الإصلاح';
  if (response.status === 'cannot_fix') return 'متعذر التنفيذ';

  return response.statusLabel || 'رد شركة';
}

function DashboardReportImageGallery({ report }) {
  const images = useMemo(() => report.images?.filter(Boolean) || [], [report.images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeImage = images[activeIndex] || '';
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setActiveIndex(0);
    setPreviewOpen(false);
  }, [report.id, images.length]);

  const goToPreviousImage = () => {
    if (!hasMultipleImages) return;
    setActiveIndex((currentIndex) => (
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    ));
  };

  const goToNextImage = () => {
    if (!hasMultipleImages) return;
    setActiveIndex((currentIndex) => (
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    ));
  };

  if (!images.length) {
    return (
      <p className="admin-dashboard-report-modal__empty">
        لا توجد صور مرفقة.
      </p>
    );
  }

  return (
    <>
      <div className="admin-dashboard-report-gallery">
        <button
          type="button"
          className="admin-dashboard-report-gallery__main"
          onClick={() => setPreviewOpen(true)}
          aria-label="فتح معاينة الصورة بالحجم الكامل"
        >
          <img src={activeImage} alt={report.title} />
          <span>
            <FiMaximize2 />
            معاينة كاملة
          </span>
        </button>

        {hasMultipleImages ? (
          <div className="admin-dashboard-report-gallery__thumbs">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={index === activeIndex ? 'is-active' : ''}
                onClick={() => setActiveIndex(index)}
                aria-label={`عرض صورة رقم ${index + 1}`}
              >
                <img src={image} alt={`صورة البلاغ ${index + 1}`} />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {previewOpen ? (
        <div className="admin-dashboard-image-lightbox" role="dialog" aria-modal="true">
          <button
            type="button"
            className="admin-dashboard-image-lightbox__backdrop"
            onClick={() => setPreviewOpen(false)}
            aria-label="إغلاق المعاينة"
          />

          <div className="admin-dashboard-image-lightbox__content">
            <header className="admin-dashboard-image-lightbox__header">
              <strong>{report.title}</strong>
              <span>{activeIndex + 1} / {images.length}</span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="إغلاق"
              >
                <FiX />
              </button>
            </header>

            <div className="admin-dashboard-image-lightbox__stage">
              {hasMultipleImages ? (
                <button
                  type="button"
                  className="admin-dashboard-image-lightbox__nav admin-dashboard-image-lightbox__nav--prev"
                  onClick={goToPreviousImage}
                  aria-label="الصورة السابقة"
                >
                  <FiChevronRight />
                </button>
              ) : null}

              <img src={activeImage} alt={`صورة البلاغ ${activeIndex + 1}`} />

              {hasMultipleImages ? (
                <button
                  type="button"
                  className="admin-dashboard-image-lightbox__nav admin-dashboard-image-lightbox__nav--next"
                  onClick={goToNextImage}
                  aria-label="الصورة التالية"
                >
                  <FiChevronLeft />
                </button>
              ) : null}
            </div>

            {hasMultipleImages ? (
              <div className="admin-dashboard-image-lightbox__thumbs">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`preview-${image}-${index}`}
                    className={index === activeIndex ? 'is-active' : ''}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`فتح صورة رقم ${index + 1}`}
                  >
                    <img src={image} alt={`مصغرة ${index + 1}`} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function AdminDashboardReportDetailsModal({
  report,
  onClose,
  onGoToReport,
}) {
  if (!report) return null;

  return (
    <div className="admin-dashboard-report-modal-backdrop">
      <section
        className="admin-dashboard-report-modal"
        role="dialog"
        aria-modal="true"
      >
        <header className="admin-dashboard-report-modal__header">
          <div>
            <span className={`admin-dashboard-report-modal__status is-${report.statusTone}`}>
              {report.statusLabel || report.status}
            </span>

            <h2>{report.title}</h2>

            <p>
              #{report.id} - {report.type || report.issueCategoryName}
            </p>
          </div>

          <div className="admin-dashboard-report-modal__actions">
            <button
              type="button"
              className="admin-dashboard-report-modal__open-btn"
              onClick={() => onGoToReport(report)}
            >
              فتح البلاغ في جدول البلاغات
              <FiArrowLeft />
            </button>

            <button
              type="button"
              className="admin-dashboard-report-modal__close"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <FiX />
            </button>
          </div>
        </header>

        <div className="admin-dashboard-report-modal__body">
          <div className="admin-dashboard-report-modal__main">
            <section className="admin-dashboard-report-modal__section">
              <h3>
                <FiFileText />
                وصف المشكلة
              </h3>

              <p>{report.description}</p>
            </section>

            <section className="admin-dashboard-report-modal__section">
              <h3>
                <FiImage />
                صور البلاغ
              </h3>

              <DashboardReportImageGallery report={report} />
            </section>

            <section className="admin-dashboard-report-modal__section">
              <h3>
                <FiCheckCircle />
                رد الشركة
              </h3>

              <div className="admin-dashboard-company-response-preview">
                <strong>{getCompanyResponseText(report.companyResponse)}</strong>

                {report.companyResponse ? (
                  <>
                    <span>{report.companyResponse.companyName}</span>
                    <p>{report.companyResponse.note}</p>
                  </>
                ) : (
                  <p>لم ترسل الشركة ردًا على هذا البلاغ حتى الآن.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="admin-dashboard-report-modal__side">
            <div className="admin-dashboard-report-info-item">
              <FiTag />

              <div>
                <span>نوع المشكلة</span>
                <strong>{report.type || report.issueCategoryName}</strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiMapPin />

              <div>
                <span>الموقع</span>
                <strong>{report.location}</strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiCalendar />

              <div>
                <span>تاريخ البلاغ</span>
                <strong>{report.date}</strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiAlertCircle />

              <div>
                <span>الأولوية</span>
                <strong>{report.priorityLabel || report.priority}</strong>
              </div>
            </div>


            <div className="admin-dashboard-report-info-item">
              <FiUser />

              <div>
                <span>المبلغ</span>
                <strong>{report.reporter?.name || 'غير محدد'}</strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiClock />

              <div>
                <span>الشركة المعينة</span>
                <strong>{report.assignedCompany || report.assignedCompanyName || 'غير معين'}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardReportDetailsModal;
