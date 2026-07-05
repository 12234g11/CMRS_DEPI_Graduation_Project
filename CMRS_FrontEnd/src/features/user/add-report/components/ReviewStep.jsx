import { createPortal } from 'react-dom';
import { useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiInfo,
  FiMapPin,
  FiMessageSquare,
  FiSend,
  FiX,
} from 'react-icons/fi';

import { buildReportPreviewImage } from '../../reports/utils/buildReportPreviewImage';
import CategoryIcon from './CategoryIcon';
import {
  CATEGORY_UI_META_BY_ID,
  DEFAULT_CATEGORY_UI_META,
} from '../constants/categoryUiMeta';

function getCategoryMeta(category) {
  const categoryId = String(category?.categoryId || '');

  return CATEGORY_UI_META_BY_ID[categoryId] || DEFAULT_CATEGORY_UI_META;
}

function ReviewStep({
  values,
  category,
  locationLabel = '',
  onBack,
  onSubmit,
  isSubmitting = false,
  submitError = '',
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const imagePreviews = Array.isArray(values.imagePreviews)
    ? values.imagePreviews
    : [];

  const categoryMeta = getCategoryMeta(category);

  const categoryName = category?.name || 'أخرى';
  const categoryDescription = category?.description || 'Other';

  const fallbackImage = useMemo(() => {
    return buildReportPreviewImage({
      title: values.title || 'بلاغ جديد',
      categoryLabel: categoryName,
      tone: categoryMeta.tone || 'warning',
    });
  }, [values.title, categoryName, categoryMeta.tone]);

  const activeImage = imagePreviews[activeImageIndex] || null;
  const previewImage = activeImage?.url || fallbackImage;
  const hasMultipleImages = imagePreviews.length > 1;
  const hasUploadedImages = imagePreviews.length > 0;

  function showPreviousImage() {
    if (!hasUploadedImages) return;

    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? imagePreviews.length - 1 : currentIndex - 1
    );
  }

  function showNextImage() {
    if (!hasUploadedImages) return;

    setActiveImageIndex((currentIndex) =>
      currentIndex === imagePreviews.length - 1 ? 0 : currentIndex + 1
    );
  }

  function openImageViewer() {
    if (!hasUploadedImages) return;

    setIsImageViewerOpen(true);
  }

  function closeImageViewer() {
    setIsImageViewerOpen(false);
  }

  return (
    <section className="add-report-step">
      <div className="add-report-review-grid">
        <aside className="add-report-review-image-card">
          <button
            type="button"
            className="add-report-review-image-card__main"
            onClick={openImageViewer}
            disabled={!hasUploadedImages}
            aria-label="عرض الصورة بالحجم الكامل"
          >
            <img src={previewImage} alt={values.title || 'معاينة البلاغ'} />

            {hasUploadedImages ? (
              <span className="add-report-review-image-card__hover-hint">
                <FiEye />
                اضغط لعرض الصورة كاملة
              </span>
            ) : null}
          </button>

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                className="add-report-review-image-card__nav add-report-review-image-card__nav--prev"
                onClick={showPreviousImage}
                aria-label="الصورة السابقة"
              >
                <FiChevronLeft />
              </button>

              <button
                type="button"
                className="add-report-review-image-card__nav add-report-review-image-card__nav--next"
                onClick={showNextImage}
                aria-label="الصورة التالية"
              >
                <FiChevronRight />
              </button>
            </>
          ) : null}

          {hasUploadedImages ? (
            <div className="add-report-review-image-card__counter">
              صورة {activeImageIndex + 1} من {imagePreviews.length}
            </div>
          ) : null}

          {hasUploadedImages ? (
            <div className="add-report-review-image-card__thumbs">
              {imagePreviews.map((preview, index) => {
                const isActive = index === activeImageIndex;

                return (
                  <button
                    key={preview.id}
                    type="button"
                    className={`add-report-review-image-card__thumb ${
                      isActive ? 'is-active' : ''
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`عرض الصورة ${index + 1}`}
                  >
                    <img src={preview.url} alt={preview.name} />
                  </button>
                );
              })}
            </div>
          ) : null}
        </aside>

        <article className="add-report-review-card">
          <div className="add-report-review-card__field">
            <span className="add-report-review-card__label">
              <FiInfo />
              عنوان المشكلة
            </span>

            <strong>{values.title || '—'}</strong>
          </div>

          <div className="add-report-review-card__field">
            <span className="add-report-review-card__label">
              <FiMessageSquare />
              وصف المشكلة
            </span>

            <p>{values.description || '—'}</p>
          </div>

          <div className="add-report-review-card__field">
            <span className="add-report-review-card__label">
              <FiMapPin />
              الموقع
            </span>

            <strong>{locationLabel || '—'}</strong>
          </div>

          <div className="add-report-review-card__field">
            <span className="add-report-review-card__label add-report-review-card__label--category">
              <span
                className={`add-report-review-card__label-icon is-${
                  categoryMeta.tone || 'slate'
                }`}
              >
                <CategoryIcon iconKey={categoryMeta.iconKey} />
              </span>
              نوع المشكلة
            </span>

            <strong>{categoryName}</strong>

            <small className="add-report-review-card__value-subtitle">
              {categoryDescription}
            </small>
          </div>
        </article>
      </div>

      {submitError ? (
        <p className="add-report-form__message add-report-form__message--error">
          {submitError}
        </p>
      ) : null}

      <div className="add-report-step__actions">
        <button
          type="button"
          className="add-report-btn add-report-btn--ghost"
          onClick={onBack}
          disabled={isSubmitting}
        >
          السابق
        </button>

        <button
          type="button"
          className="add-report-btn add-report-btn--primary"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          <FiSend />
          <span>{isSubmitting ? 'جارٍ الإرسال...' : 'إرسال'}</span>
        </button>
      </div>

      {isImageViewerOpen && activeImage
        ? createPortal(
            <div
              className="add-report-review-image-viewer"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="add-report-review-image-viewer__backdrop"
                onClick={closeImageViewer}
                aria-label="إغلاق عرض الصورة"
              />

              <div className="add-report-review-image-viewer__panel">
                <button
                  type="button"
                  className="add-report-review-image-viewer__close"
                  onClick={closeImageViewer}
                  aria-label="إغلاق"
                >
                  <FiX />
                </button>

                {hasMultipleImages ? (
                  <button
                    type="button"
                    className="add-report-review-image-viewer__nav add-report-review-image-viewer__nav--prev"
                    onClick={showPreviousImage}
                    aria-label="الصورة السابقة"
                  >
                    <FiChevronLeft />
                  </button>
                ) : null}

                <img src={activeImage.url} alt={activeImage.name} />

                {hasMultipleImages ? (
                  <button
                    type="button"
                    className="add-report-review-image-viewer__nav add-report-review-image-viewer__nav--next"
                    onClick={showNextImage}
                    aria-label="الصورة التالية"
                  >
                    <FiChevronRight />
                  </button>
                ) : null}

                <div className="add-report-review-image-viewer__footer">
                  <strong>{activeImage.name}</strong>
                  <span>
                    صورة {activeImageIndex + 1} من {imagePreviews.length}
                  </span>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}

export default ReviewStep;