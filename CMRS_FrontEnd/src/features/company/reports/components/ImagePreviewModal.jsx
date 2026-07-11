import { useEffect } from 'react';
import { FiX, FiZoomIn } from 'react-icons/fi';

function ImagePreviewModal({ imageUrl, alt = 'معاينة الصورة', onClose }) {
  useEffect(() => {
    if (!imageUrl) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="company-image-preview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="معاينة الصورة بالحجم الكامل"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="company-image-preview-modal">
        <header>
          <div>
            <FiZoomIn />
            <strong>معاينة الصورة</strong>
          </div>

          <button type="button" onClick={onClose} aria-label="إغلاق معاينة الصورة">
            <FiX />
          </button>
        </header>

        <div className="company-image-preview-modal__body">
          <img src={imageUrl} alt={alt} />
        </div>
      </div>
    </div>
  );
}

export default ImagePreviewModal;
