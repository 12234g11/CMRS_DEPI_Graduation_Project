import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiImage,
  FiInbox,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiPlayCircle,
  FiRefreshCw,
  FiSend,
  FiTag,
  FiTool,
  FiUser,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { ROUTES } from '../../../../shared/navigation';
import {
  getCompanyReportById,
  startCompanyReportWork,
  submitCompanyReportCannotFix,
  submitCompanyReportSolution,
} from '../api/companyReportsApi';
import AssignMaintenanceTeamModal from '../components/AssignMaintenanceTeamModal';
import ReportImageGallery from '../components/ReportImageGallery';
import SolutionUploadForm from '../components/SolutionUploadForm';
import UpdateReportStatusForm from '../components/UpdateReportStatusForm';
import {
  formatEgyptDate,
  formatEgyptDateTime,
  getAdminReviewPresentation,
  getWorkflowStep,
} from '../utils/companyReportsFormatters';
import '../company-reports.css';

const COMMUNITY_METRICS = [
  {
    id: 'followers',
    label: 'عدد المتابعين',
    value: '—',
    hint: 'سيظهر بعد ربط البيانات',
    icon: FiUsers,
    tone: 'followers',
  },
  {
    id: 'verified',
    label: 'عدد المصدقين',
    value: '—',
    hint: 'سيظهر بعد ربط البيانات',
    icon: FiCheckCircle,
    tone: 'verified',
  },
  {
    id: 'rejected',
    label: 'عدد المكذبين',
    value: '—',
    hint: 'سيظهر بعد ربط البيانات',
    icon: FiXCircle,
    tone: 'rejected',
  },
];

const WORKFLOW_STEPS = [
  { id: 1, title: 'تم استلام البلاغ', description: 'اختيار فرقة الصيانة', icon: FiInbox },
  { id: 2, title: 'جاري التنفيذ', description: 'المعاينة والعمل ورفع الدليل', icon: FiPlayCircle },
  { id: 3, title: 'مراجعة الأدمن', description: 'إرسال الحل أو التعذر', icon: FiSend },
  { id: 4, title: 'القرار النهائي', description: 'قبول الحل أو طلب استكمال', icon: FiCheckCircle },
];

function getMeaningfulAdminNote(note) {
  if (typeof note !== 'string') return '';

  const normalizedNote = note.trim();
  const placeholderValues = new Set(['null', 'undefined', 'string']);

  if (!normalizedNote || placeholderValues.has(normalizedNote.toLowerCase())) {
    return '';
  }

  return normalizedNote;
}

function CompanyReportDetailsPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage('');

    getCompanyReportById(reportId)
      .then((data) => {
        if (!isMounted) return;
        setReport(data);
      })
      .catch((error) => {
        if (!isMounted) return;
        setReport(null);
        setErrorMessage(error.message || 'تعذر تحميل تفاصيل البلاغ من الخادم.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reloadKey, reportId]);

  const workflowStep = useMemo(() => getWorkflowStep(report), [report]);
  const adminReviewPresentation = useMemo(
    () => getAdminReviewPresentation(report?.adminReview, report?.companyResponse),
    [report?.adminReview, report?.companyResponse],
  );

  async function handleStartWork(payload = {}) {
    try {
      const updatedReport = await startCompanyReportWork(report.id, payload);
      setReport(updatedReport);
      return updatedReport;
    } catch (error) {
      if (error.partialReport) setReport(error.partialReport);
      throw error;
    }
  }

  async function handleSubmitSolution(payload) {
    const updatedReport = await submitCompanyReportSolution(report.id, payload);
    setReport(updatedReport);
    return updatedReport;
  }

  async function handleCannotFix(payload) {
    const updatedReport = await submitCompanyReportCannotFix(report.id, payload);
    setReport(updatedReport);
    return updatedReport;
  }

  if (isLoading) {
    return (
      <div className="dashboard-page company-report-details-page">
        <PageHeader title="تفاصيل البلاغ" subtitle="Company Report Details" />
        <section className="company-report-details-card company-reports-state">
          <FiRefreshCw />
          <span>جاري تحميل تفاصيل البلاغ...</span>
        </section>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="dashboard-page company-report-details-page">
        <PageHeader title="تفاصيل البلاغ" subtitle="Company Report Details" />
        <section className="company-report-details-card company-report-not-found">
          <FiAlertCircle />
          <h2>لم يتم العثور على البلاغ</h2>
          <p>{errorMessage || 'البلاغ المطلوب غير موجود أو غير مسند لهذه الشركة.'}</p>
          <div>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
              <FiRefreshCw />
              إعادة المحاولة
            </button>
            <button type="button" onClick={() => navigate(ROUTES.COMPANY_REPORTS)}>
              الرجوع للبلاغات
            </button>
          </div>
        </section>
      </div>
    );
  }

  const isCannotFixAccepted =
    report.status === 'متعذر التنفيذ' ||
    report.adminReview?.status === 'cannot_fix_accepted';
  const isReassigned = report.adminReview?.status === 'reassigned';
  const isCannotFixRejected =
    ['cannot_fix_rejected', 'needs_completion'].includes(report.adminReview?.status) &&
    report.companyResponse?.status === 'cannot_fix';
  const isResolved =
    report.status === 'تم الحل' ||
    report.adminReview?.status === 'accepted' ||
    isCannotFixAccepted ||
    isReassigned;
  const canSubmitSolution =
    !isResolved &&
    !isCannotFixRejected &&
    ['جاري التنفيذ', 'مطلوب استكمال'].includes(report.status);
  const isWaitingForAdmin =
    !isResolved && report.status === 'بانتظار مراجعة الأدمن';
  const canManageExecution =
    !isResolved &&
    ['تم التعيين', 'جاري التنفيذ', 'مطلوب استكمال'].includes(report.status);
  const adminAssignmentNote = getMeaningfulAdminNote(report.adminNote);

  return (
    <div className="dashboard-page company-report-details-page">
      <PageHeader
        title="تفاصيل البلاغ"
        subtitle={(
          <span className="company-report-page-subtitle">
            Company Report Details - بلاغ رقم{' '}
            <b className="company-report-id-value" dir="ltr">{report.id}</b>
          </span>
        )}
      />

      <Link to={ROUTES.COMPANY_REPORTS} className="company-report-back-link">
        <FiArrowRight />
        الرجوع إلى بلاغات الشركة
      </Link>

      {errorMessage ? (
        <section className="company-report-details-card company-reports-state company-reports-state--error">
          <FiAlertCircle />
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
            إعادة المحاولة
          </button>
        </section>
      ) : null}

      <div className="company-report-top-grid">
        <section className="company-report-details-card company-report-hero">
          <div className="company-report-hero__content">
            <div className="company-report-hero__badges">
              <span className={`company-report-status company-report-status--${report.statusTone}`}>
                {report.status}
              </span>
              <span className={`company-report-priority company-report-priority--${report.priorityTone}`}>
                أولوية {report.priority}
              </span>
            </div>

            <span className="company-report-hero__id company-copyable-report-id">
              بلاغ رقم{' '}
              <b className="company-report-id-value" dir="ltr">{report.id}</b>
            </span>
            <h1>{report.title}</h1>
            <p>{report.description}</p>

            <div className="company-report-hero__meta">
              <span>
                <FiMapPin />
                {report.location || 'الموقع غير متوفر'}
              </span>
              <span>
                <FiClock />
                أُسند في {formatEgyptDateTime(report.assignedAt)}
              </span>
            </div>
          </div>
        </section>

        <section className="company-report-details-card company-report-top-images-card">
          <header className="company-report-section-header">
            <div>
              <h2>صور البلاغ الأصلية</h2>
              <p>الصور المرسلة قبل بدء التنفيذ.</p>
            </div>
            <span>
              <FiImage />
            </span>
          </header>

          <ReportImageGallery
            images={report.images || []}
            altPrefix="صورة البلاغ"
            emptyText="لا توجد صور أصلية مرفقة بهذا البلاغ."
          />
        </section>
      </div>

      <section className="company-report-details-card company-report-workflow-card">
        <header className="company-report-section-header">
          <div>
            <h2>مسار تنفيذ البلاغ</h2>
            <p>تابع المرحلة الحالية واعرف الإجراء التالي بسهولة.</p>
          </div>
          <span>
            <FiSend />
          </span>
        </header>

        <div className="company-report-workflow">
          {WORKFLOW_STEPS.map((step) => {
            const StepIcon = step.icon;
            const isActive = workflowStep === step.id;
            const isCompleted = workflowStep > step.id;

            return (
              <article
                key={step.id}
                className={`${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
              >
                <span className="company-report-workflow__icon">
                  <StepIcon />
                </span>
                <div>
                  <strong>{step.title}</strong>
                  <small>{step.description}</small>
                </div>
              </article>
            );
          })}
        </div>

        {report.status === 'مطلوب استكمال' ? (
          <div className="company-report-workflow-returned">
            <FiAlertCircle />
            {isCannotFixRejected
              ? 'رفض الأدمن طلب تعذر التنفيذ. راجع ملاحظاته ثم استأنف العمل على البلاغ.'
              : 'أعاد الأدمن البلاغ للاستكمال. راجع سبب الإعادة وملاحظاته والرد السابق قبل الإرسال مرة أخرى.'}
          </div>
        ) : null}
      </section>

      <section className="company-community-metrics" aria-label="مؤشرات تفاعل المجتمع">
        {COMMUNITY_METRICS.map((metric) => {
          const MetricIcon = metric.icon;
          return (
            <article key={metric.id} className={`is-${metric.tone}`}>
              <span>
                <MetricIcon />
              </span>
              <div>
                <small>{metric.label}</small>
                <strong>{metric.value}</strong>
                <p>{metric.hint}</p>
              </div>
            </article>
          );
        })}
      </section>

      <div className="company-report-details-grid">
        <main className="company-report-details-main">
          {report.adminReview ? (
            <section className={`company-report-details-card company-admin-decision-card is-${adminReviewPresentation.tone}`}>
              <header className="company-report-section-header">
                <div>
                  <h2>قرار وملاحظات الأدمن</h2>
                  <p>راجع القرار والسبب قبل اتخاذ الخطوة التالية.</p>
                </div>
                <span>
                  {report.adminReview.status === 'accepted' ? <FiCheckCircle /> : <FiMessageSquare />}
                </span>
              </header>

              <div className="company-admin-decision-card__content">
                <strong>{adminReviewPresentation.title}</strong>
                <p>{adminReviewPresentation.description}</p>
                {report.adminReview.userMessage ? (
                  <div className="company-admin-decision-card__public-message">
                    <strong>الرسالة العامة للمستخدم</strong>
                    <p>{report.adminReview.userMessage}</p>
                  </div>
                ) : null}
                {report.adminReview.reviewedAt ? (
                  <small>
                    <FiClock />
                    {formatEgyptDateTime(report.adminReview.reviewedAt)}
                  </small>
                ) : null}
              </div>
            </section>
          ) : null}

          {report.companyResponse ? (
            <section className="company-report-details-card company-company-response-card">
              <header className="company-report-section-header">
                <div>
                  <h2>الرد السابق المرسل من الشركة</h2>
                  <p>الملاحظة والصور التي وصلت للأدمن في آخر إرسال.</p>
                </div>
                <span>
                  <FiFileText />
                </span>
              </header>

              <div className="company-company-response-card__details">
                <div>
                  <span>نوع الرد</span>
                  <strong>{report.companyResponse.statusLabel || 'رد الشركة'}</strong>
                </div>
                <div>
                  <span>تاريخ الإرسال</span>
                  <strong>{formatEgyptDateTime(report.companyResponse.submittedAt)}</strong>
                </div>
              </div>

              {report.companyResponse.reason ? (
                <div className="company-company-response-card__reason">
                  <strong>سبب تعذر التنفيذ</strong>
                  <p>{report.companyResponse.reason}</p>
                </div>
              ) : null}

              {report.companyResponse.note ? (
                <div className="company-company-response-card__note">
                  <strong>ملاحظة الشركة</strong>
                  <p>{report.companyResponse.note}</p>
                </div>
              ) : null}

              <div className="company-company-response-card__images">
                <h3>الصور المرسلة للأدمن</h3>
                <ReportImageGallery
                  images={report.companyResponse.images || []}
                  altPrefix="صورة الرد السابق"
                  emptyText="لم يتم إرفاق صور مع هذا الرد."
                />
              </div>
            </section>
          ) : null}

          {report.companySubmissions?.length > 1 ? (
            <section className="company-report-details-card company-submission-history-card">
              <header className="company-report-section-header">
                <div>
                  <h2>سجل ردود الشركة</h2>
                  <p>كل الردود السابقة محفوظة بالترتيب ولا يتم استبدالها.</p>
                </div>
                <span>
                  <FiFileText />
                </span>
              </header>

              <div className="company-submission-history-list">
                {report.companySubmissions.map((submission, index) => (
                  <article key={submission.id || `${submission.submittedAt}-${index}`}>
                    <div>
                      <strong>{submission.statusLabel || 'رد الشركة'}</strong>
                      <small>{formatEgyptDateTime(submission.submittedAt)}</small>
                    </div>
                    {submission.reason ? <p><b>السبب:</b> {submission.reason}</p> : null}
                    {submission.note ? <p>{submission.note}</p> : null}
                    {submission.reviewLabel ? <span>{submission.reviewLabel}</span> : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {canManageExecution ? (
            <section className="company-report-details-card company-execution-workspace">
              <header className="company-report-section-header company-execution-workspace__header">
                <div>
                  <h2>لوحة تنفيذ البلاغ</h2>
                  <p>كل أدوات التنفيذ مجمعة هنا بالترتيب الصحيح.</p>
                </div>
                <span>
                  <FiTool />
                </span>
              </header>

              <div className={`company-assigned-team-panel ${report.assignedTeam ? 'has-team' : 'is-empty'}`}>
                <div className="company-assigned-team-panel__icon">
                  <FiUsers />
                </div>

                <div className="company-assigned-team-panel__content">
                  <small>فرقة الصيانة المسؤولة</small>
                  {report.assignedTeam ? (
                    <>
                      <strong>{report.assignedTeam.name}</strong>
                      <p>
                        {report.assignedTeam.leadName || 'مسؤول الفرقة غير محدد'}
                        {report.assignedTeam.phone ? (
                          <span>
                            <FiPhone />
                            {report.assignedTeam.phone}
                          </span>
                        ) : null}
                      </p>
                    </>
                  ) : (
                    <>
                      <strong>لم يتم اختيار فرقة صيانة بعد</strong>
                      <p>اختر الفرقة أولًا لتفعيل بدء التنفيذ.</p>
                    </>
                  )}
                </div>
              </div>

              {canSubmitSolution ? (
                <div className="company-execution-workspace__primary-action">
                  <SolutionUploadForm report={report} onSubmitSolution={handleSubmitSolution} />
                </div>
              ) : null}

              <div className="company-execution-workspace__secondary-action">
                <UpdateReportStatusForm
                  report={report}
                  onStartWork={handleStartWork}
                  onCannotFix={handleCannotFix}
                  onRequestTeamSelection={() => setIsAssignModalOpen(true)}
                />
              </div>
            </section>
          ) : null}

          {isWaitingForAdmin ? (
            <section className="company-report-details-card company-report-waiting-card">
              <FiClock />
              <div>
                <h2>
                  {report.companyResponse?.status === 'cannot_fix'
                    ? 'تم إرسال طلب تعذر التنفيذ للأدمن'
                    : 'تم إرسال الرد للأدمن'}
                </h2>
                <p>
                  {report.companyResponse?.status === 'cannot_fix'
                    ? 'لا يلزم اتخاذ إجراء الآن. سيقرر الأدمن قبول الاعتذار أو إعادة الإسناد أو رفض الطلب وطلب الاستكمال.'
                    : 'لا يلزم اتخاذ إجراء الآن. سيظهر هنا قرار الأدمن سواء بقبول الحل أو طلب استكماله.'}
                </p>
              </div>
            </section>
          ) : null}

          {isResolved ? (
            <section className="company-report-details-card company-report-resolved-card">
              <FiCheckCircle />
              <div>
                <h2>
                  {isReassigned
                    ? 'تم تحويل البلاغ إلى شركة أخرى'
                    : isCannotFixAccepted
                      ? 'تم اعتماد تعذر التنفيذ'
                      : 'تم اعتماد الحل وإغلاق البلاغ'}
                </h2>
                <p>
                  {isReassigned
                    ? 'قبل الأدمن طلب التعذر وأنهى إسناد البلاغ لهذه الشركة، وسيتم استكماله عن طريق جهة تنفيذ بديلة.'
                    : isCannotFixAccepted
                      ? 'راجع الأدمن سبب التعذر واعتمده، ولا يلزم اتخاذ إجراء إضافي.'
                      : 'راجع الأدمن التنفيذ وقبل الحل النهائي بنجاح.'}
                </p>
              </div>
            </section>
          ) : null}

          {report.progressImages?.length ? (
            <section className="company-report-details-card">
              <header className="company-report-section-header">
                <div>
                  <h2>صور المعاينة وبداية التنفيذ</h2>
                  <p>الدليل المرفوع عند تحويل حالة البلاغ إلى جاري التنفيذ.</p>
                </div>
                <span>
                  <FiPlayCircle />
                </span>
              </header>
              <ReportImageGallery
                images={report.progressImages}
                altPrefix="صورة بداية التنفيذ"
                emptyText="لا توجد صور بداية تنفيذ مرفوعة."
              />
            </section>
          ) : null}
        </main>

        <aside className="company-report-details-side">
          <section className="company-report-details-card">
            <header className="company-report-section-header">
              <div>
                <h2>بيانات البلاغ</h2>
                <p>المعلومات الأساسية والمواعيد.</p>
              </div>
            </header>

            <div className="company-report-info-list">
              <div>
                <FiTag />
                <span>رقم البلاغ</span>
                <strong className="company-copyable-report-id company-report-id-value" dir="ltr">
                  {report.id}
                </strong>
              </div>
              <div>
                <FiTag />
                <span>نوع المشكلة</span>
                <strong>{report.type}</strong>
              </div>
              <div>
                <FiMapPin />
                <span>الموقع</span>
                <strong>{report.location || 'غير متوفر'}</strong>
              </div>
              <div>
                <FiCalendar />
                <span>تاريخ إنشاء البلاغ</span>
                <strong>{formatEgyptDate(report.date)}</strong>
              </div>
              <div>
                <FiClock />
                <span>تاريخ ووقت الإسناد بتوقيت مصر</span>
                <strong>{formatEgyptDateTime(report.assignedAt)}</strong>
              </div>
              {report.dueDate ? (
                <div>
                  <FiCalendar />
                  <span>الموعد المستهدف</span>
                  <strong>{formatEgyptDate(report.dueDate)}</strong>
                </div>
              ) : null}
            </div>
          </section>

          <section className="company-report-details-card company-assignment-note-card">
            <header className="company-report-section-header">
              <div>
                <h2>ملاحظة الإسناد</h2>
                <p>تعليمات الأدمن عند إسناد البلاغ.</p>
              </div>
              <span>
                <FiMessageSquare />
              </span>
            </header>
            <p className={adminAssignmentNote ? '' : 'is-empty'}>
              {adminAssignmentNote || 'لم يرسل الأدمن أي ملاحظة عند إسناد هذا البلاغ.'}
            </p>
          </section>

          <section className="company-report-details-card">
            <header className="company-report-section-header">
              <div>
                <h2>بيانات المبلّغ</h2>
                <p>Reporter</p>
              </div>
            </header>

            <div className="company-reporter-box">
              <FiUser />
              <div>
                <strong>{report.reporter?.name || 'غير متوفر'}</strong>
                <span>{report.reporter?.phone || 'لا يوجد رقم هاتف متاح'}</span>
              </div>
            </div>
          </section>

          <section className="company-report-details-card">
            <header className="company-report-section-header">
              <div>
                <h2>سجل التحديثات</h2>
                <p>كل ما حدث على البلاغ بالترتيب.</p>
              </div>
            </header>

            <div className="company-report-timeline">
              {report.timeline?.length ? (
                report.timeline.map((item) => (
                  <article key={item.id}>
                    <span className="company-report-timeline__dot" />
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                    <small>
                      {item.actor} - {formatEgyptDateTime(item.date)}
                    </small>
                  </article>
                ))
              ) : (
                <p className="company-report-muted">لا توجد تحديثات بعد.</p>
              )}
            </div>
          </section>
        </aside>
      </div>

      <AssignMaintenanceTeamModal
        report={report}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={(updatedReport) => {
          setReport(updatedReport);
          setIsAssignModalOpen(false);
        }}
      />
    </div>
  );
}

export default CompanyReportDetailsPage;
