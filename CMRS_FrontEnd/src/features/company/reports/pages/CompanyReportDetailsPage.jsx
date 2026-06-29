import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiFileText,
  FiImage,
  FiMapPin,
  FiMessageSquare,
  FiStar,
  FiTag,
  FiUser,
} from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import {
  getCompanyReportById,
  startCompanyReportWork,
  submitCompanyReportCannotFix,
  submitCompanyReportSolution,
} from '../api/companyReportsApi';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import SolutionUploadForm from '../components/SolutionUploadForm';
import UpdateReportStatusForm from '../components/UpdateReportStatusForm';
import { companyReports } from '../mocks/companyReportsMockData';
import '../company-reports.css';

function CompanyReportDetailsPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(() => (
    companyReports.find((item) => String(item.id) === String(reportId)) || null
  ));

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCompanyReportById(reportId).then((data) => {
      if (isMounted) {
        setReport(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  async function handleStartWork() {
    const updatedReport = await startCompanyReportWork(report.id);
    setReport(updatedReport);
  }

  async function handleSubmitSolution(payload) {
    const updatedReport = await submitCompanyReportSolution(report.id, payload);
    setReport(updatedReport);
  }

  async function handleCannotFix(payload) {
    const updatedReport = await submitCompanyReportCannotFix(report.id, payload);
    setReport(updatedReport);
  }

  if (!report) {
    return (
      <div className="dashboard-page company-report-details-page">
        <PageHeader title="تفاصيل البلاغ" subtitle="Company Report Details" />

        <section className="company-report-details-card">
          <h2>لم يتم العثور على البلاغ</h2>
          <p>البلاغ المطلوب غير موجود أو غير مسند لهذه الشركة.</p>

          <button
            type="button"
            onClick={() => navigate(ROUTES.COMPANY_REPORTS)}
          >
            الرجوع للبلاغات
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page company-report-details-page">
      <PageHeader
        title="تفاصيل البلاغ"
        subtitle={`Company Report Details - بلاغ رقم #${report.id}`}
      />

      <Link to={ROUTES.COMPANY_REPORTS} className="company-report-back-link">
        <FiArrowRight />
        الرجوع إلى بلاغات الشركة
      </Link>

      <div className="company-report-details-grid">
        <main className="company-report-details-main">
          <section className="company-report-details-card">
            <header className="company-report-details-header">
              <div>
                <span className={`company-report-status company-report-status--${report.statusTone}`}>
                  {report.status}
                </span>

                <h2>{report.title}</h2>
                <p>{report.description}</p>
              </div>
            </header>
          </section>

          <section className="company-report-details-card">
            <header className="company-report-section-header">
              <div>
                <h2>صور البلاغ</h2>
                <p>الصور المرسلة من المستخدم قبل التنفيذ</p>
              </div>

              <span>
                <FiImage />
              </span>
            </header>

            <div className="company-report-images-grid">
              {report.images?.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`صورة البلاغ ${index + 1}`}
                />
              ))}
            </div>
          </section>

          {report.adminReview ? (
            <section className="company-report-details-card company-admin-review-card">
              <header className="company-report-section-header">
                <div>
                  <h2>رد الأدمن</h2>
                  <p>آخر قرار أو ملاحظة من الأدمن على رد الشركة</p>
                </div>

                <span>
                  <FiMessageSquare />
                </span>
              </header>

              <div className={`company-admin-review-box is-${report.adminReview.status}`}>
                <strong>{report.adminReview.label}</strong>
                <p>{report.adminReview.note}</p>

                {report.adminReview.reviewedAt ? (
                  <small>{report.adminReview.reviewedAt}</small>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className="company-report-details-card">
            <UpdateReportStatusForm
              report={report}
              onStartWork={handleStartWork}
              onCannotFix={handleCannotFix}
            />
          </section>

          {['جاري التنفيذ', 'مطلوب استكمال'].includes(report.status) ? (
            <section className="company-report-details-card">
              <SolutionUploadForm
                report={report}
                onSubmitSolution={handleSubmitSolution}
              />
            </section>
          ) : null}
        </main>

        <aside className="company-report-details-side">
          <section className="company-report-details-card">
            <header className="company-report-section-header">
              <div>
                <h2>بيانات البلاغ</h2>
                <p>Report Info</p>
              </div>
            </header>

            <div className="company-report-info-list">
              <div>
                <FiTag />
                <span>نوع المشكلة</span>
                <strong>{report.type}</strong>
              </div>

              <div>
                <FiMapPin />
                <span>الموقع</span>
                <strong>{report.location}</strong>
              </div>

              <div>
                <FiCalendar />
                <span>تاريخ البلاغ</span>
                <strong>{report.date}</strong>
              </div>

              <div>
                <FiClock />
                <span>تاريخ الإسناد</span>
                <strong>{report.assignedAt}</strong>
              </div>

              <div>
                <FiStar />
                <span>التقييم</span>
                <strong>
                  {report.rating} / {report.votesCount} تصويت
                </strong>
              </div>
            </div>
          </section>

          <section className="company-report-details-card">
            <header className="company-report-section-header">
              <div>
                <h2>فرقة الصيانة</h2>
                <p>Maintenance Team</p>
              </div>
            </header>

            <div className="company-assigned-team-box">
              <strong>{report.assignedTeam?.name || 'لم يتم تعيين فرقة بعد'}</strong>

              {report.assignedTeam ? (
                <p>{report.assignedTeam.leadName}</p>
              ) : (
                <p>قم بتعيين فرقة صيانة قبل بدء التنفيذ.</p>
              )}

              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                disabled={report.status === 'تم الحل'}
              >
                تعيين / تغيير الفرقة
              </button>
            </div>
          </section>

          <section className="company-report-details-card">
            <header className="company-report-section-header">
              <div>
                <h2>المبلغ</h2>
                <p>Reporter</p>
              </div>
            </header>

            <div className="company-reporter-box">
              <FiUser />
              <div>
                <strong>{report.reporter?.name}</strong>
                <span>{report.reporter?.phone}</span>
              </div>
            </div>
          </section>

          <section className="company-report-details-card">
            <header className="company-report-section-header">
              <div>
                <h2>سجل التحديثات</h2>
                <p>Timeline</p>
              </div>
            </header>

            <div className="company-report-timeline">
              {report.timeline?.map((item) => (
                <article key={item.id}>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <small>
                    {item.actor} - {item.date}
                  </small>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <AssignTechnicianModal
        report={report}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={setReport}
      />
    </div>
  );
}

export default CompanyReportDetailsPage;