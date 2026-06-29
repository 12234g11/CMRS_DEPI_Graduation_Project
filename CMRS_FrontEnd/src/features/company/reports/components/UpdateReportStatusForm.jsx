import { useState } from 'react';
import { FiAlertCircle, FiPlayCircle, FiSend, FiXCircle } from 'react-icons/fi';

function UpdateReportStatusForm({
  report,
  onStartWork,
  onCannotFix,
}) {
  const [cannotFixReason, setCannotFixReason] = useState('');
  const [cannotFixNote, setCannotFixNote] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!report) return null;

  const canStart = report.status === 'تم التعيين';
  const canSendCannotFix = ['تم التعيين', 'جاري التنفيذ', 'مطلوب استكمال'].includes(
    report.status,
  );

  async function handleStartWork() {
    setIsSaving(true);
    await onStartWork?.();
    setIsSaving(false);
  }

  async function handleCannotFix(event) {
    event.preventDefault();

    if (!cannotFixReason.trim() || !cannotFixNote.trim()) {
      setError('يجب كتابة سبب التعذر وملاحظة واضحة قبل إرسال الرد للأدمن.');
      return;
    }

    setIsSaving(true);

    await onCannotFix?.({
      reason: cannotFixReason.trim(),
      note: cannotFixNote.trim(),
      images: report.images?.slice(0, 1) || [],
    });

    setCannotFixReason('');
    setCannotFixNote('');
    setError('');
    setIsSaving(false);
  }

  return (
    <section className="company-status-form">
      <header className="company-report-section-header">
        <div>
          <h2>تحديث حالة البلاغ</h2>
          <p>ابدأ التنفيذ أو أرسل تعذر التنفيذ للأدمن عند وجود مانع حقيقي.</p>
        </div>

        <span>
          <FiSend />
        </span>
      </header>

      <div className="company-current-status-box">
        <span>الحالة الحالية</span>
        <strong>{report.status}</strong>
      </div>

      {canStart ? (
        <button
          type="button"
          className="company-start-work-btn"
          onClick={handleStartWork}
          disabled={isSaving}
        >
          <FiPlayCircle />
          {isSaving ? 'جاري تحديث الحالة...' : 'بدء التنفيذ'}
        </button>
      ) : null}

      {canSendCannotFix ? (
        <form className="company-cannot-fix-form" onSubmit={handleCannotFix}>
          <label className="company-report-form-field">
            سبب التعذر
            <input
              type="text"
              value={cannotFixReason}
              onChange={(event) => {
                setCannotFixReason(event.target.value);
                if (error) setError('');
              }}
              placeholder="مثال: يحتاج تصريح فصل تيار قبل بدء الصيانة"
            />
          </label>

          <label className="company-report-form-field">
            ملاحظة تفصيلية للأدمن
            <textarea
              value={cannotFixNote}
              onChange={(event) => {
                setCannotFixNote(event.target.value);
                if (error) setError('');
              }}
              rows={4}
              placeholder="اكتب تفاصيل التعذر وما المطلوب من الأدمن..."
            />
          </label>

          {error ? (
            <p className="company-report-form-error">
              <FiAlertCircle />
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="company-cannot-fix-btn"
            disabled={isSaving}
          >
            <FiXCircle />
            {isSaving ? 'جاري إرسال التعذر...' : 'إرسال تعذر التنفيذ للأدمن'}
          </button>
        </form>
      ) : null}
    </section>
  );
}

export default UpdateReportStatusForm;