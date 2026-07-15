import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiImage,
  FiTrash2,
} from 'react-icons/fi';

import ReportStatusBadge from '../../reports/components/ReportStatusBadge';

function formatDate(value) {
  if (!value) return '—';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsedDate);
}

function FollowedImagePreview({ report }) {
  const [previewPosition, setPreviewPosition] = useState(null);
  const imageUrl = report.coverImage || report.images?.[0] || '';

  function showPreview(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const previewWidth = Math.min(420, Math.max(280, window.innerWidth - 32));
    const left = Math.min(
      Math.max(16, rect.left + rect.width / 2 - previewWidth / 2),
      window.innerWidth - previewWidth - 16
    );
    const top = rect.top > 300 ? rect.top - 260 : rect.bottom + 12;

    setPreviewPosition({ top, left, width: previewWidth });
  }

  if (!imageUrl) {
    return (
      <span className="followed-reports-table__image followed-reports-table__image--empty">
        <FiImage />
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        className="followed-reports-table__image"
        onMouseEnter={showPreview}
        onMouseLeave={() => setPreviewPosition(null)}
        onFocus={showPreview}
        onBlur={() => setPreviewPosition(null)}
        aria-label={`معاينة صورة ${report.title}`}
      >
        <img src={imageUrl} alt="" />
      </button>

      {previewPosition
        ? createPortal(
            <div
              className="followed-report-image-hover-preview"
              style={previewPosition}
              aria-hidden="true"
            >
              <img src={imageUrl} alt="" />
              <span>معاينة صورة البلاغ</span>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function FollowedReportsTable({
  reports = [],
  pagination,
  highlightedReportId,
  loadingReportId = '',
  unfollowingReportId = '',
  isLoading = false,
  emptyMessage = 'لا توجد بلاغات متابَعة لعرضها حاليًا.',
  onPageChange,
  onOpenDetails,
  onUnfollow,
}) {
  const pageNumber = Number(pagination?.pageNumber || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const totalCount = Number(pagination?.totalCount || 0);
  const pageSize = Number(pagination?.pageSize || 10);

  useEffect(() => {
    if (!highlightedReportId) return undefined;

    const timer = window.setTimeout(() => {
      document
        .querySelector(`[data-report-row-id="${highlightedReportId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 160);

    return () => window.clearTimeout(timer);
  }, [highlightedReportId, reports]);

  if (!reports.length) {
    return <p className="no-data-message">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="dashboard-table-wrap user-reports-table-wrap followed-reports-table-wrap">
        <table className="dashboard-table user-reports-table followed-reports-table">
          <thead>
            <tr>
              <th className="user-reports-table__action-col">إجراء</th>
              <th className="user-reports-table__report-col">البلاغ</th>
              <th className="user-reports-table__category-col">نوع المشكلة</th>
              <th className="user-reports-table__status-col">الحالة</th>
              <th className="user-reports-table__date-col">تاريخ المتابعة</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => {
              const reportId = report.reportId || report.id;
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
                  <td className="user-reports-table__action-cell" data-label="الإجراء">
                    <div className="followed-reports-table__actions">
                      <button
                        type="button"
                        className="dashboard-action-btn dashboard-action-btn--primary"
                        onClick={() => onOpenDetails?.(report)}
                        disabled={loadingReportId === reportId}
                      >
                        <FiEye />
                        {loadingReportId === reportId ? 'تحميل...' : 'عرض'}
                      </button>

                      <button
                        type="button"
                        className="followed-reports-table__unfollow-btn"
                        onClick={() => onUnfollow?.(report)}
                        disabled={
                          report.canCurrentUserUnfollow === false ||
                          unfollowingReportId === reportId
                        }
                        title={
                          report.canCurrentUserUnfollow === false
                            ? 'إلغاء المتابعة غير متاح لهذا البلاغ'
                            : 'إلغاء متابعة البلاغ'
                        }
                      >
                        <FiTrash2 />
                        {report.canCurrentUserUnfollow === false
                          ? 'غير متاح'
                          : unfollowingReportId === reportId
                          ? 'جاري الإلغاء...'
                          : 'إلغاء المتابعة'}
                      </button>
                    </div>
                  </td>

                  <td className="user-reports-table__report-cell" data-label="البلاغ">
                    <div className="followed-reports-table__report-summary">
                      <FollowedImagePreview report={report} />

                      <div>
                        <strong title={report.title}>{report.title}</strong>
                        <small>{report.reportNumber || reportId}</small>
                        {report.descriptionPreview ? (
                          <p>{report.descriptionPreview}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="user-reports-table__category-cell" data-label="نوع المشكلة">
                    <span title={report.issueCategoryName}>
                      {report.issueCategoryName || '—'}
                    </span>
                  </td>

                  <td className="user-reports-table__status-cell" data-label="الحالة">
                    <ReportStatusBadge tone={report.statusTone}>
                      {report.statusLabel || 'غير محدد'}
                    </ReportStatusBadge>
                  </td>

                  <td className="user-reports-table__date-cell" data-label="تاريخ المتابعة">
                    {formatDate(report.followedAt)}
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
            disabled={pageNumber <= 1 || isLoading}
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
            disabled={pageNumber >= totalPages || isLoading}
          >
            التالي
            <FiChevronLeft />
          </button>
        </div>
      ) : null}
    </>
  );
}

export default FollowedReportsTable;
