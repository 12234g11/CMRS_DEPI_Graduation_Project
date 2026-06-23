import { Link } from 'react-router-dom';
import { FiEye, FiStar, FiUserPlus } from 'react-icons/fi';
import { ROUTES } from '../../../../shared/navigation';

function getReportDetailsPath(reportId) {
  return `${ROUTES.ADMIN_REVIEW_REPORTS}/${reportId}`;
}

function AdminReportsTable({ reports = [] }) {
  return (
    <div className="admin-manage-reports-table-wrap">
      <table className="admin-manage-reports-table">
        <thead>
          <tr>
            <th>نوع المشكلة</th>
            <th>التقييم</th>
            <th>الحالة</th>
            <th>تاريخ البلاغ</th>
            <th>الأولوية</th>
            <th>الشركة المعينة</th>
            <th>الشركة المعنية</th>
            <th>الإجراء</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.type}</td>

              <td>
                <span className="admin-report-rating">
                  <FiStar />
                  {report.rating}
                </span>
              </td>

              <td>
                <span className={`admin-report-status admin-report-status--${report.statusTone}`}>
                  {report.status}
                </span>
              </td>

              <td>{report.date}</td>

              <td>
                <span className={`admin-report-priority admin-report-priority--${report.priorityTone}`}>
                  {report.priority}
                </span>
              </td>

              <td>
                <span className={report.assignedCompany === 'غير معين' ? 'admin-report-muted' : 'admin-report-company-pill'}>
                  {report.assignedCompany}
                </span>
              </td>

              <td>{report.concernedCompany}</td>

              <td>
                <div className="admin-report-actions">
                  <Link
                    to={`${ROUTES.ADMIN_REVIEW_REPORTS}/${report.id}`}
                    className="admin-view-btn"
                  >
                    <FiEye />
                    عرض
                  </Link>

                  <Link
                    to={`${ROUTES.ADMIN_REVIEW_REPORTS}/${report.id}#company-assignment`}
                    className="admin-assign-btn"
                  >
                    <FiUserPlus />
                    تعيين
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminReportsTable;