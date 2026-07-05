import {
  FiCalendar,
  FiImage,
  FiInfo,
  FiMapPin,
  FiNavigation,
  FiTag,
  FiX,
} from 'react-icons/fi';
import ReportStatusBadge from '../../reports/components/ReportStatusBadge';

function formatDate(value) {
  if (!value) return '—';

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsedDate);
}

function DetailCard({ icon, label, children }) {
  return (
    <div className="user-dashboard-report-modal__detail-card">
      <span>
        {icon}
        {label}
      </span>

      <strong>{children}</strong>
    </div>
  );
}

function UserDashboardReportDetailsModal({
  report,
  onClose,
  onGoToReport,
  onRequestDirections,
}) {
  if (!report) return null;

  const imageSrc =
    report.images?.[0] ||
    report.coverImage ||
    report.image ||
    '';

  return (
    <div className="user-dashboard-report-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="user-dashboard-report-modal__backdrop"
        onClick={onClose}
        aria-label="إغلاق تفاصيل البلاغ"
      />

      <article className="user-dashboard-report-modal__panel">
        <button
          type="button"
          className="user-dashboard-report-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="user-dashboard-report-modal__header">
          <div>
            <ReportStatusBadge tone={report.statusTone}>
              {report.statusLabel}
            </ReportStatusBadge>

            <h2>{report.title}</h2>

            <p>
              {report.reportNumber || report.id} - {report.typeLabel}
            </p>
          </div>
        </header>

        <div className="user-dashboard-report-modal__content">
          <div className="user-dashboard-report-modal__main">
            <DetailCard icon={<FiInfo />} label="وصف المشكلة">
              {report.description || 'لا يوجد وصف متاح لهذا البلاغ.'}
            </DetailCard>

            <DetailCard icon={<FiMapPin />} label="الموقع">
              {report.address || report.area || 'لم يتم تحديد الموقع'}
            </DetailCard>

            <div className="user-dashboard-report-modal__grid">
              <DetailCard icon={<FiTag />} label="نوع البلاغ">
                {report.typeLabel}
              </DetailCard>

              <DetailCard icon={<FiCalendar />} label="تاريخ البلاغ">
                {formatDate(report.date || report.createdAt || report.reportedAt)}
              </DetailCard>

            </div>
          </div>

          <div className="user-dashboard-report-modal__media">
            {imageSrc ? (
              <img src={imageSrc} alt={report.title} />
            ) : (
              <div className="user-dashboard-report-modal__image-placeholder">
                <FiImage />
                <span>لا توجد صور لهذا البلاغ</span>
              </div>
            )}
          </div>
        </div>

        <footer className="user-dashboard-report-modal__actions">
          <button type="button" onClick={() => onRequestDirections?.(report)}>
            <FiNavigation />
            أقصر مسافة
          </button>

          <button type="button" onClick={() => onGoToReport?.(report)}>
            صفحة البلاغ
          </button>
        </footer>
      </article>
    </div>
  );
}

export default UserDashboardReportDetailsModal;