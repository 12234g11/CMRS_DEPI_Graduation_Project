import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiFileText,
  FiImage,
  FiMapPin,
  FiMessageSquare,
  FiStar,
  FiTag,
  FiUser,
  FiX,
} from 'react-icons/fi';

function getResponseLabel(response) {
  if (!response) return 'لم يتم إرسال رد بعد';
  return response.statusLabel || 'رد الشركة';
}

function CompanyReportDetailsModal({
  report,
  onClose,
  onGoToReport,
}) {
  if (!report) return null;

  return (
    <div className="company-report-modal-backdrop">
      <section
        className="company-report-modal"
        role="dialog"
        aria-modal="true"
      >
        <header className="company-report-modal__header">
          <div>
            <span className={`company-report-modal__status is-${report.statusTone}`}>
              {report.status}
            </span>

            <h2>{report.title}</h2>

            <p>
              #{report.id} - {report.type}
            </p>
          </div>

          <div className="company-report-modal__actions">
            <button
              type="button"
              className="company-report-modal__open-btn"
              onClick={() => onGoToReport(report)}
            >
              فتح في صفحة البلاغات
              <FiArrowLeft />
            </button>

            <button
              type="button"
              className="company-report-modal__close"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <FiX />
            </button>
          </div>
        </header>

        <div className="company-report-modal__body">
          <div className="company-report-modal__main">
            <section className="company-report-modal__section">
              <h3>
                <FiFileText />
                وصف المشكلة
              </h3>

              <p>{report.description}</p>
            </section>

            <section className="company-report-modal__section">
              <h3>
                <FiMessageSquare />
                ملاحظات الأدمن
              </h3>

              <p>{report.adminNote || 'لا توجد ملاحظات من الأدمن.'}</p>
            </section>

            <section className="company-report-modal__section">
              <h3>
                <FiImage />
                صور البلاغ
              </h3>

              {report.images?.length ? (
                <div className="company-report-modal__images">
                  {report.images.slice(0, 3).map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`صورة البلاغ ${index + 1}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="company-report-modal__empty">
                  لا توجد صور مرفقة.
                </p>
              )}
            </section>

            <section className="company-report-modal__section">
              <h3>
                <FiClock />
                رد الشركة الحالي
              </h3>

              <div className="company-report-response-preview">
                <strong>{getResponseLabel(report.companyResponse)}</strong>

                {report.companyResponse ? (
                  <>
                    <span>{report.companyResponse.submittedAt}</span>
                    <p>{report.companyResponse.note}</p>

                    {report.companyResponse.reason ? (
                      <p className="company-report-response-preview__reason">
                        سبب التعذر: {report.companyResponse.reason}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p>لم يتم إرسال أي تحديث على هذا البلاغ حتى الآن.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="company-report-modal__side">
            <div className="company-report-info-item">
              <FiTag />

              <div>
                <span>نوع المشكلة</span>
                <strong>{report.type}</strong>
              </div>
            </div>

            <div className="company-report-info-item">
              <FiMapPin />

              <div>
                <span>الموقع</span>
                <strong>{report.location}</strong>
              </div>
            </div>

            <div className="company-report-info-item">
              <FiCalendar />

              <div>
                <span>تاريخ البلاغ</span>
                <strong>{report.date}</strong>
              </div>
            </div>

            <div className="company-report-info-item">
              <FiClock />

              <div>
                <span>تاريخ الإسناد</span>
                <strong>{report.assignedAt}</strong>
              </div>
            </div>

            <div className="company-report-info-item">
              <FiAlertCircle />

              <div>
                <span>الأولوية</span>
                <strong>{report.priority}</strong>
              </div>
            </div>

            <div className="company-report-info-item">
              <FiStar />

              <div>
                <span>التقييم المجتمعي</span>
                <strong>
                  {report.rating} / {report.votesCount} تصويت
                </strong>
              </div>
            </div>

            <div className="company-report-info-item">
              <FiUser />

              <div>
                <span>المبلغ</span>
                <strong>{report.reporter?.name || 'غير محدد'}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default CompanyReportDetailsModal;