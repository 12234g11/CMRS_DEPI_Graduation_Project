import { useEffect, useMemo, useState } from 'react';
import {
  FiCamera,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiX,
} from 'react-icons/fi';

function AdminReportImagesCard({ report }) {
  const images = useMemo(() => report.images?.filter(Boolean) || [], [report.images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeImage = images[activeIndex] || '';
  const hasImages = images.length > 0;
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

  return (
    <section className="admin-report-details-card admin-report-images-card">
      <header className="admin-report-card-header">
        <div>
          <h2>صور البلاغ</h2>
          <p>Report Images</p>
        </div>

        <span className="admin-report-images-count">
          <FiCamera />
          {images.length} صورة
        </span>
      </header>

      {hasImages ? (
        <>
          <button
            type="button"
            className="admin-report-image-preview"
            onClick={() => setPreviewOpen(true)}
            aria-label="فتح معاينة الصورة بالحجم الكامل"
          >
            <img src={activeImage} alt={report.title} />
            <span className="admin-report-image-preview__overlay">
              <FiMaximize2 />
              معاينة كاملة
            </span>
          </button>

          <div className="admin-report-images-footer admin-report-images-footer--thumbnails-only">
            <div className="admin-report-thumbnails">
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
          </div>
        </>
      ) : (
        <p className="admin-report-images-empty">لا توجد صور مرفقة مع هذا البلاغ.</p>
      )}

      {previewOpen && hasImages ? (
        <div className="admin-report-image-lightbox" role="dialog" aria-modal="true">
          <button
            type="button"
            className="admin-report-image-lightbox__backdrop"
            onClick={() => setPreviewOpen(false)}
            aria-label="إغلاق المعاينة"
          />

          <div className="admin-report-image-lightbox__content">
            <header className="admin-report-image-lightbox__header">
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

            <div className="admin-report-image-lightbox__stage">
              {hasMultipleImages ? (
                <button
                  type="button"
                  className="admin-report-image-lightbox__nav admin-report-image-lightbox__nav--prev"
                  onClick={goToPreviousImage}
                  aria-label="الصورة السابقة"
                >
                  <FiChevronRight />
                </button>
              ) : null}

              <img src={activeImage} alt={report.title} />

              {hasMultipleImages ? (
                <button
                  type="button"
                  className="admin-report-image-lightbox__nav admin-report-image-lightbox__nav--next"
                  onClick={goToNextImage}
                  aria-label="الصورة التالية"
                >
                  <FiChevronLeft />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminReportImagesCard;
