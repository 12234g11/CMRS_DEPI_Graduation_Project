import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
} from 'react-icons/fi';
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

function getReportId(report = {}) {
  return report.reportId || report.id || '';
}

function getReportTitle(report = {}) {
  return report.title || 'بلاغ بدون عنوان';
}

function getReportNumber(report = {}) {
  return report.reportNumber || getReportId(report) || '—';
}

function getCategoryName(report = {}) {
  return report.issueCategoryName || report.categoryLabel || '—';
}

function RecentReportsTable({
  reports = [],
  highlightedReportId = null,
  emptyMessage = 'لا توجد بيانات لعرضها حاليًا.',
  pagination = null,
  onPageChange,
  isLoading = false,
}) {
  const [selectedReport, setSelectedReport] = useState(null);

  const pageNumber = Number(pagination?.pageNumber || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const totalCount = Number(pagination?.totalCount || reports.length);
  const pageSize = Number(pagination?.pageSize || reports.length || 10);

  const canGoPrevious = pageNumber > 1 && !isLoading;
  const canGoNext = pageNumber < totalPages && !isLoading;

  useEffect(() => {
    if (!highlightedReportId) return;

    const timer = window.setTimeout(() => {
      document
        .querySelector(`[data-report-row-id="${highlightedReportId}"]`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [highlightedReportId, reports]);

  if (!reports.length) {
    return <p className="no-data-message">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="dashboard-table-wrap user-reports-table-wrap">
        <table className="dashboard-table user-reports-table">
          <thead>
            <tr>
              <th className="user-reports-table__action-col">إجراء</th>
              <th className="user-reports-table__report-col">البلاغ</th>
              <th className="user-reports-table__category-col">نوع المشكلة</th>
              <th className="user-reports-table__status-col">الحالة</th>
              <th className="user-reports-table__date-col">التاريخ</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => {
              const reportId = getReportId(report);

              const isHighlighted =
                String(highlightedReportId) === String(reportId);

              return (
                <tr
                  key={reportId}
                  data-report-row-id={reportId}
                  className={
                    isHighlighted ? 'dashboard-table__row--highlighted' : ''
                  }
                >
                  <td className="user-reports-table__action-cell">
                    <button
                      type="button"
                      className="dashboard-action-btn dashboard-action-btn--primary"
                      onClick={() => setSelectedReport(report)}
                    >
                      عرض <FiEye />
                    </button>
                  </td>

                  <td className="user-reports-table__report-cell">
                    <div className="user-reports-table__report-summary">
                      <strong title={getReportTitle(report)}>
                        {getReportTitle(report)}
                      </strong>

                      <span className="user-reports-table__report-number">
                        <span className="user-reports-table__report-number-label">
                          رقم البلاغ:
                        </span>
                        <span className="user-reports-table__report-number-value">
                          {getReportNumber(report)}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="user-reports-table__category-cell">
                    <span title={getCategoryName(report)}>
                      {getCategoryName(report)}
                    </span>
                  </td>

                  <td className="user-reports-table__status-cell">
                    <ReportStatusBadge tone={report.statusTone}>
                      {report.statusLabel || 'قيد المراجعة'}
                    </ReportStatusBadge>
                  </td>

                  <td className="user-reports-table__date-cell">
                    {formatReportDate(report.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 ? (
        <div className="user-reports-pagination" dir="rtl">
          <button
            type="button"
            className="user-reports-pagination__btn"
            onClick={() => onPageChange?.(pageNumber - 1)}
            disabled={!canGoPrevious}
          >
            <FiChevronRight />
            السابق
          </button>

          <div className="user-reports-pagination__info">
            <strong>
              صفحة {pageNumber} من {totalPages}
            </strong>

            <span>
              إجمالي {totalCount} بلاغ — {pageSize} بلاغ في الصفحة
            </span>
          </div>

          <button
            type="button"
            className="user-reports-pagination__btn"
            onClick={() => onPageChange?.(pageNumber + 1)}
            disabled={!canGoNext}
          >
            التالي
            <FiChevronLeft />
          </button>
        </div>
      ) : null}

      {selectedReport
        ? createPortal(
          <ReportDetailsModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />,
          document.body
        )
        : null}
    </>
  );
}

export default RecentReportsTable;