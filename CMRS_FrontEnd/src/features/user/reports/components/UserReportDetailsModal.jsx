import {
  FiAlertTriangle,
  FiCalendar,
  FiImage,
  FiInfo,
  FiMapPin,
  FiNavigation,
  FiTag,
  FiX,
} from 'react-icons/fi';
import ReportStatusBadge from './ReportStatusBadge';

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
    <div className="user-report-details-modal__detail-card">
      <span>
        {icon}
        {label}
      </span>

      <strong>{children}</strong>
    </div>
  );
}

function UserReportDetailsModal({
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
  const rawReport = report.rawReport || {};
  const executionInfo = report.executionInfo || rawReport.executionInfo || {};
  const publicDecision =
    report.publicDecision ||
    rawReport.publicDecision ||
    executionInfo.publicDecision ||
    null;
  const normalizedStatus = String(
    report.statusKey || rawReport.statusKey || rawReport.status || report.statusLabel || '',
  )
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
  const normalizedDecision = String(publicDecision?.decisionType || '')
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
  const showUnableToExecuteDecision =
    normalizedStatus.includes('unabletoexecute') ||
    normalizedDecision.includes('acceptcannotfix') ||
    normalizedDecision.includes('cannotfixaccepted');
  const publicMessage =
    publicDecision?.message ||
    executionInfo.publicMessage ||
    executionInfo.publicUpdate ||
    '';
  const unableReason =
    publicDecision?.unableToExecuteReason ||
    executionInfo.unableToExecuteReason ||
    '';
  const decisionDate =
    publicDecision?.decidedAt || executionInfo.unableToExecuteAt || null;

  return (
    <div className="user-report-details-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="user-report-details-modal__backdrop"
        onClick={onClose}
        aria-label="إغلاق تفاصيل البلاغ"
      />

      <article className="user-report-details-modal__panel">
        <button
          type="button"
          className="user-report-details-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="user-report-details-modal__header">
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

        <div className="user-report-details-modal__content">
          <div className="user-report-details-modal__main">
            {showUnableToExecuteDecision ? (
              <section className="user-report-details-modal__public-decision">
                <div>
                  <FiAlertTriangle />
                  <strong>
                    {publicDecision?.decisionLabel ||
                      'تم إغلاق البلاغ لتعذر التنفيذ'}
                  </strong>
                </div>

                <p>
                  <b>رسالة الإدارة للمستخدمين:</b>{' '}
                  {publicMessage || 'لا توجد بيانات للعرض'}
                </p>
                <p>
                  <b>سبب تعذر التنفيذ:</b>{' '}
                  {unableReason || 'لا توجد بيانات للعرض'}
                </p>
                <small>
                  تاريخ القرار: {decisionDate ? formatDate(decisionDate) : 'لا توجد بيانات للعرض'}
                </small>
              </section>
            ) : null}

            <DetailCard icon={<FiInfo />} label="وصف المشكلة">
              {report.description || 'لا يوجد وصف متاح لهذا البلاغ.'}
            </DetailCard>

            <DetailCard icon={<FiMapPin />} label="الموقع">
              {report.address || report.area || 'لم يتم تحديد الموقع'}
            </DetailCard>

            <div className="user-report-details-modal__grid">
              <DetailCard icon={<FiTag />} label="نوع البلاغ">
                {report.typeLabel}
              </DetailCard>

              <DetailCard icon={<FiCalendar />} label="تاريخ البلاغ">
                {formatDate(report.date || report.createdAt || report.reportedAt)}
              </DetailCard>

            </div>
          </div>

          <div className="user-report-details-modal__media">
            {imageSrc ? (
              <img src={imageSrc} alt={report.title} />
            ) : (
              <div className="user-report-details-modal__image-placeholder">
                <FiImage />
                <span>لا توجد صور لهذا البلاغ</span>
              </div>
            )}
          </div>
        </div>

        <footer className="user-report-details-modal__actions">
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

export default UserReportDetailsModal;