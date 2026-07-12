import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiImage,
  FiInfo,
  FiMaximize2,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiTool,
  FiX,
  FiXCircle,
} from 'react-icons/fi';

function cleanText(value) {
  const text = String(value ?? '').trim();

  if (!text || ['null', 'undefined', 'string'].includes(text.toLowerCase())) {
    return '';
  }

  return text;
}

function getResponseTone(response) {
  const status = `${response?.responseType || ''} ${response?.responseTypeLabel || ''} ${response?.status || ''} ${response?.statusLabel || ''}`.toLowerCase();

  if (status.includes('fixed') || status.includes('resolved') || status.includes('complete') || status.includes('تم الإصلاح')) {
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
  const status = `${response?.responseType || ''} ${response?.responseTypeLabel || ''} ${response?.status || ''} ${response?.statusLabel || ''}`.toLowerCase();

  if (
    cleanText(response?.reason) ||
    status.includes('cannot') ||
    status.includes('reject') ||
    status.includes('decline') ||
    status.includes('تعذر') ||
    status.includes('اعتذار')
  ) {
    return 'cannot-fix';
  }

  if (
    status.includes('fixed') ||
    status.includes('resolved') ||
    status.includes('complete') ||
    status.includes('تم الإصلاح')
  ) {
    return 'fixed';
  }

  if (status.includes('started') || status.includes('inprogress') || status.includes('بدء التنفيذ')) {
    return 'started';
  }

  return 'general';
}

function getResponseTypeLabel(response, scenario) {
  const explicitLabel = cleanText(response?.responseTypeLabel);

  if (explicitLabel) return explicitLabel;
  if (scenario === 'cannot-fix') return 'تعذر التنفيذ / اعتذار الشركة';
  if (scenario === 'fixed') return 'إرسال الحل وإثبات التنفيذ';
  if (scenario === 'started') return 'بدء التنفيذ';

  return 'نوع الرد غير محدد';
}

function AdminCompanyResponseReviewCard({
  report,
  onAcceptFix,
  onRequestCompletion,
  onAcceptCannotFix,
  onReassign,
}) {
  const [adminNote, setAdminNote] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [isDecisionConfirmed, setIsDecisionConfirmed] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  const [previewIndex, setPreviewIndex] = useState(null);

  const response = report.companyResponse;
  const decisionScenario = useMemo(() => getResponseScenario(response), [response]);
  const images = useMemo(() => response?.images?.filter(Boolean) || [], [response?.images]);
  const responseHistory = useMemo(
    () => (Array.isArray(report.companyResponseHistory) ? report.companyResponseHistory : []),
    [report.companyResponseHistory],
  );

  useEffect(() => {
    setPreviewIndex(null);
    setAdminNote('');
    setUserMessage('');
    setIsDecisionConfirmed(false);
    setNoteError('');
  }, [report.id, response?.id, images.length]);

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
  const responseTone = getResponseTone(response);
  const responseTypeLabel = getResponseTypeLabel(response, decisionScenario);
  const companyNote = cleanText(response.note);
  const cannotFixReason = cleanText(response.reason);
  const hasKnownResponseType = Boolean(cleanText(response.responseType));
  const isResponsePayloadIncomplete =
    isPendingReview &&
    !hasKnownResponseType &&
    !companyNote &&
    !cannotFixReason &&
    images.length === 0;

  const activeImage = previewIndex === null ? '' : images[previewIndex] || '';
  const hasMultipleImages = images.length > 1;

  function handleNoteChange(event) {
    setAdminNote(event.target.value);

    if (noteError) {
      setNoteError('');
    }
  }

  function goToPreviousImage() {
    if (!hasMultipleImages) return;

    setPreviewIndex((currentIndex) => (
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    ));
  }

  function goToNextImage() {
    if (!hasMultipleImages) return;

    setPreviewIndex((currentIndex) => (
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    ));
  }

  async function handleDecision(action) {
    const trimmedNote = adminNote.trim();
    const trimmedUserMessage = userMessage.trim();
    const isCannotFixDecision = decisionScenario === 'cannot-fix';
    const actionsNeedNote = [
      'request-completion',
      'reject-cannot-fix',
      'reassign',
      'close-cannot-fix',
    ];
    const actionsNeedUserMessage = ['reassign', 'close-cannot-fix'];

    if (actionsNeedNote.includes(action) && !trimmedNote) {
      setNoteError('اكتب سببًا واضحًا للقرار حتى يظهر للشركة ويُحفظ في سجل البلاغ.');
      return;
    }

    if (actionsNeedUserMessage.includes(action) && !trimmedUserMessage) {
      setNoteError('اكتب رسالة عامة واضحة للمستخدم قبل تنفيذ هذا القرار.');
      return;
    }

    if (trimmedNote.length > 1000 || trimmedUserMessage.length > 500) {
      setNoteError(
        trimmedNote.length > 1000
          ? 'ملاحظة القرار لا يمكن أن تزيد عن 1000 حرف.'
          : 'رسالة المستخدم لا يمكن أن تزيد عن 500 حرف.',
      );
      return;
    }

    if (isCannotFixDecision && !isDecisionConfirmed) {
      setNoteError('أكد أنك راجعت سبب التعذر وفهمت نتيجة القرار قبل المتابعة.');
      return;
    }

    const payload = {
      adminNote: trimmedNote,
      userMessage: trimmedUserMessage,
      submissionId: response.submissionId || response.id,
      responseType: response.responseType,
    };

    setIsSaving(true);
    setActiveAction(action);
    setNoteError('');

    try {
      if (action === 'accept-fix') {
        await onAcceptFix?.({
          ...payload,
          decision: 'accept_solution',
        });
      }

      if (action === 'request-completion') {
        await onRequestCompletion?.({
          ...payload,
          decision: 'request_completion',
        });
      }

      if (action === 'reject-cannot-fix') {
        await onRequestCompletion?.({
          ...payload,
          decision: 'reject_and_continue',
        });
      }

      if (action === 'close-cannot-fix') {
        await onAcceptCannotFix?.({
          ...payload,
          decision: 'accept_cannot_fix',
        });
      }

      if (action === 'reassign') {
        await onReassign?.({
          ...payload,
          decision: 'reassign',
        });
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
          {response.statusLabel || response.reviewLabel || 'بانتظار مراجعة الأدمن'}
        </span>
      </header>

      <div className="admin-company-response-summary">
        <div>
          <span>الشركة</span>
          <strong>{response.companyName || report.assignedCompanyName || 'غير متاحة'}</strong>
        </div>

        <div>
          <span>تاريخ الرد</span>
          <strong>{response.submittedAt || '-'}</strong>
        </div>

        <div>
          <span>حالة المراجعة</span>
          <strong>
            {isPendingReview ? 'بانتظار قرار الأدمن' : response.reviewLabel}
          </strong>
        </div>

        <div className={`admin-company-response-type admin-company-response-type--${responseTone}`}>
          <span>نوع رد الشركة</span>
          <strong>{responseTypeLabel}</strong>
        </div>
      </div>

      {isResponsePayloadIncomplete ? (
        <div className="admin-company-response-data-warning" role="alert">
          <FiInfo />
          <div>
            <strong>بيانات رد الشركة غير مكتملة من الخادم</strong>
            <p>
              الرد موجود وتاريخ إرساله ظاهر، لكن نوع الرد والسبب والتفاصيل والمرفقات
              لم تصل داخل استجابة تفاصيل البلاغ. يجب أن يرجعها الباك داخل
              <code> companyResponse </code> حتى يمكن عرضها ومراجعتها.
            </p>
          </div>
        </div>
      ) : null}

      {decisionScenario === 'cannot-fix' ? (
        <>
          <div className="admin-company-response-warning">
            <FiAlertCircle />
            <div>
              <strong>سبب تعذر التنفيذ / الاعتذار</strong>
              <p>
                {cannotFixReason ||
                  'لم يرجع الخادم سبب التعذر الذي أدخلته الشركة. راجع companyResponse.reason في Endpoint تفاصيل البلاغ.'}
              </p>
            </div>
          </div>

          <div className="admin-company-response-note">
            <strong>
              <FiTool />
              التفاصيل والتوضيح المرسل من الشركة
            </strong>

            <p>
              {companyNote ||
                'لم يرجع الخادم التفاصيل النصية لتعذر التنفيذ. راجع companyResponse.note في Endpoint تفاصيل البلاغ.'}
            </p>
          </div>
        </>
      ) : (
        <div className="admin-company-response-note">
          <strong>
            <FiTool />
            {decisionScenario === 'fixed' ? 'تفاصيل الحل المرسلة من الشركة' : 'ملاحظة الشركة'}
          </strong>

          <p>
            {companyNote ||
              'لم ترسل الشركة ملاحظة نصية، أو لم يرجعها الخادم داخل companyResponse.note.'}
          </p>
        </div>
      )}

      {decisionScenario !== 'cannot-fix' && cannotFixReason ? (
        <div className="admin-company-response-warning">
          <FiAlertCircle />
          <div>
            <strong>سبب التعذر / الاعتذار</strong>
            <p>{cannotFixReason}</p>
          </div>
        </div>
      ) : null}

      <div className="admin-company-response-images">
        <div className="admin-company-response-images__title">
          <FiImage />
          <strong>مرفقات / صور الشركة</strong>
          <span>{images.length} صورة</span>
        </div>

        {images.length ? (
          <div className="admin-company-response-images__grid">
            {images.map((image, index) => (
              <button
                type="button"
                className="admin-company-response-image"
                key={`${image}-${index}`}
                onClick={() => setPreviewIndex(index)}
                aria-label={`معاينة صورة رد الشركة رقم ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`صورة رد الشركة ${index + 1}`}
                />
                <span>
                  <FiMaximize2 />
                  معاينة كاملة
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="admin-company-response-no-images">
            لا توجد صور مرفقة من الشركة، أو لم يرجعها الخادم داخل companyResponse.images.
          </p>
        )}
      </div>

      {responseHistory.length > 1 ? (
        <div className="admin-company-response-history">
          <div className="admin-company-response-history__heading">
            <FiClock />
            <div>
              <strong>سجل ردود الشركة</strong>
              <p>الردود السابقة محفوظة لمراجعة التسلسل الكامل للبلاغ.</p>
            </div>
          </div>

          <div className="admin-company-response-history__list">
            {responseHistory.map((item, index) => (
              <article key={item.id || `${item.submittedAt}-${index}`}>
                <div>
                  <strong>{getResponseTypeLabel(item, getResponseScenario(item))}</strong>
                  <small>{item.submittedAt || '-'}</small>
                </div>
                {cleanText(item.reason) ? <p><b>السبب:</b> {item.reason}</p> : null}
                {cleanText(item.note) ? <p>{item.note}</p> : null}
                <span>{item.reviewLabel || 'لم تتم المراجعة بعد'}</span>
              </article>
            ))}
          </div>
        </div>
      ) : null}

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
                {decisionScenario === 'cannot-fix'
                  ? 'راجع السبب والمرفقات، ثم اختر: قبول الاعتذار، إعادة الإسناد، أو رفض الاعتذار وطلب الاستكمال.'
                  : 'اختر القرار المناسب، واكتب سببًا واضحًا عند طلب الاستكمال.'}
              </p>
            </div>
          </div>

          <label className="admin-company-response-admin-note">
            ملاحظة الأدمن / سبب القرار

            <textarea
              value={adminNote}
              onChange={handleNoteChange}
              rows={4}
              maxLength={1000}
              className={noteError ? 'is-invalid' : ''}
              placeholder="مثال: الصور غير كافية، العمل لم يكتمل، أو المشكلة خارج نطاق التنفيذ الحالي..."
            />

            <span className="admin-company-response-character-count">
              {adminNote.length} / 1000
            </span>

            {noteError ? (
              <span className="admin-company-response-note-error">
                <FiAlertCircle />
                {noteError}
              </span>
            ) : null}
          </label>

          {decisionScenario === 'cannot-fix' ? (
            <>
              <label className="admin-company-response-admin-note admin-company-response-user-message">
                الرسالة العامة التي ستظهر للمستخدم

                <textarea
                  value={userMessage}
                  onChange={(event) => {
                    setUserMessage(event.target.value.slice(0, 500));
                    if (noteError) setNoteError('');
                  }}
                  rows={3}
                  maxLength={500}
                  placeholder="مثال: تعذر تنفيذ البلاغ حاليًا لسبب خارج عن إرادة جهة التنفيذ، أو تم تحويله إلى شركة أخرى."
                />

                <span className="admin-company-response-character-count">
                  {userMessage.length} / 500
                </span>
              </label>

              <div className="admin-company-response-decision-guide">
                <article>
                  <FiXCircle />
                  <div>
                    <strong>قبول الاعتذار</strong>
                    <p>يحوّل البلاغ إلى متعذر التنفيذ ويُبلغ المستخدم بالرسالة العامة.</p>
                  </div>
                </article>
                <article>
                  <FiRefreshCw />
                  <div>
                    <strong>إعادة الإسناد</strong>
                    <p>ينهي إسناد الشركة الحالية ثم يفتح اختيار شركة بديلة.</p>
                  </div>
                </article>
                <article>
                  <FiSend />
                  <div>
                    <strong>رفض الاعتذار</strong>
                    <p>يبقي البلاغ لدى نفس الشركة ويعيده بحالة مطلوب استكمال.</p>
                  </div>
                </article>
              </div>

              <label className="admin-company-response-confirmation">
                <input
                  type="checkbox"
                  checked={isDecisionConfirmed}
                  onChange={(event) => {
                    setIsDecisionConfirmed(event.target.checked);
                    if (noteError) setNoteError('');
                  }}
                />
                <span>
                  أؤكد أنني راجعت سبب التعذر والمرفقات وفهمت تأثير القرار على الشركة والمستخدم.
                </span>
              </label>
            </>
          ) : null}

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
                  className="admin-company-response-btn admin-company-response-btn--danger"
                  onClick={() => handleDecision('close-cannot-fix')}
                  disabled={isSaving}
                >
                  <FiXCircle />
                  {activeAction === 'close-cannot-fix'
                    ? 'جاري قبول الاعتذار...'
                    : 'قبول الاعتذار وإنهاء البلاغ'}
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--reassign"
                  onClick={() => handleDecision('reassign')}
                  disabled={isSaving}
                >
                  <FiRefreshCw />
                  {activeAction === 'reassign'
                    ? 'جاري تجهيز إعادة الإسناد...'
                    : 'إعادة الإسناد لشركة أخرى'}
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--complete"
                  onClick={() => handleDecision('reject-cannot-fix')}
                  disabled={isSaving}
                >
                  <FiSend />
                  {activeAction === 'reject-cannot-fix'
                    ? 'جاري إرسال طلب الاستكمال...'
                    : 'رفض الاعتذار وطلب الاستكمال'}
                </button>
              </>
            ) : null}

            {decisionScenario === 'started' || decisionScenario === 'general' ? (
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
            {cleanText(response.adminNote) ? <p>{response.adminNote}</p> : null}
            {cleanText(response.userMessage) ? (
              <p className="admin-company-response-reviewed__user-message">
                <b>الرسالة العامة للمستخدم:</b> {response.userMessage}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {activeImage ? (
        <div className="admin-report-image-lightbox" role="dialog" aria-modal="true">
          <button
            type="button"
            className="admin-report-image-lightbox__backdrop"
            onClick={() => setPreviewIndex(null)}
            aria-label="إغلاق المعاينة"
          />

          <div className="admin-report-image-lightbox__content">
            <header className="admin-report-image-lightbox__header">
              <strong>مرفقات رد الشركة</strong>
              <span>{previewIndex + 1} / {images.length}</span>
              <button
                type="button"
                onClick={() => setPreviewIndex(null)}
                aria-label="إغلاق"
              >
                <FiX />
              </button>
            </header>

            <div className="admin-report-image-lightbox__stage">
              {hasMultipleImages ? (
                <button
                  type="button"
                  className="admin-report-image-lightbox__nav admin-report-image-lightbox__nav--prev"
                  onClick={goToPreviousImage}
                  aria-label="الصورة السابقة"
                >
                  <FiChevronRight />
                </button>
              ) : null}

              <img src={activeImage} alt="مرفق رد الشركة" />

              {hasMultipleImages ? (
                <button
                  type="button"
                  className="admin-report-image-lightbox__nav admin-report-image-lightbox__nav--next"
                  onClick={goToNextImage}
                  aria-label="الصورة التالية"
                >
                  <FiChevronLeft />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminCompanyResponseReviewCard;
