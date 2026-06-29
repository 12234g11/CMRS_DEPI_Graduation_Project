import { Link } from 'react-router-dom';
import {
  FiEye,
  FiSend,
  FiStar,
  FiTool,
  FiUploadCloud,
  FiUsers,
} from 'react-icons/fi';
import { ROUTES } from '../../../../shared/navigation';

function getReportDetailsPath(reportId) {
  return `${ROUTES.COMPANY_REPORTS}/${reportId}`;
}

function getAdminReviewLabel(report) {
  if (!report.adminReview) return 'لا يوجد رد';
  return report.adminReview.label;
}

function CompanyReportsTable({
  reports = [],
  highlightedReportId,
  onAssignTechnician,
  onSubmitSolution,
  onStartWork,
}) {
  return (
    <div className="company-reports-table-wrap">
      <table className="company-reports-table">
        <thead>
          <tr>
            <th>نوع المشكلة</th>
            <th>التقييم</th>
            <th>الحالة</th>
            <th>رد الأدمن</th>
            <th>الأولوية</th>
            <th>فرقة الصيانة</th>
            <th>تاريخ الإسناد</th>
            <th>الإجراء</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              id={`company-report-row-${report.id}`}
              className={
                String(highlightedReportId) === String(report.id)
                  ? 'is-highlighted'
                  : ''
              }
            >
              <td data-label="نوع المشكلة">
                <strong>{report.type}</strong>
                <span>{report.location}</span>
              </td>

              <td data-label="التقييم">
                <span className="company-report-rating">
                  <FiStar />
                  {report.rating}
                </span>
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

              <td data-label="فرقة الصيانة">
                <span className={report.assignedTeam ? 'company-report-team-pill' : 'company-report-muted'}>
                  {report.assignedTeam?.name || 'لم يتم التعيين'}
                </span>
              </td>

              <td data-label="تاريخ الإسناد">{report.assignedAt}</td>

              <td data-label="الإجراء">
                <div className="company-report-actions">
                  <Link
                    to={getReportDetailsPath(report.id)}
                    className="company-report-view-btn"
                  >
                    <FiEye />
                    عرض
                  </Link>

                  <button
                    type="button"
                    className="company-report-assign-btn"
                    onClick={() => onAssignTechnician(report)}
                    disabled={report.status === 'تم الحل'}
                  >
                    <FiUsers />
                    تعيين فرقة
                  </button>

                  {report.status === 'تم التعيين' ? (
                    <button
                      type="button"
                      className="company-report-start-btn"
                      onClick={() => onStartWork(report)}
                    >
                      <FiTool />
                      بدء التنفيذ
                    </button>
                  ) : null}

                  {['جاري التنفيذ', 'مطلوب استكمال'].includes(report.status) ? (
                    <button
                      type="button"
                      className="company-report-upload-btn"
                      onClick={() => onSubmitSolution(report)}
                    >
                      <FiUploadCloud />
                      إرسال الحل
                    </button>
                  ) : null}

                  {report.status === 'بانتظار مراجعة الأدمن' ? (
                    <span className="company-report-waiting-pill">
                      <FiSend />
                      مرسل للأدمن
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