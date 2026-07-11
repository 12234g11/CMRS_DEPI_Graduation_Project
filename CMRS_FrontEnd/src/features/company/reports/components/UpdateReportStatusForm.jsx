import { useEffect, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiCamera,
  FiChevronDown,
  FiEye,
  FiImage,
  FiPlayCircle,
  FiPlus,
  FiSend,
  FiTrash2,
  FiXCircle,
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

function revokeImages(images = []) {
  images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
}

function UpdateReportStatusForm({
  report,
  onStartWork,
  onCannotFix,
  onRequestTeamSelection,
}) {
  const [startNote, setStartNote] = useState('');
  const [startImages, setStartImages] = useState([]);
  const [cannotFixReason, setCannotFixReason] = useState('');
  const [cannotFixNote, setCannotFixNote] = useState('');
  const [cannotFixImages, setCannotFixImages] = useState([]);
  const [isCannotFixOpen, setIsCannotFixOpen] = useState(false);
  const [isCannotFixConfirmed, setIsCannotFixConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSavingAction, setIsSavingAction] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const startFileInputRef = useRef(null);
  const startCameraInputRef = useRef(null);
  const cannotFixFileInputRef = useRef(null);
  const startImagesRef = useRef([]);
  const cannotFixImagesRef = useRef([]);

  useEffect(() => {
    startImagesRef.current = startImages;
  }, [startImages]);

  useEffect(() => {
    cannotFixImagesRef.current = cannotFixImages;
  }, [cannotFixImages]);

  useEffect(() => {
    return () => {
      revokeImages(startImagesRef.current);
      revokeImages(cannotFixImagesRef.current);
    };
  }, []);

  if (!report) return null;

  const canStart = report.status === 'تم التعيين';
  const canSendCannotFix = ['تم التعيين', 'جاري التنفيذ', 'مطلوب استكمال'].includes(
    report.status,
  );
  const hasAssignedTeam = Boolean(report.assignedTeam?.id);

  function clearFieldError(fieldName) {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      delete nextErrors.submit;
      return nextErrors;
    });
  }

  function addImages(filesList, currentImages, setImages, errorField) {
    const incomingFiles = Array.from(filesList || []);
    const fileErrors = [];
    const nextImages = [...currentImages];

    incomingFiles.forEach((file) => {
      if (nextImages.length >= MAX_REPORT_IMAGES) {
        fileErrors.push(`لا يمكن رفع أكثر من ${MAX_REPORT_IMAGES} صور.`);
        return;
      }

      const validationError = validateReportImageFile(file);
      if (validationError) {
        fileErrors.push(validationError);
        return;
      }

      if (isDuplicateImage(file, nextImages)) {
        fileErrors.push(`الصورة "${file.name}" مضافة بالفعل.`);
        return;
      }

      nextImages.push(createImagePreview(file));
    });

    setImages(nextImages);
    setErrors((currentErrors) => ({
      ...currentErrors,
      [errorField]: fileErrors[0] || '',
      submit: '',
    }));
  }

  function removeImage(imageId, setImages) {
    setImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId);
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.previewUrl);
      return currentImages.filter((image) => image.id !== imageId);
    });
  }

  async function handleStartWork() {
    const nextErrors = {};

    if (!hasAssignedTeam) {
      nextErrors.team = 'اختر فرقة الصيانة المسؤولة قبل بدء التنفيذ.';
    }

    if (startNote.trim().length > 500) {
      nextErrors.startNote = 'ملاحظة بدء التنفيذ يجب ألا تزيد عن 500 حرف.';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const isConfirmed = window.confirm(
      'هل أنت متأكد من بدء تنفيذ البلاغ؟ ستتغير الحالة إلى جاري التنفيذ، وستُرفع صور المعاينة المضافة كدليل بدء.',
    );

    if (!isConfirmed) return;

    setIsSavingAction('start');

    try {
      await onStartWork?.({
        note: startNote.trim(),
        files: startImages.map((image) => image.file),
      });

      revokeImages(startImages);
      setStartImages([]);
      setStartNote('');
      setErrors({});
    } catch (requestError) {
      setErrors({
        submit:
          requestError.message ||
          'تعذر بدء تنفيذ البلاغ. راجع الاتصال وحاول مرة أخرى.',
      });
    } finally {
      setIsSavingAction('');
    }
  }

  function validateCannotFixForm() {
    const nextErrors = {};
    const reasonError = validateRequiredText(cannotFixReason, {
      label: 'سبب التعذر',
      minLength: 5,
      maxLength: 200,
    });
    const noteError = validateRequiredText(cannotFixNote, {
      label: 'تفاصيل التعذر',
      minLength: 10,
      maxLength: 1000,
    });

    if (reasonError) nextErrors.cannotFixReason = reasonError;
    if (noteError) nextErrors.cannotFixNote = noteError;
    if (!isCannotFixConfirmed) {
      nextErrors.cannotFixConfirmation =
        'يجب تأكيد صحة سبب التعذر قبل الإرسال.';
    }

    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  }

  async function handleCannotFix(event) {
    event.preventDefault();

    if (!validateCannotFixForm()) return;

    const isConfirmed = window.confirm(
      'سيتم إرسال سبب تعذر التنفيذ للأدمن للمراجعة. هل تريد المتابعة؟',
    );

    if (!isConfirmed) return;

    setIsSavingAction('cannot-fix');

    try {
      await onCannotFix?.({
        reason: cannotFixReason.trim(),
        note: cannotFixNote.trim(),
        files: cannotFixImages.map((image) => image.file),
      });

      revokeImages(cannotFixImages);
      setCannotFixReason('');
      setCannotFixNote('');
      setCannotFixImages([]);
      setIsCannotFixConfirmed(false);
      setIsCannotFixOpen(false);
      setErrors({});
    } catch (requestError) {
      setErrors({
        submit:
          requestError.message || 'تعذر إرسال سبب تعذر التنفيذ للأدمن.',
      });
    } finally {
      setIsSavingAction('');
    }
  }

  if (!canStart && !canSendCannotFix) return null;

  return (
    <section className="company-status-form">
      <header className="company-report-section-header">
        <div>
          <h2>إدارة تنفيذ البلاغ</h2>
          <p>
            ابدأ التنفيذ بعد اختيار الفرقة، أو أرسل تعذر التنفيذ للأدمن عند وجود مانع حقيقي.
          </p>
        </div>

        <span>
          <FiSend />
        </span>
      </header>

      <div className="company-current-status-box">
        <span>الحالة الحالية</span>
        <strong>{report.status}</strong>
      </div>

      {canStart ? (
        <div className="company-start-work-panel">
          <div className="company-start-work-panel__intro">
            <div>
              <strong>بدء تنفيذ البلاغ</strong>
              <p>
                اختر فرقة الصيانة أولًا، ثم أضف ملاحظة وصور المعاينة قبل تغيير الحالة إلى جاري التنفيذ.
              </p>
            </div>

            <span
              className={`company-start-team-state ${hasAssignedTeam ? 'is-ready' : 'is-missing'}`}
            >
              {hasAssignedTeam
                ? `الفرقة: ${report.assignedTeam.name}`
                : 'لم يتم اختيار فرقة صيانة'}
            </span>
          </div>

          {!hasAssignedTeam ? (
            <div className="company-start-team-required" role="alert">
              <FiAlertCircle />
              <div>
                <strong>اختيار فرقة الصيانة مطلوب قبل البدء</strong>
                <p>لن يتم تفعيل زر بدء التنفيذ قبل تحديد الفرقة المسؤولة.</p>
              </div>
              <button type="button" onClick={onRequestTeamSelection}>
                اختيار فرقة الآن
              </button>
            </div>
          ) : null}
          {errors.team ? (
            <small className="company-report-field-error">{errors.team}</small>
          ) : null}

          <label className="company-report-form-field">
            <span>
              ملاحظة بدء التنفيذ <small>(اختيارية)</small>
            </span>
            <textarea
              value={startNote}
              onChange={(event) => {
                setStartNote(event.target.value.slice(0, 500));
                clearFieldError('startNote');
              }}
              rows={3}
              placeholder="مثال: تمت معاينة الموقع وبدأ تجهيز الأدوات المطلوبة..."
            />
            <small className="company-report-field-counter">
              {startNote.length} / 500
            </small>
            {errors.startNote ? (
              <small className="company-report-field-error">{errors.startNote}</small>
            ) : null}
          </label>

          <div className="company-report-form-field">
            <span>
              صور معاينة وبداية التنفيذ <small>(اختيارية)</small>
            </span>

            <div className="company-start-proof-upload">
              <input
                ref={startFileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => {
                  addImages(
                    event.target.files,
                    startImages,
                    setStartImages,
                    'startImages',
                  );
                  event.target.value = '';
                }}
              />
              <input
                ref={startCameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={(event) => {
                  addImages(
                    event.target.files,
                    startImages,
                    setStartImages,
                    'startImages',
                  );
                  event.target.value = '';
                }}
              />

              <div>
                <FiImage />
                <strong>أرفق دليل المعاينة أو بداية العمل</strong>
                <p>حتى {MAX_REPORT_IMAGES} صور، وبحد أقصى 5 ميجابايت للصورة.</p>
              </div>

              <div className="company-start-proof-upload__actions">
                <button type="button" onClick={() => startFileInputRef.current?.click()}>
                  <FiPlus />
                  اختيار صور
                </button>
                <button type="button" onClick={() => startCameraInputRef.current?.click()}>
                  <FiCamera />
                  فتح الكاميرا
                </button>
              </div>
            </div>

            {errors.startImages ? (
              <small className="company-report-field-error">{errors.startImages}</small>
            ) : null}
          </div>

          {startImages.length ? (
            <div className="company-solution-images-preview company-start-images-preview">
              {startImages.map((image) => (
                <article key={image.id} className="company-solution-image-preview">
                  <img src={image.previewUrl} alt={image.name} />
                  <div className="company-solution-image-preview__overlay">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage({ url: image.previewUrl, alt: image.name })
                      }
                    >
                      <FiEye />
                      معاينة
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id, setStartImages)}
                    >
                      <FiTrash2 />
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className="company-start-work-btn"
            onClick={handleStartWork}
            disabled={Boolean(isSavingAction) || !hasAssignedTeam}
          >
            <FiPlayCircle />
            {isSavingAction === 'start'
              ? 'جاري بدء التنفيذ ورفع الدليل...'
              : 'تأكيد بدء التنفيذ'}
          </button>
        </div>
      ) : null}

      {canSendCannotFix ? (
        <div className="company-cannot-fix-section">
          <button
            type="button"
            className={`company-cannot-fix-toggle ${isCannotFixOpen ? 'is-open' : ''}`}
            onClick={() => setIsCannotFixOpen((value) => !value)}
            aria-expanded={isCannotFixOpen}
          >
            <span>
              <FiXCircle />
              لا يمكن تنفيذ البلاغ؟ أرسل الاعتذار والسبب للأدمن
            </span>
            <FiChevronDown />
          </button>

          {isCannotFixOpen ? (
            <form
              className="company-cannot-fix-form"
              onSubmit={handleCannotFix}
              noValidate
            >
              <div className="company-cannot-fix-warning">
                <FiAlertCircle />
                استخدم هذا الإجراء فقط عند وجود مانع حقيقي، وسيتم إرسال السبب والمرفقات للأدمن للمراجعة.
              </div>

              <label className="company-report-form-field">
                <span>
                  سبب التعذر المختصر <b>*</b>
                </span>
                <input
                  type="text"
                  value={cannotFixReason}
                  onChange={(event) => {
                    setCannotFixReason(event.target.value.slice(0, 200));
                    clearFieldError('cannotFixReason');
                  }}
                  placeholder="مثال: يحتاج العمل إلى تصريح فصل تيار"
                  aria-invalid={Boolean(errors.cannotFixReason)}
                />
                <small className="company-report-field-counter">
                  {cannotFixReason.length} / 200
                </small>
                {errors.cannotFixReason ? (
                  <small className="company-report-field-error">
                    {errors.cannotFixReason}
                  </small>
                ) : null}
              </label>

              <label className="company-report-form-field">
                <span>
                  تفاصيل التعذر وما المطلوب من الأدمن <b>*</b>
                </span>
                <textarea
                  value={cannotFixNote}
                  onChange={(event) => {
                    setCannotFixNote(event.target.value.slice(0, 1000));
                    clearFieldError('cannotFixNote');
                  }}
                  rows={5}
                  placeholder="اشرح المانع بالتفصيل، وما الإجراء أو التصريح المطلوب لإمكانية التنفيذ..."
                  aria-invalid={Boolean(errors.cannotFixNote)}
                />
                <small className="company-report-field-counter">
                  {cannotFixNote.length} / 1000
                </small>
                {errors.cannotFixNote ? (
                  <small className="company-report-field-error">
                    {errors.cannotFixNote}
                  </small>
                ) : null}
              </label>

              <div className="company-report-form-field">
                <span>
                  صور توضيحية <small>(اختيارية)</small>
                </span>
                <input
                  ref={cannotFixFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  multiple
                  className="company-hidden-file-input"
                  onChange={(event) => {
                    addImages(
                      event.target.files,
                      cannotFixImages,
                      setCannotFixImages,
                      'cannotFixImages',
                    );
                    event.target.value = '';
                  }}
                />

                <button
                  type="button"
                  className="company-cannot-fix-upload-btn"
                  onClick={() => cannotFixFileInputRef.current?.click()}
                >
                  <FiImage />
                  إضافة صور توضيحية
                </button>
                <small>
                  الصيغ: JPG وJPEG وPNG وWEBP — حتى {MAX_REPORT_IMAGES} صور.
                </small>
                {errors.cannotFixImages ? (
                  <small className="company-report-field-error">
                    {errors.cannotFixImages}
                  </small>
                ) : null}
              </div>

              {cannotFixImages.length ? (
                <div className="company-solution-images-preview">
                  {cannotFixImages.map((image) => (
                    <article key={image.id} className="company-solution-image-preview">
                      <img src={image.previewUrl} alt={image.name} />
                      <div className="company-solution-image-preview__overlay">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({ url: image.previewUrl, alt: image.name })
                          }
                        >
                          <FiEye />
                          معاينة
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(image.id, setCannotFixImages)}
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
                  checked={isCannotFixConfirmed}
                  onChange={(event) => {
                    setIsCannotFixConfirmed(event.target.checked);
                    clearFieldError('cannotFixConfirmation');
                  }}
                />
                <span>
                  أؤكد أن سبب التعذر صحيح وأن البيانات المرسلة واضحة للأدمن.
                </span>
              </label>
              {errors.cannotFixConfirmation ? (
                <small className="company-report-field-error">
                  {errors.cannotFixConfirmation}
                </small>
              ) : null}

              <button
                type="submit"
                className="company-submit-cannot-fix-btn"
                disabled={Boolean(isSavingAction)}
              >
                <FiXCircle />
                {isSavingAction === 'cannot-fix'
                  ? 'جاري إرسال التعذر...'
                  : 'إرسال تعذر التنفيذ للأدمن'}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {errors.submit ? (
        <p className="company-report-form-error" role="alert">
          <FiAlertCircle />
          {errors.submit}
        </p>
      ) : null}

      <ImagePreviewModal
        imageUrl={previewImage?.url}
        alt={previewImage?.alt}
        onClose={() => setPreviewImage(null)}
      />
    </section>
  );
}

export default UpdateReportStatusForm;
