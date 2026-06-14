import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiEye, FiImage } from 'react-icons/fi';
import ReportStatusBadge from './ReportStatusBadge';
import ReportDetailsModal from './ReportDetailsModal';

function formatReportDate(value) {
  if (!value) {
    return '—';
  }

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

function RecentReportsTable({
  reports = [],
  highlightedReportId = null,
  emptyMessage = 'لا توجد بيانات لعرضها حاليًا.',
}) {
  const [selectedReport, setSelectedReport] = useState(null);

  if (!reports.length) {
    return <p className="no-data-message">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>إجراء</th>
              <th>تاريخ البلاغ</th>
              <th>الحالة</th>
              <th>نوع المشكلة</th>
              <th>صورة</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => {
              const isHighlighted = highlightedReportId === report.id;

              return (
                <tr
                  key={report.id}
                  className={isHighlighted ? 'dashboard-table__row--highlighted' : ''}
                >
                  <td>
                    <button
                      type="button"
                      className="dashboard-action-btn dashboard-action-btn--primary"
                      onClick={() => setSelectedReport(report)}
                    >
                      عرض <FiEye />
                    </button>
                  </td>

                  <td>{formatReportDate(report.createdAt || report.date)}</td>

                  <td>
                    <ReportStatusBadge tone={report.statusTone}>
                      {report.statusLabel}
                    </ReportStatusBadge>
                  </td>

                  <td>{report.categoryLabel || report.issue}</td>

                  <td>
                    <div
                      className="dashboard-report-thumb"
                      aria-label={`صورة ${report.title || report.issue}`}
                      title={report.title || report.issue}
                    >
                      {report.coverImage ? (
                        <img
                          src={report.coverImage}
                          alt={report.title || report.issue}
                          className="dashboard-report-thumb__image"
                        />
                      ) : (
                        <FiImage />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedReport &&
        createPortal(
          <ReportDetailsModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />,
          document.body
        )}
    </>
  );
}

export default RecentReportsTable;