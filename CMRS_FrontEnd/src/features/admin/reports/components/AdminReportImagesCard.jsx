import { useState } from 'react';
import { FiCamera, FiStar } from 'react-icons/fi';

function AdminReportImagesCard({ report }) {
  const [activeImage, setActiveImage] = useState(report.images?.[0]);

  return (
    <section className="admin-report-details-card admin-report-images-card">
      <header className="admin-report-card-header">
        <div>
          <h2>صور البلاغ</h2>
          <p>Report Images</p>
        </div>

        <span className="admin-report-images-count">
          <FiCamera />
          {report.images?.length || 0} صورة
        </span>
      </header>

      <div className="admin-report-image-preview">
        <img src={activeImage} alt={report.title} />
      </div>

      <div className="admin-report-images-footer">
        <div className="admin-report-community-rating">
          <span>
            <FiStar />
            {report.rating}
          </span>
          <small>/ {report.votesCount}</small>
          <b>التقييم المجتمعي</b>
        </div>

        <div className="admin-report-thumbnails">
          {report.images?.map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              className={image === activeImage ? 'is-active' : ''}
              onClick={() => setActiveImage(image)}
              aria-label={`عرض صورة رقم ${index + 1}`}
            >
              <img src={image} alt={`صورة البلاغ ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminReportImagesCard;