import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiImage,
  FiMapPin,
  FiStar,
  FiTag,
  FiUser,
  FiX,
} from 'react-icons/fi';

function getCompanyResponseText(response) {
  if (!response) return 'لا يوجد رد من الشركة حتى الآن';
  if (response.status === 'fixed') return 'تم الإصلاح';
  if (response.status === 'cannot_fix') return 'متعذر التنفيذ';

  return response.statusLabel || 'رد شركة';
}

function AdminDashboardReportDetailsModal({
  report,
  onClose,
  onGoToReport,
}) {
  if (!report) return null;

  return (
    <div className="admin-dashboard-report-modal-backdrop">
      <section
        className="admin-dashboard-report-modal"
        role="dialog"
        aria-modal="true"
      >
        <header className="admin-dashboard-report-modal__header">
          <div>
            <span className={`admin-dashboard-report-modal__status is-${report.statusTone}`}>
              {report.status}
            </span>

            <h2>{report.title}</h2>

            <p>
              #{report.id} - {report.type}
            </p>
          </div>

          <div className="admin-dashboard-report-modal__actions">
            <button
              type="button"
              className="admin-dashboard-report-modal__open-btn"
              onClick={() => onGoToReport(report)}
            >
              فتح صفحة تفاصيل البلاغ
              <FiArrowLeft />
            </button>

            <button
              type="button"
              className="admin-dashboard-report-modal__close"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <FiX />
            </button>
          </div>
        </header>

        <div className="admin-dashboard-report-modal__body">
          <div className="admin-dashboard-report-modal__main">
            <section className="admin-dashboard-report-modal__section">
              <h3>
                <FiFileText />
                وصف المشكلة
              </h3>

              <p>{report.description}</p>
            </section>

            <section className="admin-dashboard-report-modal__section">
              <h3>
                <FiImage />
                صور البلاغ
              </h3>

              {report.images?.length ? (
                <div className="admin-dashboard-report-modal__images">
                  {report.images.slice(0, 3).map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`صورة البلاغ ${index + 1}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="admin-dashboard-report-modal__empty">
                  لا توجد صور مرفقة.
                </p>
              )}
            </section>

            <section className="admin-dashboard-report-modal__section">
              <h3>
                <FiCheckCircle />
                رد الشركة
              </h3>

              <div className="admin-dashboard-company-response-preview">
                <strong>{getCompanyResponseText(report.companyResponse)}</strong>

                {report.companyResponse ? (
                  <>
                    <span>{report.companyResponse.companyName}</span>
                    <p>{report.companyResponse.note}</p>
                  </>
                ) : (
                  <p>لم ترسل الشركة ردًا على هذا البلاغ حتى الآن.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="admin-dashboard-report-modal__side">
            <div className="admin-dashboard-report-info-item">
              <FiTag />

              <div>
                <span>نوع المشكلة</span>
                <strong>{report.type}</strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiMapPin />

              <div>
                <span>الموقع</span>
                <strong>{report.location}</strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiCalendar />

              <div>
                <span>تاريخ البلاغ</span>
                <strong>{report.date}</strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiAlertCircle />

              <div>
                <span>الأولوية</span>
                <strong>{report.priority}</strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiStar />

              <div>
                <span>التقييم المجتمعي</span>
                <strong>
                  {report.rating} / {report.votesCount} تصويت
                </strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiUser />

              <div>
                <span>المبلغ</span>
                <strong>{report.reporter?.name || 'غير محدد'}</strong>
              </div>
            </div>

            <div className="admin-dashboard-report-info-item">
              <FiClock />

              <div>
                <span>الشركة المعينة</span>
                <strong>{report.assignedCompany}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardReportDetailsModal;