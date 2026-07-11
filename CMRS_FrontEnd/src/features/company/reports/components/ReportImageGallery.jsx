import { useState } from 'react';
import { FiEye, FiImage } from 'react-icons/fi';
import ImagePreviewModal from './ImagePreviewModal';

function ReportImageGallery({ images = [], altPrefix = 'صورة البلاغ', emptyText }) {
  const [previewImage, setPreviewImage] = useState(null);

  if (!images.length) {
    return (
      <p className="company-report-muted company-report-images-empty">
        <FiImage />
        {emptyText || 'لا توجد صور مرفقة.'}
      </p>
    );
  }

  return (
    <>
      <div className="company-report-images-grid">
        {images.map((image, index) => (
          <article className="company-report-image-card" key={`${image}-${index}`}>
            <img src={image} alt={`${altPrefix} ${index + 1}`} loading="lazy" />

            <div className="company-report-image-card__overlay">
              <button
                type="button"
                onClick={() => setPreviewImage({
                  url: image,
                  alt: `${altPrefix} ${index + 1}`,
                })}
              >
                <FiEye />
                معاينة
              </button>
            </div>
          </article>
        ))}
      </div>

      <ImagePreviewModal
        imageUrl={previewImage?.url}
        alt={previewImage?.alt}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}

export default ReportImageGallery;
