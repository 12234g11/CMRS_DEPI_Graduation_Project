import { useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiRefreshCw,
  FiRotateCcw,
  FiSend,
  FiTool,
  FiXCircle,
} from 'react-icons/fi';

function getResponseTone(responseStatus) {
  if (responseStatus === 'fixed') return 'success';
  if (responseStatus === 'cannot_fix') return 'danger';
  return 'warning';
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

  const response = report.companyResponse;

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

  const isPendingReview = response.reviewStatus === 'pending';
  const responseTone = getResponseTone(response.status);

  function handleNoteChange(event) {
    setAdminNote(event.target.value);

    if (noteError) {
      setNoteError('');
    }
  }

  async function handleDecision(action) {
    const trimmedNote = adminNote.trim();

    if (action === 'request-completion' && !trimmedNote) {
      setNoteError('يجب كتابة ملاحظة واضحة للشركة قبل إرسال طلب الاستكمال.');
      return;
    }

    setIsSaving(true);

    if (action === 'accept-fix') {
      await onAcceptFix?.(trimmedNote);
    }

    if (action === 'request-completion') {
      await onRequestCompletion?.(trimmedNote);
    }

    if (action === 'accept-cannot-fix') {
      await onAcceptCannotFix?.(trimmedNote);
    }

    if (action === 'reassign') {
      await onReassign?.(trimmedNote);
    }

    setIsSaving(false);
  }

  return (
    <section
      id="company-response"
      className="admin-report-details-card admin-company-response-card"
    >
      <header className="admin-report-card-header">
        <div>
          <h2>رد الشركة</h2>
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

        <p>{response.note}</p>
      </div>

      {response.reason ? (
        <div className="admin-company-response-warning">
          <FiAlertCircle />
          <div>
            <strong>سبب التعذر</strong>
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
        <>
          <label className="admin-company-response-admin-note">
            ملاحظة الأدمن للشركة

            <textarea
              value={adminNote}
              onChange={handleNoteChange}
              rows={4}
              className={noteError ? 'is-invalid' : ''}
              placeholder="اكتب ملاحظة واضحة للشركة عند طلب الاستكمال أو قبول التعذر..."
            />

            {noteError ? (
              <span className="admin-company-response-note-error">
                <FiAlertCircle />
                {noteError}
              </span>
            ) : null}
          </label>

          <div className="admin-company-response-actions">
            {response.status === 'fixed' ? (
              <>
                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--accept"
                  onClick={() => handleDecision('accept-fix')}
                  disabled={isSaving}
                >
                  <FiCheckCircle />
                  قبول الإصلاح وتحويله إلى تم الحل
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--complete"
                  onClick={() => handleDecision('request-completion')}
                  disabled={isSaving}
                >
                  <FiRotateCcw />
                  طلب استكمال
                </button>
              </>
            ) : null}

            {response.status === 'cannot_fix' ? (
              <>
                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--complete"
                  onClick={() => handleDecision('request-completion')}
                  disabled={isSaving}
                >
                  <FiSend />
                  طلب استكمال من نفس الشركة
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--reassign"
                  onClick={() => handleDecision('reassign')}
                  disabled={isSaving}
                >
                  <FiRefreshCw />
                  إعادة التعيين لشركة أخرى
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--danger"
                  onClick={() => handleDecision('accept-cannot-fix')}
                  disabled={isSaving}
                >
                  <FiXCircle />
                  قبول التعذر وتحويل البلاغ إلى متعذر التنفيذ
                </button>
              </>
            ) : null}
          </div>
        </>
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