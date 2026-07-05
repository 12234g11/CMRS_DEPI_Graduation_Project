import { createPortal } from 'react-dom';
import { useMemo, useRef, useState } from 'react';
import {
  FiCamera,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiInfo,
  FiImage,
  FiTarget,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi';

const VALID_SEVERITIES = ['low', 'medium', 'high'];
const WEBP_QUALITIES = [0.82, 0.72, 0.62];
const MAX_IMAGE_SIDE = 1600;

function getFileBaseName(fileName = 'report-image') {
  const cleanName =
    fileName.split('/').pop()?.split('\\').pop() || 'report-image';

  return cleanName.replace(/\.[^/.]+$/, '') || 'report-image';
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('تعذر قراءة الصورة.'));
    };

    image.src = objectUrl;
  });
}

function canvasToWebpBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('تعذر تحويل الصورة إلى WEBP.'));
          return;
        }

        resolve(blob);
      },
      'image/webp',
      quality
    );
  });
}

async function convertImageToWebp(file, maxSizeBytes) {
  const image = await loadImageFromFile(file);

  const largestSide = Math.max(image.width, image.height);
  const scale = largestSide > MAX_IMAGE_SIDE ? MAX_IMAGE_SIDE / largestSide : 1;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let bestBlob = null;

  for (const quality of WEBP_QUALITIES) {
    const blob = await canvasToWebpBlob(canvas, quality);
    bestBlob = blob;

    if (blob.size <= maxSizeBytes) {
      break;
    }
  }

  const webpFileName = `${getFileBaseName(file.name)}.webp`;

  return new File([bestBlob], webpFileName, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

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
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [localUploadMessage, setLocalUploadMessage] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [activePreviewIndex, setActivePreviewIndex] = useState(null);

  const maxImages = limits?.maxImages || 5;
  const minImages = limits?.minImages ?? 1;
  const maxImageSizeMb = limits?.maxImageSizeMb || 5;

  const maxTitleLength = limits?.maxTitleLength || 100;
  const minTitleLength = limits?.minTitleLength || 5;

  const maxDescriptionLength = limits?.maxDescriptionLength || 500;
  const minDescriptionLength = limits?.minDescriptionLength || 10;

  const maxImageSizeBytes = maxImageSizeMb * 1024 * 1024;

  const images = Array.isArray(values.images) ? values.images : [];
  const imagePreviews = Array.isArray(values.imagePreviews)
    ? values.imagePreviews
    : [];

  const titleValue = values.title || '';
  const descriptionValue = values.description || '';
  const selectedSeverity = values.severity || '';

  const validationErrors = useMemo(() => {
    const errors = {};

    const trimmedTitle = titleValue.trim();
    const trimmedDescription = descriptionValue.trim();
    const currentImagesCount = images.length;

    if (!trimmedTitle) {
      errors.title = 'عنوان المشكلة مطلوب.';
    } else if (trimmedTitle.length < minTitleLength) {
      errors.title = `عنوان المشكلة يجب ألا يقل عن ${minTitleLength} أحرف.`;
    } else if (trimmedTitle.length > maxTitleLength) {
      errors.title = `عنوان المشكلة يجب ألا يزيد عن ${maxTitleLength} حرف شامل المسافات.`;
    }

    if (!trimmedDescription) {
      errors.description = 'وصف المشكلة مطلوب.';
    } else if (trimmedDescription.length < minDescriptionLength) {
      errors.description = `وصف المشكلة يجب ألا يقل عن ${minDescriptionLength} أحرف.`;
    } else if (trimmedDescription.length > maxDescriptionLength) {
      errors.description = `وصف المشكلة يجب ألا يزيد عن ${maxDescriptionLength} حرف شامل المسافات.`;
    }

    if (!VALID_SEVERITIES.includes(selectedSeverity)) {
      errors.severity = 'برجاء اختيار أولوية البلاغ.';
    }

    if (currentImagesCount < minImages) {
      errors.images = 'يجب إضافة صورة واحدة على الأقل للمشكلة قبل المتابعة.';
    } else if (currentImagesCount > maxImages) {
      errors.images = `يمكنك رفع ${maxImages} صور كحد أقصى.`;
    }

    return errors;
  }, [
    titleValue,
    descriptionValue,
    selectedSeverity,
    images.length,
    minImages,
    maxImages,
    maxTitleLength,
    minTitleLength,
    maxDescriptionLength,
    minDescriptionLength,
  ]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  const activePreview =
    activePreviewIndex !== null ? imagePreviews?.[activePreviewIndex] : null;

  function showFieldError(fieldName) {
    return touchedFields[fieldName] && validationErrors[fieldName];
  }

  function handleTitleBlur() {
    setTouchedFields((current) => ({
      ...current,
      title: true,
    }));
  }

  function handleDescriptionBlur() {
    setTouchedFields((current) => ({
      ...current,
      description: true,
    }));
  }

  function handleSeveritySelect(severity) {
    setTouchedFields((current) => ({
      ...current,
      severity: true,
    }));

    onSeverityChange(severity);
  }

  async function prepareImages(files) {
    const currentImagesCount = images.length;
    const remainingSlots = maxImages - currentImagesCount;

    if (remainingSlots <= 0) {
      setLocalUploadMessage(`لا يمكن إضافة أكثر من ${maxImages} صور.`);
      return [];
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const ignoredFilesCount = files.length - imageFiles.length;

    const limitedFiles = imageFiles.slice(0, remainingSlots);
    const ignoredByLimitCount = imageFiles.length - limitedFiles.length;

    const convertedFiles = [];
    const rejectedMessages = [];

    if (ignoredFilesCount) {
      rejectedMessages.push('تم تجاهل الملفات غير الصورية.');
    }

    if (ignoredByLimitCount) {
      rejectedMessages.push(`يمكنك رفع ${maxImages} صور كحد أقصى.`);
    }

    setIsProcessingImages(true);

    try {
      for (const file of limitedFiles) {
        try {
          const webpFile = await convertImageToWebp(file, maxImageSizeBytes);

          if (webpFile.size > maxImageSizeBytes) {
            rejectedMessages.push(
              `الصورة "${file.name}" أكبر من ${maxImageSizeMb} ميجابايت بعد التحويل.`
            );
            continue;
          }

          convertedFiles.push(webpFile);
        } catch {
          rejectedMessages.push(`تعذر تحويل الصورة "${file.name}" إلى WEBP.`);
        }
      }
    } finally {
      setIsProcessingImages(false);
    }

    setLocalUploadMessage(rejectedMessages.join(' '));

    return convertedFiles;
  }

  async function handleFiles(filesList) {
    const nextFiles = Array.from(filesList || []);

    if (!nextFiles.length) return;

    setTouchedFields((current) => ({
      ...current,
      images: true,
    }));

    const convertedFiles = await prepareImages(nextFiles);

    if (convertedFiles.length) {
      onAddImages(convertedFiles);
    }
  }

  async function handleFileChange(event) {
    await handleFiles(event.target.files);
    event.target.value = '';
  }

  async function handleDrop(event) {
    event.preventDefault();
    await handleFiles(event.dataTransfer.files);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleNextClick() {
    setTouchedFields({
      title: true,
      description: true,
      severity: true,
      images: true,
    });

    if (!isFormValid || isProcessingImages) {
      return;
    }

    onNext();
  }

  function openGalleryPicker() {
    galleryInputRef.current?.click();
  }

  function openCameraPicker() {
    cameraInputRef.current?.click();
  }

  function openPreview(index) {
    setActivePreviewIndex(index);
  }

  function closePreview() {
    setActivePreviewIndex(null);
  }

  function showPreviousPreview() {
    setActivePreviewIndex((currentIndex) => {
      if (currentIndex === null) return null;

      const total = imagePreviews.length;
      return currentIndex === 0 ? total - 1 : currentIndex - 1;
    });
  }

  function showNextPreview() {
    setActivePreviewIndex((currentIndex) => {
      if (currentIndex === null) return null;

      const total = imagePreviews.length;
      return currentIndex === total - 1 ? 0 : currentIndex + 1;
    });
  }

  return (
    <section className="add-report-step">
      <div className="add-report-step__grid add-report-step__grid--details">
        <article className="add-report-card add-report-upload-card">
          <header className="add-report-card__header">
            <div>
              <h3>صور المشكلة</h3>
              <p>
                يجب إضافة صورة واحدة على الأقل، ويمكنك رفع حتى {maxImages} صور
                بحد أقصى {maxImageSizeMb} ميجابايت لكل صورة
              </p>
            </div>

            <span className="add-report-card__icon">
              <FiCamera />
            </span>
          </header>

          <input
            ref={galleryInputRef}
            id="add-report-images-input"
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChange}
          />

          <input
            ref={cameraInputRef}
            id="add-report-camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handleFileChange}
          />

          <div
            className={`add-report-upload-card__dropzone ${
              showFieldError('images') ? 'is-invalid' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <span className="add-report-upload-card__dropzone-icon">
              <FiUploadCloud />
            </span>

            <strong>اسحب الصور هنا أو اختر طريقة الإضافة</strong>

            <div className="add-report-upload-card__actions">
              <button
                type="button"
                className="add-report-upload-card__action-btn"
                onClick={openGalleryPicker}
                disabled={isProcessingImages}
              >
                <FiImage />
                رفع من الجهاز
              </button>

              <button
                type="button"
                className="add-report-upload-card__action-btn add-report-upload-card__action-btn--camera"
                onClick={openCameraPicker}
                disabled={isProcessingImages}
              >
                <FiCamera />
                تصوير بالكاميرا
              </button>
            </div>
          </div>

          {isProcessingImages ? (
            <p className="add-report-form__message">
              جاري تجهيز الصور وتحويلها إلى WEBP...
            </p>
          ) : null}

          {localUploadMessage || uploadMessage ? (
            <p className="add-report-form__message add-report-form__message--error">
              {localUploadMessage || uploadMessage}
            </p>
          ) : null}

          {showFieldError('images') ? (
            <p className="add-report-form__message add-report-form__message--error">
              {validationErrors.images}
            </p>
          ) : null}

          {imagePreviews.length ? (
            <div className="add-report-upload-card__preview-section">
              <div className="add-report-upload-card__preview-header">
                <strong>
                  الصور المضافة ({imagePreviews.length}/{maxImages})
                </strong>

                <small>اضغط على أي صورة لعرضها بحجم أكبر</small>
              </div>

              <div className="add-report-upload-card__preview-strip">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={preview.id}
                    className="add-report-upload-card__preview"
                  >
                    <button
                      type="button"
                      className="add-report-upload-card__preview-open"
                      onClick={() => openPreview(index)}
                      aria-label={`عرض الصورة ${preview.name}`}
                    >
                      <img src={preview.url} alt={preview.name} />

                      <span className="add-report-upload-card__preview-hint">
                        <FiEye />
                        اضغط للعرض الكامل
                      </span>
                    </button>

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
            </div>
          ) : null}
        </article>

        <article className="add-report-card add-report-fields-card">
          <div className="add-report-fields-card__section">
            <header className="add-report-card__header">
              <div>
                <h3>عنوان المشكلة</h3>
                <p>بحد أقصى {maxTitleLength} حرف شامل المسافات</p>
              </div>

              <span className="add-report-card__icon">
                <FiInfo />
              </span>
            </header>

            <input
              type="text"
              maxLength={maxTitleLength}
              placeholder="اكتب عنوان مناسب للمشكلة..."
              value={titleValue}
              onBlur={handleTitleBlur}
              onChange={(event) => onTitleChange(event.target.value)}
              className={showFieldError('title') ? 'is-invalid' : ''}
            />

            <div className="add-report-fields-card__counter">
              {titleValue.length} / {maxTitleLength}
            </div>

            {showFieldError('title') ? (
              <p className="add-report-form__message add-report-form__message--error">
                {validationErrors.title}
              </p>
            ) : null}
          </div>

          <div className="add-report-fields-card__section">
            <header className="add-report-card__header">
              <div>
                <h3>وصف المشكلة</h3>
                <p>بحد أقصى {maxDescriptionLength} حرف شامل المسافات</p>
              </div>

              <span className="add-report-card__icon">
                <FiTarget />
              </span>
            </header>

            <div className="add-report-fields-card__counter">
              {descriptionValue.length} / {maxDescriptionLength}
            </div>

            <textarea
              rows="7"
              maxLength={maxDescriptionLength}
              placeholder="اكتب وصفًا واضحًا للمشكلة..."
              value={descriptionValue}
              onBlur={handleDescriptionBlur}
              onChange={(event) => onDescriptionChange(event.target.value)}
              className={showFieldError('description') ? 'is-invalid' : ''}
            />

            {showFieldError('description') ? (
              <p className="add-report-form__message add-report-form__message--error">
                {validationErrors.description}
              </p>
            ) : null}
          </div>

          <div className="add-report-fields-card__section">
            <div className="add-report-severity-selector">
              <button
                type="button"
                className={`add-report-severity-chip ${
                  selectedSeverity === 'high' ? 'active is-danger' : 'idle'
                }`}
                onClick={() => handleSeveritySelect('high')}
              >
                عالية
              </button>

              <button
                type="button"
                className={`add-report-severity-chip ${
                  selectedSeverity === 'medium' ? 'active is-warning' : 'idle'
                }`}
                onClick={() => handleSeveritySelect('medium')}
              >
                متوسطة
              </button>

              <button
                type="button"
                className={`add-report-severity-chip ${
                  selectedSeverity === 'low' ? 'active is-success' : 'idle'
                }`}
                onClick={() => handleSeveritySelect('low')}
              >
                منخفضة
              </button>
            </div>

            {showFieldError('severity') ? (
              <p className="add-report-form__message add-report-form__message--error">
                {validationErrors.severity}
              </p>
            ) : null}
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
          onClick={handleNextClick}
          disabled={!isFormValid || isProcessingImages}
        >
          التالي
        </button>
      </div>

      {activePreview
        ? createPortal(
            <div
              className="add-report-image-viewer"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="add-report-image-viewer__backdrop"
                onClick={closePreview}
                aria-label="إغلاق عرض الصورة"
              />

              <div className="add-report-image-viewer__panel">
                <button
                  type="button"
                  className="add-report-image-viewer__close"
                  onClick={closePreview}
                  aria-label="إغلاق"
                >
                  <FiX />
                </button>

                <button
                  type="button"
                  className="add-report-image-viewer__nav add-report-image-viewer__nav--prev"
                  onClick={showPreviousPreview}
                  aria-label="الصورة السابقة"
                  disabled={imagePreviews.length <= 1}
                >
                  <FiChevronLeft />
                </button>

                <img src={activePreview.url} alt={activePreview.name} />

                <button
                  type="button"
                  className="add-report-image-viewer__nav add-report-image-viewer__nav--next"
                  onClick={showNextPreview}
                  aria-label="الصورة التالية"
                  disabled={imagePreviews.length <= 1}
                >
                  <FiChevronRight />
                </button>

                <div className="add-report-image-viewer__footer">
                  <strong>{activePreview.name}</strong>
                  <span>
                    صورة {activePreviewIndex + 1} من {imagePreviews.length}
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

export default DetailsStep;