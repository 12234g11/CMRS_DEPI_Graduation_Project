import { useEffect, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiImage,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
} from 'react-icons/fi';

const MAX_IMAGES = 5;

function createImagePreview(file) {
  return {
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
    file,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  };
}

function SolutionUploadForm({ report, onSubmitSolution }) {
  const [note, setNote] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [selectedImages]);

  if (!report) return null;

  function showError(message) {
    setError(message);
  }

  function clearError() {
    if (error) setError('');
  }

  function handleFiles(filesList) {
    const incomingFiles = Array.from(filesList || []);
    const imageFiles = incomingFiles.filter((file) =>
      file.type.startsWith('image/'),
    );

    if (!imageFiles.length) {
      showError('من فضلك اختر ملفات صور فقط.');
      return;
    }

    setSelectedImages((currentImages) => {
      const remainingSlots = MAX_IMAGES - currentImages.length;

      if (remainingSlots <= 0) {
        showError(`لا يمكن رفع أكثر من ${MAX_IMAGES} صور.`);
        return currentImages;
      }

      const acceptedImages = imageFiles
        .slice(0, remainingSlots)
        .map(createImagePreview);

      if (imageFiles.length > remainingSlots) {
        showError(`تم إضافة ${remainingSlots} صور فقط. الحد الأقصى ${MAX_IMAGES} صور.`);
      } else {
        clearError();
      }

      return [...currentImages, ...acceptedImages];
    });
  }

  function handleFileInputChange(event) {
    handleFiles(event.target.files);
    event.target.value = '';
  }

  function handleCameraInputChange(event) {
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

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return currentImages.filter((image) => image.id !== imageId);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!note.trim()) {
      showError('يجب كتابة ملاحظة توضّح ما تم تنفيذه قبل إرسال الحل للأدمن.');
      return;
    }

    if (!selectedImages.length) {
      showError('يجب رفع صورة واحدة على الأقل بعد الإصلاح قبل إرسال الحل للأدمن.');
      return;
    }

    setIsSaving(true);

    await onSubmitSolution?.({
      note: note.trim(),

      /*
        Mock:
        بنبعت preview URLs عشان تظهر فورًا في الواجهة.

        Real API لاحقًا:
        استخدم selectedImages.map((image) => image.file)
        وابعته FormData للباك إند.
      */
      images: selectedImages.map((image) => image.previewUrl),
      files: selectedImages.map((image) => image.file),
    });

    setIsSaving(false);
    setNote('');
    setError('');

    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });

    setSelectedImages([]);
  }

  return (
    <form className="company-solution-form" onSubmit={handleSubmit}>
      <header className="company-report-section-header">
        <div>
          <h2>إرسال الحل للأدمن</h2>
          <p>بعد الإصلاح، ارفع ملاحظة وصور ليقوم الأدمن بالمراجعة النهائية.</p>
        </div>

        <button
          type="button"
          className="company-solution-header-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          aria-label="إضافة صور بعد الإصلاح"
          title="إضافة صور"
        >
          <FiUploadCloud />
        </button>
      </header>

      <label className="company-report-form-field">
        ملاحظة التنفيذ

        <textarea
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            clearError();
          }}
          rows={4}
          placeholder="مثال: تم تغيير الكشاف وتشغيل الإنارة واختبارها بنجاح..."
        />
      </label>

      <div className="company-report-form-field">
        <span>صور بعد الإصلاح</span>

        <div
          className={`company-solution-upload-zone ${
            isDragging ? 'is-dragging' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="company-solution-upload-input"
            onChange={handleFileInputChange}
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="company-solution-upload-input"
            onChange={handleCameraInputChange}
          />

          <button
            type="button"
            className="company-solution-upload-main-icon"
            onClick={() => fileInputRef.current?.click()}
            aria-label="اختيار صور من الجهاز"
          >
            <FiPlus />
          </button>

          <div className="company-solution-upload-content">
            <strong>اضغط لإضافة صورة أو اسحب الصور هنا</strong>
            <p>يمكنك رفع صور من الجهاز أو فتح الكاميرا للتصوير المباشر.</p>

            <div className="company-solution-upload-actions">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiImage />
                اختيار صور
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
              >
                <FiCamera />
                فتح الكاميرا
              </button>
            </div>
          </div>
        </div>

        <small className="company-solution-upload-limit">
          الحد الأقصى {MAX_IMAGES} صور. يفضل رفع صورة واضحة بعد الإصلاح، وصورة
          إضافية من زاوية مختلفة عند الحاجة.
        </small>
      </div>

      {selectedImages.length ? (
        <div className="company-solution-images-preview">
          {selectedImages.map((image) => (
            <article key={image.id} className="company-solution-image-preview">
              <img src={image.previewUrl} alt={image.name} />

              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                aria-label="حذف الصورة"
              >
                <FiTrash2 />
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="company-report-form-error">
          <FiAlertCircle />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="company-submit-solution-btn"
        disabled={isSaving}
      >
        <FiCheckCircle />
        {isSaving ? 'جاري إرسال الحل...' : 'إرسال الحل للأدمن'}
      </button>

      <p className="company-solution-form__hint">
        بعد الإرسال ستتحول حالة البلاغ إلى: بانتظار مراجعة الأدمن.
      </p>

      <div className="company-solution-form__images-hint">
        <FiImage />
        <span>
          في النسخة الحقيقية سيتم رفع الصور للباك إند كملفات فعلية باستخدام
          FormData.
        </span>
      </div>
    </form>
  );
}

export default SolutionUploadForm;