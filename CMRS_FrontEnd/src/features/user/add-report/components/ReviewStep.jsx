import { FiInfo, FiMapPin, FiMessageSquare, FiSend } from 'react-icons/fi';
import { buildReportPreviewImage } from '../../reports/utils/buildReportPreviewImage';
import CategoryIcon from './CategoryIcon';

function ReviewStep({
  values,
  category,
  locationLabel = '',
  onBack,
  onSubmit,
  isSubmitting = false,
  submitError = '',
}) {
  const previewImage =
    values.imagePreviews[0]?.url ||
    buildReportPreviewImage({
      title: values.title || 'بلاغ جديد',
      categoryLabel: category?.label || 'أخرى',
      tone: category?.tone || 'warning',
    });

  return (
    <section className="add-report-step">
      <div className="add-report-review-grid">
        <aside className="add-report-review-image-card">
          <img src={previewImage} alt={values.title || 'معاينة البلاغ'} />

          {values.imagePreviews.length > 1 ? (
            <span className="add-report-review-image-card__count">
              +{values.imagePreviews.length - 1} صور إضافية
            </span>
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
              <span className={`add-report-review-card__label-icon is-${category?.tone || 'slate'}`.trim()}>
                <CategoryIcon iconKey={category?.iconKey} />
              </span>
              نوع المشكلة
            </span>

            <strong>{category?.label || 'أخرى'}</strong>
            <small className="add-report-review-card__value-subtitle">
              {category?.subtitle || 'Other'}
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
    </section>
  );
}

export default ReviewStep;