import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiMessageSquare, FiUserPlus } from 'react-icons/fi';
import { ROUTES } from '../../../../shared/navigation';

function getCompanyResponseLabel(response) {
  if (!response) return 'لا يوجد';

  const status = String(response.status || '').toLowerCase();

  if (status.includes('fixed') || status.includes('resolved')) return 'تم الإصلاح';
  if (status.includes('cannot')) return 'متعذر التنفيذ';

  return response.statusLabel || 'رد شركة';
}

function AdminReportsTable({ reports = [], highlightedReportId = '' }) {
  const tableWrapRef = useRef(null);

  useLayoutEffect(() => {
    const tableWrap = tableWrapRef.current;

    if (!tableWrap || typeof window === 'undefined') {
      return undefined;
    }

    const scrollToRtlStart = () => {
      tableWrap.scrollLeft = tableWrap.scrollWidth - tableWrap.clientWidth;
    };

    scrollToRtlStart();

    const animationFrameId = window.requestAnimationFrame(scrollToRtlStart);
    const timeoutId = window.setTimeout(scrollToRtlStart, 80);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [reports.length]);

  return (
    <div ref={tableWrapRef} className="admin-manage-reports-table-wrap">
      <table className="admin-manage-reports-table">
        <thead>
          <tr>
            <th>نوع المشكلة</th>
            <th>الحالة</th>
            <th>رد الشركة</th>
            <th>تاريخ البلاغ</th>
            <th>الأولوية</th>
            <th>الشركة المعينة</th>
            <th>الشركة المعنية</th>
            <th>الإجراء</th>
          </tr>
        </thead>

        <tbody>
          {reports.length ? (
            reports.map((report) => {
              const hasPendingCompanyResponse =
                String(report.companyResponse?.reviewStatus || '').toLowerCase() === 'pending';

              const isHighlighted =
                highlightedReportId && String(report.id) === String(highlightedReportId);

              return (
                <tr
                  key={report.id}
                  className={isHighlighted ? 'admin-report-row-highlight' : ''}
                >
                  <td>{report.type}</td>

                  <td>
                    <span className={`admin-report-status admin-report-status--${report.statusTone}`}>
                      {report.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`admin-company-response-table-pill ${
                        hasPendingCompanyResponse ? 'is-pending' : ''
                      }`}
                    >
                      {getCompanyResponseLabel(report.companyResponse)}
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
                      {hasPendingCompanyResponse ? (
                        <Link
                          to={`${ROUTES.ADMIN_REVIEW_REPORTS}/${report.id}#company-response`}
                          className="admin-review-response-btn"
                        >
                          <FiMessageSquare />
                          مراجعة الرد
                        </Link>
                      ) : null}

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
              );
            })
          ) : (
            <tr>
              <td colSpan="8">
                <div className="admin-reports-empty-state">
                  لا توجد بلاغات مطابقة للبحث أو الفلاتر الحالية.
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminReportsTable;
