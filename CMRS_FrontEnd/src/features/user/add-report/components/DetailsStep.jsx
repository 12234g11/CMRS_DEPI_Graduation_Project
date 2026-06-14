import { FiCamera, FiInfo, FiTarget, FiUploadCloud, FiX } from 'react-icons/fi';

function DetailsStep({
  values,
  limits,
  uploadMessage = '',
  onTitleChange,
  onDescriptionChange,
  onSeverityChange,
  onAddImages,
  onRemoveImage,
  onBack,
  onNext,
}) {
  const handleFileChange = (event) => {
    const nextFiles = Array.from(event.target.files || []);
    if (nextFiles.length) {
      onAddImages(nextFiles);
    }

    event.target.value = '';
  };

  const isNextDisabled = !values.title.trim() || !values.description.trim();

  return (
    <section className="add-report-step">
      <div className="add-report-step__grid add-report-step__grid--details">
        <article className="add-report-card add-report-upload-card">
          <header className="add-report-card__header">
            <div>
              <h3>صور المشكلة</h3>
              <p>Upload Images (max {limits.maxImages})</p>
            </div>

            <span className="add-report-card__icon">
              <FiCamera />
            </span>
          </header>

          <label className="add-report-upload-card__dropzone" htmlFor="add-report-images-input">
            <input
              id="add-report-images-input"
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileChange}
            />

            <span className="add-report-upload-card__dropzone-icon">
              <FiUploadCloud />
            </span>

            <strong>اسحب الصور هنا أو اضغط للاختيار</strong>
            <small>PNG, JPG حتى {limits.maxImageSizeMb}MB لكل صورة</small>
          </label>

          {uploadMessage ? (
            <p className="add-report-form__message">{uploadMessage}</p>
          ) : null}

          {values.imagePreviews.length ? (
            <div className="add-report-upload-card__preview-grid">
              {values.imagePreviews.map((preview) => (
                <div key={preview.id} className="add-report-upload-card__preview">
                  <img src={preview.url} alt={preview.name} />
                  <button
                    type="button"
                    className="add-report-upload-card__remove"
                    onClick={() => onRemoveImage(preview.id)}
                    aria-label={`حذف الصورة ${preview.name}`}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </article>

        <article className="add-report-card add-report-fields-card">
          <div className="add-report-fields-card__section">
            <header className="add-report-card__header">
              <div>
                <h3>عنوان المشكلة</h3>
                <p>Title</p>
              </div>

              <span className="add-report-card__icon">
                <FiInfo />
              </span>
            </header>

            <input
              type="text"
              placeholder="اكتب عنوان مناسب للمشكلة..."
              value={values.title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>

          <div className="add-report-fields-card__section">
            <header className="add-report-card__header">
              <div>
                <h3>وصف المشكلة</h3>
                <p>Description</p>
              </div>

              <span className="add-report-card__icon">
                <FiTarget />
              </span>
            </header>

            <div className="add-report-fields-card__counter">
              {values.description.length} / {limits.maxDescriptionLength}
            </div>

            <textarea
              rows="7"
              maxLength={limits.maxDescriptionLength}
              placeholder="اكتب وصفًا واضحًا للمشكلة، مثال: يوجد حفرة كبيرة في منتصف الشارع تشكل خطرًا على السيارات..."
              value={values.description}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </div>

          <div className="add-report-fields-card__section">
            <div className="add-report-severity-selector">
              <button
                type="button"
                className={`add-report-severity-chip is-${values.severity === 'high' ? 'active is-danger' : 'idle'}`}
                onClick={() => onSeverityChange('high')}
              >
                عالية
              </button>

              <button
                type="button"
                className={`add-report-severity-chip is-${values.severity === 'medium' ? 'active is-warning' : 'idle'}`}
                onClick={() => onSeverityChange('medium')}
              >
                متوسطة
              </button>

              <button
                type="button"
                className={`add-report-severity-chip is-${values.severity === 'low' ? 'active is-success' : 'idle'}`}
                onClick={() => onSeverityChange('low')}
              >
                منخفضة
              </button>
            </div>
          </div>
        </article>
      </div>

      <div className="add-report-step__actions">
        <button
          type="button"
          className="add-report-btn add-report-btn--ghost"
          onClick={onBack}
        >
          السابق
        </button>

        <button
          type="button"
          className="add-report-btn add-report-btn--primary"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          التالي
        </button>
      </div>
    </section>
  );
}

export default DetailsStep;
