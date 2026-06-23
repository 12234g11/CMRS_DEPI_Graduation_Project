import { FiEye, FiStar } from 'react-icons/fi';

function AdminReportsTable({ reports = [] }) {
  return (
    <div className="admin-reports-table-wrap">
      <table className="admin-reports-table">
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
                <span className="admin-rating">
                  {report.rating}
                  <FiStar />
                </span>
              </td>
              <td>
                <span className={`admin-status-badge admin-status-badge--${report.statusTone}`}>
                  {report.status}
                </span>
              </td>
              <td>{report.date}</td>
              <td>
                <span className={`admin-priority-badge admin-priority-badge--${report.priorityTone}`}>
                  {report.priority}
                </span>
              </td>
              <td>
                <span className="admin-company-pill">{report.assignedCompany}</span>
              </td>
              <td>{report.reviewer}</td>
              <td>
                <button type="button" className="admin-view-btn">
                  <FiEye />
                  عرض
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminReportsTable;