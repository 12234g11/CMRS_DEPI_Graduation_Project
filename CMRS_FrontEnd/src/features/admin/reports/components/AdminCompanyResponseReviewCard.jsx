import { useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiTool,
  FiXCircle,
} from 'react-icons/fi';

function getResponseTone(responseStatus) {
  const status = String(responseStatus || '').toLowerCase();

  if (status.includes('fixed') || status.includes('resolved') || status.includes('complete')) {
    return 'success';
  }

  if (
    status.includes('cannot') ||
    status.includes('reject') ||
    status.includes('decline') ||
    status.includes('تعذر') ||
    status.includes('اعتذار')
  ) {
    return 'danger';
  }

  return 'warning';
}

function getResponseScenario(response) {
  const status = `${response?.status || ''} ${response?.statusLabel || ''}`.toLowerCase();

  if (status.includes('fixed') || status.includes('resolved') || status.includes('complete') || status.includes('تم الإصلاح')) {
    return 'fixed';
  }

  if (
    status.includes('cannot') ||
    status.includes('reject') ||
    status.includes('decline') ||
    status.includes('تعذر') ||
    status.includes('اعتذار')
  ) {
    return 'cannot-fix';
  }

  return 'general';
}

function AdminCompanyResponseReviewCard({
  report,
  onAcceptFix,
  onRequestCompletion,
  onAcceptCannotFix,
  onReassign,
}) {
  const [adminNote, setAdminNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeAction, setActiveAction] = useState('');

  const response = report.companyResponse;

  const decisionScenario = useMemo(() => getResponseScenario(response), [response]);

  if (!response) {
    return (
      <section
        id="company-response"
        className="admin-report-details-card admin-company-response-card"
      >
        <header className="admin-report-card-header">
          <div>
            <h2>رد الشركة</h2>
            <p>Company Response</p>
          </div>

          <span className="admin-company-response-status admin-company-response-status--empty">
            لا يوجد رد بعد
          </span>
        </header>

        <div className="admin-company-response-empty">
          <FiClock />
          <p>لم ترسل الشركة أي تحديث على هذا البلاغ حتى الآن.</p>
        </div>
      </section>
    );
  }

  const reviewStatus = String(response.reviewStatus || '').toLowerCase();
  const isPendingReview = reviewStatus === 'pending' || !reviewStatus;
  const responseTone = getResponseTone(response.status);

  function handleNoteChange(event) {
    setAdminNote(event.target.value);

    if (noteError) {
      setNoteError('');
    }
  }

  async function handleDecision(action) {
    const trimmedNote = adminNote.trim();
    const actionsNeedNote = ['request-completion', 'reassign', 'close-cannot-fix'];

    if (actionsNeedNote.includes(action) && !trimmedNote) {
      setNoteError('اكتب سبب واضح قبل تنفيذ هذا القرار حتى يظهر للشركة أو في سجل البلاغ.');
      return;
    }

    setIsSaving(true);
    setActiveAction(action);
    setNoteError('');

    try {
      if (action === 'accept-fix') {
        await onAcceptFix?.(trimmedNote);
      }

      if (action === 'request-completion') {
        await onRequestCompletion?.(trimmedNote);
      }

      if (action === 'close-cannot-fix') {
        await onAcceptCannotFix?.(trimmedNote);
      }

      if (action === 'reassign') {
        await onReassign?.(trimmedNote);
      }
    } finally {
      setIsSaving(false);
      setActiveAction('');
    }
  }

  return (
    <section
      id="company-response"
      className="admin-report-details-card admin-company-response-card"
    >
      <header className="admin-report-card-header">
        <div>
          <h2>مراجعة رد الشركة</h2>
          <p>Company Response Review</p>
        </div>

        <span
          className={`admin-company-response-status admin-company-response-status--${responseTone}`}
        >
          {response.statusLabel}
        </span>
      </header>

      <div className="admin-company-response-summary">
        <div>
          <span>الشركة</span>
          <strong>{response.companyName}</strong>
        </div>

        <div>
          <span>تاريخ الرد</span>
          <strong>{response.submittedAt}</strong>
        </div>

        <div>
          <span>حالة المراجعة</span>
          <strong>
            {isPendingReview ? 'بانتظار قرار الأدمن' : response.reviewLabel}
          </strong>
        </div>
      </div>

      <div className="admin-company-response-note">
        <strong>
          <FiTool />
          ملاحظة الشركة
        </strong>

        <p>{response.note || 'لم ترسل الشركة ملاحظة نصية.'}</p>
      </div>

      {response.reason ? (
        <div className="admin-company-response-warning">
          <FiAlertCircle />
          <div>
            <strong>سبب التعذر / الاعتذار</strong>
            <p>{response.reason}</p>
          </div>
        </div>
      ) : null}

      <div className="admin-company-response-images">
        <div className="admin-company-response-images__title">
          <FiImage />
          <strong>مرفقات / صور الشركة</strong>
          <span>{response.images?.length || 0} صورة</span>
        </div>

        {response.images?.length ? (
          <div className="admin-company-response-images__grid">
            {response.images.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`صورة رد الشركة ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <p className="admin-company-response-no-images">
            لا توجد صور مرفقة من الشركة.
          </p>
        )}
      </div>

      {isPendingReview ? (
        <div className="admin-company-response-decision-panel">
          <div className="admin-company-response-decision-intro">
            <FiShield />
            <div>
              <strong>
                {decisionScenario === 'fixed'
                  ? 'الشركة أرسلت أن المشكلة تم حلها'
                  : decisionScenario === 'cannot-fix'
                    ? 'الشركة أرسلت تعذر أو اعتذار عن التنفيذ'
                    : 'يوجد رد جديد من الشركة يحتاج قرار'}
              </strong>
              <p>
                اختار القرار المناسب. عند رفض رد الشركة أو إعادة التعيين لازم تكتب سبب واضح.
              </p>
            </div>
          </div>

          <label className="admin-company-response-admin-note">
            ملاحظة الأدمن / سبب القرار

            <textarea
              value={adminNote}
              onChange={handleNoteChange}
              rows={4}
              className={noteError ? 'is-invalid' : ''}
              placeholder="مثال: الصور غير كافية، العمل لم يكتمل، أو المشكلة خارج نطاق التنفيذ الحالي..."
            />

            {noteError ? (
              <span className="admin-company-response-note-error">
                <FiAlertCircle />
                {noteError}
              </span>
            ) : null}
          </label>

          <div className="admin-company-response-actions">
            {decisionScenario === 'fixed' ? (
              <>
                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--accept"
                  onClick={() => handleDecision('accept-fix')}
                  disabled={isSaving}
                >
                  <FiCheckCircle />
                  {activeAction === 'accept-fix' ? 'جاري قبول الحل...' : 'قبول الحل وإغلاق البلاغ'}
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--complete"
                  onClick={() => handleDecision('request-completion')}
                  disabled={isSaving}
                >
                  <FiSend />
                  {activeAction === 'request-completion' ? 'جاري إرسال السبب...' : 'رفض الحل وطلب متابعة'}
                </button>
              </>
            ) : null}

            {decisionScenario === 'cannot-fix' ? (
              <>
                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--complete"
                  onClick={() => handleDecision('request-completion')}
                  disabled={isSaving}
                >
                  <FiSend />
                  {activeAction === 'request-completion'
                    ? 'جاري إجبار الشركة...'
                    : 'إجبار نفس الشركة على المتابعة'}
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--reassign"
                  onClick={() => handleDecision('reassign')}
                  disabled={isSaving}
                >
                  <FiRefreshCw />
                  {activeAction === 'reassign' ? 'جاري تجهيز إعادة التعيين...' : 'تعيين شركة أخرى'}
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--danger"
                  onClick={() => handleDecision('close-cannot-fix')}
                  disabled={isSaving}
                >
                  <FiXCircle />
                  {activeAction === 'close-cannot-fix'
                    ? 'جاري إغلاق البلاغ...'
                    : 'إغلاق البلاغ بدون عقوبة'}
                </button>
              </>
            ) : null}

            {decisionScenario === 'general' ? (
              <>
                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--accept"
                  onClick={() => handleDecision('accept-fix')}
                  disabled={isSaving}
                >
                  <FiCheckCircle />
                  {activeAction === 'accept-fix' ? 'جاري القبول...' : 'قبول رد الشركة'}
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--complete"
                  onClick={() => handleDecision('request-completion')}
                  disabled={isSaving}
                >
                  <FiSend />
                  {activeAction === 'request-completion' ? 'جاري إرسال السبب...' : 'رفض الرد وطلب متابعة'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="admin-company-response-reviewed">
          <FiCheckCircle />
          <div>
            <strong>{response.reviewLabel}</strong>
            {response.adminNote ? <p>{response.adminNote}</p> : null}
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminCompanyResponseReviewCard;
