import {
  FiArrowLeft,
  FiEye,
  FiMapPin,
  FiNavigation,
  FiX,
} from 'react-icons/fi';

function UserMapSelectedReportCard({
  report,
  onClose,
  onOpenDetails,
  onGoToReport,
  onRequestDirections,
}) {
  if (!report) return null;

  return (
    <article className="user-map-report-card">
      <button
        type="button"
        className="user-map-report-card__close"
        onClick={onClose}
        aria-label="إغلاق ملخص البلاغ"
      >
        <FiX />
      </button>

      <header className="user-map-report-card__header">
        <div>
          <span className="user-map-report-card__source">
            {report.source === 'mine' ? 'بلاغي' : 'بلاغ قريب منك'}
          </span>

          <h3>{report.typeLabel}</h3>
        </div>

        <span className={`user-map-report-card__status is-${report.statusTone}`}>
          {report.statusLabel}
        </span>
      </header>

      <h2 className="user-map-report-card__title">{report.title}</h2>

      <p className="user-map-report-card__description">
        {report.description}
      </p>

      <div className="user-map-report-card__location">
        <FiMapPin />
        <span>{report.address || report.area}</span>
      </div>

      <div className="user-map-report-card__meta">
        <span>{report.reportNumber || report.originalId}</span>
        <span>{report.priority}</span>
      </div>

      <div className="user-map-report-card__main-actions">
        <button
          type="button"
          className="is-primary"
          onClick={() => onOpenDetails?.(report)}
        >
          <FiEye />
          عرض التفاصيل
        </button>

        <button type="button" onClick={() => onRequestDirections?.(report)}>
          <FiNavigation />
          أقصر مسافة
        </button>

        <button type="button" onClick={() => onGoToReport?.(report)}>
          <FiArrowLeft />
          صفحة البلاغ
        </button>
      </div>
    </article>
  );
}

export default UserMapSelectedReportCard;