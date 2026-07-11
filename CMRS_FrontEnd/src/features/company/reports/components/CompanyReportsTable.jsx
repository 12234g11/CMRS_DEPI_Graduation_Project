import { Link } from 'react-router-dom';
import {
  FiEye,
  FiMapPin,
  FiPlayCircle,
  FiSend,
  FiUploadCloud,
} from 'react-icons/fi';
import { ROUTES } from '../../../../shared/navigation';
import { formatEgyptDateTime } from '../utils/companyReportsFormatters';

function getReportDetailsPath(reportId) {
  return `${ROUTES.COMPANY_REPORTS}/${reportId}`;
}


function normalizeComparableText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function shouldShowDistinctText(value, ...comparisons) {
  const normalizedValue = normalizeComparableText(value);

  if (!normalizedValue) return false;

  return !comparisons.some(
    (comparison) => normalizeComparableText(comparison) === normalizedValue,
  );
}

function getAdminReviewLabel(report) {
  if (!report.adminReview) return 'لا يوجد رد بعد';
  return report.adminReview.label || 'يوجد رد من الأدمن';
}

function CompanyReportsTable({
  reports = [],
  highlightedReportId,
  onSubmitSolution,
  onStartWork,
  processingReportId,
}) {
  return (
    <div className="company-reports-table-wrap">
      <table className="company-reports-table">
        <thead>
          <tr>
            <th>البلاغ</th>
            <th>الحالة</th>
            <th>رد الأدمن</th>
            <th>الأولوية</th>
            <th>تاريخ الإسناد</th>
            <th>الإجراء التالي</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              id={`company-report-row-${report.id}`}
              tabIndex={-1}
              className={
                String(highlightedReportId) === String(report.id)
                  ? 'is-highlighted'
                  : ''
              }
            >
              <td data-label="البلاغ">
                <div className="company-report-table-summary">
                  <strong>{report.title || report.type}</strong>
                  {shouldShowDistinctText(
                    report.description,
                    report.title,
                    report.type,
                  ) ? (
                    <small className="company-report-table-summary__description">
                      {report.description}
                    </small>
                  ) : null}
                  {shouldShowDistinctText(report.type, report.title) ? (
                    <span className="company-report-table-summary__type">
                      {report.type}
                    </span>
                  ) : null}
                  <span className="company-report-table-summary__location">
                    <FiMapPin />
                    {report.location || 'الموقع غير متوفر'}
                  </span>
                  <span
                    className="company-report-table-summary__id company-copyable-report-id"
                    title="يمكن تحديد رقم البلاغ ونسخه"
                  >
                    رقم البلاغ:{' '}
                    <b className="company-report-id-value" dir="ltr">{report.id}</b>
                  </span>
                </div>
              </td>

              <td data-label="الحالة">
                <span className={`company-report-status company-report-status--${report.statusTone}`}>
                  {report.status}
                </span>
              </td>

              <td data-label="رد الأدمن">
                <span
                  className={`company-report-admin-review ${
                    report.adminReview?.status === 'needs_completion'
                      ? 'is-warning'
                      : report.adminReview?.status === 'accepted'
                        ? 'is-success'
                        : ''
                  }`}
                >
                  {getAdminReviewLabel(report)}
                </span>
              </td>

              <td data-label="الأولوية">
                <span className={`company-report-priority company-report-priority--${report.priorityTone}`}>
                  {report.priority}
                </span>
              </td>

              <td data-label="تاريخ الإسناد">
                <span className="company-report-assigned-date">
                  {formatEgyptDateTime(report.assignedAt)}
                </span>
              </td>

              <td data-label="الإجراء التالي">
                <div className="company-report-actions">
                  <Link
                    to={getReportDetailsPath(report.id)}
                    className="company-report-view-btn"
                  >
                    <FiEye />
                    التفاصيل
                  </Link>

                  {['تم التعيين', 'جاري التنفيذ', 'مطلوب استكمال'].includes(report.status) ? (
                    <Link
                      to={getReportDetailsPath(report.id)}
                      className={
                        report.status === 'تم التعيين'
                          ? 'company-report-start-btn'
                          : 'company-report-upload-btn'
                      }
                    >
                      {report.status === 'تم التعيين' ? <FiPlayCircle /> : <FiUploadCloud />}
                      {report.status === 'تم التعيين'
                        ? 'إدارة وبدء التنفيذ'
                        : report.status === 'مطلوب استكمال'
                          ? 'مراجعة الاستكمال'
                          : 'متابعة التنفيذ'}
                    </Link>
                  ) : null}

                  {report.status === 'بانتظار مراجعة الأدمن' ? (
                    <span className="company-report-waiting-pill">
                      <FiSend />
                      بانتظار المراجعة
                    </span>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CompanyReportsTable;
