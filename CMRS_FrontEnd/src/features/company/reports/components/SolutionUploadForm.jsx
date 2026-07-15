import { useEffect, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiEye,
  FiImage,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
} from 'react-icons/fi';
import ImagePreviewModal from './ImagePreviewModal';
import {
  isDuplicateImage,
  MAX_REPORT_IMAGES,
  validateReportImageFile,
  validateRequiredText,
} from '../utils/companyReportsValidation';

function createImagePreview(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
    file,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  };
}

function SolutionUploadForm({
  report,
  onSubmitSolution,
  onFilePickerOpen,
  onRequestTeamSelection,
}) {
  const [note, setNote] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const selectedImagesRef = useRef([]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

  if (!report) return null;

  const hasAssignedTeam = Boolean(
    report.assignedTeam &&
      (report.assignedTeam.id ||
        report.assignedTeam.teamId ||
        report.assignedTeam.name),
  );

  function clearFieldError(fieldName) {
    setErrors((currentErrors) => {
      if (!currentErrors[fieldName] && !currentErrors.submit) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      delete nextErrors.submit;
      return nextErrors;
    });
  }

  function handleFiles(filesList) {
    const incomingFiles = Array.from(filesList || []);

    if (!incomingFiles.length) return;

    const newErrors = [];
    const nextImages = [...selectedImages];

    incomingFiles.forEach((file) => {
      if (nextImages.length >= MAX_REPORT_IMAGES) {
        newErrors.push(`لا يمكن رفع أكثر من ${MAX_REPORT_IMAGES} صور.`);
        return;
      }

      const validationError = validateReportImageFile(file);
      if (validationError) {
        newErrors.push(validationError);
        return;
      }

      if (isDuplicateImage(file, nextImages)) {
        newErrors.push(`الصورة "${file.name}" مضافة بالفعل.`);
        return;
      }

      nextImages.push(createImagePreview(file));
    });

    setSelectedImages(nextImages);
    setErrors((currentErrors) => ({
      ...currentErrors,
      images: newErrors[0] || '',
      submit: '',
    }));
  }

  function openFilePicker(inputRef) {
    onFilePickerOpen?.();
    inputRef.current?.click();
  }

  function handleFileInputChange(event) {
    handleFiles(event.target.files);
    event.target.value = '';
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleRemoveImage(imageId) {
    setSelectedImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId);
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.previewUrl);
      return currentImages.filter((image) => image.id !== imageId);
    });

    clearFieldError('images');
  }

  function validateForm() {
    const nextErrors = {};

    if (!hasAssignedTeam) {
      nextErrors.team = 'يجب تعيين فرقة صيانة للبلاغ قبل إرسال الحل للأدمن.';
    }
    const noteError = validateRequiredText(note, {
      label: 'ملاحظة التنفيذ',
      minLength: 10,
      maxLength: 1000,
    });

    if (noteError) nextErrors.note = noteError;

    if (!selectedImages.length) {
      nextErrors.images = 'يجب رفع صورة واحدة على الأقل بعد الإصلاح.';
    }

    if (!isConfirmed) {
      nextErrors.confirmation = 'يجب تأكيد أن البيانات والصور توضح التنفيذ الفعلي.';
    }

    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      await onSubmitSolution?.({
        note: note.trim(),
        files: selectedImages.map((image) => image.file),
      });

      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setNote('');
      setSelectedImages([]);
      setIsConfirmed(false);
      setErrors({});
    } catch (requestError) {
      setErrors({
        submit: requestError.message || 'تعذر إرسال الحل للأدمن. حاول مرة أخرى.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="company-solution-form" onSubmit={handleSubmit} noValidate>
      <header className="company-report-section-header">
        <div>
          <h2>{report.status === 'مطلوب استكمال' ? 'استكمال الحل وإعادة إرساله' : 'إرسال الحل للأدمن'}</h2>
          <p>
            اكتب ما تم تنفيذه وارفع صورًا واضحة؛ بعدها ينتقل البلاغ لمراجعة الأدمن.
          </p>
        </div>

        <span>
          <FiUploadCloud />
        </span>
      </header>

      {report.status === 'مطلوب استكمال' ? (
        <div className="company-solution-required-note">
          <FiAlertCircle />
          <div>
            <strong>الأعمال المطلوب استكمالها</strong>
            <p>
              {report.adminReview?.companyMessage ||
                report.adminReview?.note ||
                report.adminReview?.completionRequirements ||
                report.adminNote ||
                'لا توجد بيانات للعرض'}
            </p>
          </div>
        </div>
      ) : null}

      {!hasAssignedTeam ? (
        <div className="company-start-team-required" role="alert">
          <FiAlertCircle />
          <div>
            <strong>يجب تعيين فرقة صيانة قبل إرسال الحل</strong>
            <p>لن يسمح النظام بإرسال الحل للأدمن قبل تحديد الفرقة المسؤولة عن التنفيذ.</p>
          </div>
          <button type="button" onClick={onRequestTeamSelection}>
            اختيار فرقة صيانة
          </button>
        </div>
      ) : null}
      {errors.team ? (
        <small className="company-report-field-error">{errors.team}</small>
      ) : null}

      <label className="company-report-form-field">
        <span>
          ملاحظة التنفيذ <b>*</b>
        </span>

        <textarea
          value={note}
          onChange={(event) => {
            setNote(event.target.value.slice(0, 1000));
            clearFieldError('note');
          }}
          onBlur={() => {
            const validationError = validateRequiredText(note, {
              label: 'ملاحظة التنفيذ',
              minLength: 10,
              maxLength: 1000,
            });
            setErrors((currentErrors) => ({ ...currentErrors, note: validationError }));
          }}
          rows={5}
          placeholder="اكتب بالتفصيل ما تم إصلاحه، وما تم تغييره، وكيف تم التأكد من نجاح التنفيذ..."
          aria-invalid={Boolean(errors.note)}
        />

        <small className="company-report-field-counter">{note.length} / 1000</small>
        {errors.note ? <small className="company-report-field-error">{errors.note}</small> : null}
      </label>

      <div className="company-report-form-field">
        <span>
          صور ما بعد الإصلاح <b>*</b>
        </span>

        <div
          className={`company-solution-upload-zone ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            className="company-solution-upload-input"
            onChange={handleFileInputChange}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="company-solution-upload-input"
            onChange={handleFileInputChange}
          />

          <button
            type="button"
            className="company-solution-upload-main-icon"
            onClick={() => openFilePicker(fileInputRef)}
            aria-label="اختيار صور من الجهاز"
          >
            <FiPlus />
          </button>

          <div className="company-solution-upload-content">
            <strong>اسحب الصور هنا أو اخترها من جهازك</strong>
            <p>JPG أو JPEG أو PNG أو WEBP، وبحد أقصى 5 ميجابايت للصورة.</p>

            <div className="company-solution-upload-actions">
              <button type="button" onClick={() => openFilePicker(fileInputRef)}>
                <FiImage />
                اختيار صور
              </button>

              <button type="button" onClick={() => openFilePicker(cameraInputRef)}>
                <FiCamera />
                فتح الكاميرا
              </button>
            </div>
          </div>
        </div>

        <small className="company-solution-upload-limit">
          {selectedImages.length} من {MAX_REPORT_IMAGES} صور مضافة.
        </small>
        {errors.images ? <small className="company-report-field-error">{errors.images}</small> : null}
      </div>

      {selectedImages.length ? (
        <div className="company-solution-images-preview">
          {selectedImages.map((image) => (
            <article key={image.id} className="company-solution-image-preview">
              <img src={image.previewUrl} alt={image.name} />

              <div className="company-solution-image-preview__overlay">
                <button
                  type="button"
                  onClick={() => setPreviewImage({ url: image.previewUrl, alt: image.name })}
                  aria-label={`معاينة ${image.name}`}
                >
                  <FiEye />
                  معاينة
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  aria-label={`حذف ${image.name}`}
                >
                  <FiTrash2 />
                  حذف
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <label className="company-report-confirmation">
        <input
          type="checkbox"
          checked={isConfirmed}
          onChange={(event) => {
            setIsConfirmed(event.target.checked);
            clearFieldError('confirmation');
          }}
        />
        <span>أؤكد أن الملاحظة والصور توضح التنفيذ الفعلي للبلاغ.</span>
      </label>
      {errors.confirmation ? <small className="company-report-field-error">{errors.confirmation}</small> : null}

      {errors.submit ? (
        <p className="company-report-form-error" role="alert">
          <FiAlertCircle />
          {errors.submit}
        </p>
      ) : null}

      <button
        type="submit"
        className="company-submit-solution-btn"
        disabled={isSaving || !hasAssignedTeam}
        title={!hasAssignedTeam ? 'يجب تعيين فرقة صيانة قبل إرسال الحل.' : undefined}
      >
        <FiCheckCircle />
        {isSaving ? 'جاري إرسال الحل...' : 'إرسال الحل لمراجعة الأدمن'}
      </button>

      <p className="company-solution-form__hint">
        لن يتحول البلاغ إلى «تم الحل» إلا بعد اعتماد الأدمن للصور والملاحظة.
      </p>

      <ImagePreviewModal
        imageUrl={previewImage?.url}
        alt={previewImage?.alt}
        onClose={() => setPreviewImage(null)}
      />
    </form>
  );
}

export default SolutionUploadForm;
