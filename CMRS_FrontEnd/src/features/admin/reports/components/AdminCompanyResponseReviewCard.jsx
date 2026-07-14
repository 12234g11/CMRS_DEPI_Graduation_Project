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

  // آخر status/responseType للشركة هو الذي يحدد أزرار المراجعة.
  // وجود reason قد يكون من رد سابق أو حقلًا إضافيًا في رد الحل، لذلك لا يسبق
  // الحالة الحالية عند تحديد ما إذا كانت المراجعة للحل أم للتعذر.
  if (
    status.includes('fixed') ||
    status.includes('solution') ||
    status.includes('resolved') ||
    status.includes('complete') ||
    status.includes('تم الإصلاح') ||
    status.includes('تم الحل')
  ) {
    return 'fixed';
  }

  if (
    status.includes('cannot') ||
    status.includes('unable') ||
    status.includes('reject') ||
    status.includes('decline') ||
    status.includes('تعذر') ||
    status.includes('اعتذار')
  ) {
    return 'cannot-fix';
  }

  if (
    status.includes('started') ||
    status.includes('inprogress') ||
    status.includes('in progress') ||
    status.includes('بدء التنفيذ') ||
    status.includes('جاري التنفيذ')
  ) {
    return 'started';
  }

  // fallback للبيانات القديمة التي لم تكن ترجع نوع الرد أو حالته بوضوح.
  if (cleanText(response?.reason)) {
    return 'cannot-fix';
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

function getDecisionModalConfig(action, scenario) {
  const configs = {
    'accept-fix': {
      title: scenario === 'started' ? 'قبول رد الشركة' : 'قبول الحل وإغلاق البلاغ',
      description:
        scenario === 'started'
          ? 'اكتب رسالة واحدة توضّح للشركة نتيجة مراجعة رد بدء التنفيذ.'
          : 'اكتب رسالة واحدة ستصل إلى الشركة عند اعتماد الحل وإغلاق البلاغ.',
      fieldLabel: 'الرسالة الموجهة للشركة',
      destination:
        'هذه الرسالة موجهة للشركة وتظهر لها داخل تفاصيل البلاغ. لا تُستخدم كرسالة عامة للمستخدمين.',
      placeholder: 'مثال: تمت مراجعة الرد والمرفقات واعتماد الإجراء المرسل من الشركة.',
      confirmLabel: scenario === 'started' ? 'تأكيد قبول الرد' : 'تأكيد قبول الحل',
      tone: 'accept',
    },
    'request-completion': {
      title: scenario === 'started' ? 'رفض الرد وطلب المتابعة' : 'رفض الحل وطلب الاستكمال',
      description:
        'اكتب رسالة واحدة واضحة تحدد للشركة ما المطلوب تنفيذه أو استكماله قبل إرسال الرد مرة أخرى.',
      fieldLabel: 'رسالة الاستكمال الموجهة للشركة',
      destination:
        'هذه الرسالة ستصل إلى الشركة الحالية فقط، ولن تظهر لصاحب البلاغ أو المتابعين أو المستخدمين القريبين.',
      placeholder: 'مثال: الصور غير كافية، برجاء استكمال الأعمال وإرفاق صور واضحة بعد التنفيذ.',
      confirmLabel: 'إرسال طلب الاستكمال',
      tone: 'completion',
    },
    'close-cannot-fix': {
      title: 'قبول الاعتذار وإنهاء البلاغ',
      description:
        'اكتب رسالتين منفصلتين: رسالة للشركة التي قدمت الاعتذار، ورسالة عامة للمستخدمين.',
      fieldLabel: 'الرسالة الموجهة للشركة',
      destination:
        'الرسالة الأولى ستصل إلى الشركة التي قدمت الاعتذار، والرسالة الثانية ستظهر لصاحب البلاغ والمتابعين والمستخدمين القريبين عند فتح تفاصيل البلاغ.',
      placeholder: 'مثال: تمت مراجعة طلب التعذر وقبول اعتذار شركتكم، وتم إغلاق البلاغ نهائيًا.',
      userFieldLabel: 'الرسالة الموجهة للمستخدمين',
      userPlaceholder: 'مثال: تعذر تنفيذ البلاغ لأسباب خارجة عن إرادة جهة التنفيذ، وتم إغلاقه نهائيًا.',
      confirmLabel: 'تأكيد قبول الاعتذار',
      tone: 'danger',
    },
    reassign: {
      title: 'تهيئة إعادة الإسناد',
      description:
        'اكتب رسالة واحدة ستصل إلى الشركة الجديدة بعد اختيارها وتعيين البلاغ لها.',
      fieldLabel: 'الرسالة الموجهة للشركة الجديدة',
      destination:
        'ستصل هذه الرسالة إلى الشركة الجديدة بعد تعيينها. لن تُرسل إلى الشركة القديمة أو إلى أي مستخدم، وسيُحذف البلاغ نهائيًا من قائمة وتفاصيل الشركة القديمة بعد نجاح التعيين.',
      placeholder: 'مثال: تم إسناد البلاغ لشركتكم، برجاء مراجعة التفاصيل وبدء التنفيذ في أقرب وقت.',
      confirmLabel: 'تأكيد وفتح اختيار الشركة',
      tone: 'reassign',
    },
    'reject-cannot-fix': {
      title: 'رفض الاعتذار وإعادة البلاغ للشركة',
      description:
        'اكتب رسالة واحدة توضّح للشركة سبب رفض التعذر وما المطلوب منها قبل بدء التنفيذ من جديد.',
      fieldLabel: 'رسالة الأدمن الموجهة للشركة',
      destination:
        'هذه الرسالة ستصل إلى الشركة الحالية فقط. لن تظهر لصاحب البلاغ أو المتابعين أو المستخدمين القريبين.',
      placeholder: 'مثال: سبب التعذر غير كافٍ، يرجى بدء التنفيذ من جديد واستكمال الأعمال المطلوبة.',
      confirmLabel: 'رفض الاعتذار وإعادة البلاغ',
      tone: 'completion',
    },
  };

  return configs[action] || null;
}

function AdminCompanyResponseReviewCard({
  report,
  onAcceptFix,
  onRequestCompletion,
  onAcceptCannotFix,
  onRejectCannotFix,
  onReassign,
}) {
  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  const [previewIndex, setPreviewIndex] = useState(null);
  const [fixedDecisionModal, setFixedDecisionModal] = useState('');
  const [fixedDecisionNote, setFixedDecisionNote] = useState('');
  const [fixedDecisionUserMessage, setFixedDecisionUserMessage] = useState('');
  const [fixedDecisionNoteError, setFixedDecisionNoteError] = useState('');
  const [fixedDecisionUserMessageError, setFixedDecisionUserMessageError] = useState('');

  const response = report.companyResponse;
  const decisionScenario = useMemo(() => getResponseScenario(response), [response]);
  const images = useMemo(() => response?.images?.filter(Boolean) || [], [response?.images]);
  const responseHistory = useMemo(
    () => (Array.isArray(report.companyResponseHistory) ? report.companyResponseHistory : []),
    [report.companyResponseHistory],
  );

  useEffect(() => {
    setPreviewIndex(null);
    setActionError('');
    setFixedDecisionModal('');
    setFixedDecisionNote('');
    setFixedDecisionUserMessage('');
    setFixedDecisionNoteError('');
    setFixedDecisionUserMessageError('');
  }, [report.id, response?.id, images.length]);

  useEffect(() => {
    if (!fixedDecisionModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event) {
      if (event.key === 'Escape' && !isSaving) {
        setFixedDecisionModal('');
        setFixedDecisionNote('');
        setFixedDecisionUserMessage('');
        setFixedDecisionNoteError('');
        setFixedDecisionUserMessageError('');
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [fixedDecisionModal, isSaving]);

  if (!response) {
    const existingDecision = report.adminDecision;
    const existingDecisionType = cleanText(existingDecision?.decisionType)
      .toLowerCase()
      .replace(/[\s_-]+/g, '');
    const isExistingReassignment = existingDecisionType.includes('reassign');
    const isExistingCompletionRequest =
      existingDecisionType.includes('requestcompletion') ||
      existingDecisionType.includes('needscompletion') ||
      existingDecisionType.includes('reject');
    const isExistingCannotFixAcceptance =
      existingDecisionType.includes('acceptcannotfix') ||
      existingDecisionType.includes('cannotfixaccepted');

    return (
      <section
        id="company-response"
        className="admin-report-details-card admin-company-response-card"
      >
        <header className="admin-report-card-header">
          <div>
            <h2>رد الشركة وقرار الأدمن</h2>
            <p>Company Response Review</p>
          </div>

          <span className="admin-company-response-status admin-company-response-status--empty">
            {existingDecision?.decisionLabel || 'لا يوجد رد بعد'}
          </span>
        </header>

        {existingDecision ? (
          <div className="admin-company-response-reviewed">
            <FiCheckCircle />
            <div>
              <strong>{existingDecision.decisionLabel || 'تم تسجيل قرار الأدمن'}</strong>
              {isExistingReassignment ? (
                <p>تم تجهيز إعادة الإسناد، وستصل الرسالة إلى الشركة الجديدة بعد تعيينها، وسيُحذف البلاغ نهائيًا من الشركة القديمة.</p>
              ) : (
                <>
                  {isExistingCompletionRequest ? (
                    <p>
                      <b>الأعمال المطلوب استكمالها:</b>{' '}
                      {cleanText(
                        existingDecision.adminNote ||
                          existingDecision.companyMessage ||
                          existingDecision.completionRequirements,
                      ) || 'لا توجد بيانات للعرض'}
                    </p>
                  ) : (
                    <p>
                      <b>رسالة الأدمن الموجهة للشركة:</b>{' '}
                      {cleanText(
                        existingDecision.adminNote || existingDecision.companyMessage,
                      ) || 'لا توجد بيانات للعرض'}
                    </p>
                  )}

                  {isExistingCannotFixAcceptance ? (
                    <p className="admin-company-response-reviewed__user-message">
                      <b>الرسالة العامة للمستخدمين:</b>{' '}
                      {cleanText(existingDecision.publicUserMessage) || 'لا توجد بيانات للعرض'}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="admin-company-response-empty">
            <FiClock />
            <p>لم ترسل الشركة أي تحديث على هذا البلاغ حتى الآن.</p>
          </div>
        )}
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
  const adminDecision = report.adminDecision || {};
  const reviewedAdminNote = cleanText(
    response.adminNote ||
      adminDecision.adminNote ||
      adminDecision.companyMessage ||
      response.completionRequirements ||
      adminDecision.completionRequirements,
  );
  const reviewedPublicUserMessage = cleanText(
    adminDecision.publicUserMessage || response.userMessage,
  );
  const reviewedDecisionType = cleanText(
    adminDecision.decisionType || response.decision || response.reviewStatus,
  )
    .toLowerCase()
    .replace(/[\s_-]+/g, '');


  function openFixedDecisionModal(action) {
    setFixedDecisionModal(action);
    setFixedDecisionNote('');
    setFixedDecisionUserMessage('');
    setFixedDecisionNoteError('');
    setFixedDecisionUserMessageError('');
    setActionError('');
  }

  function closeFixedDecisionModal() {
    if (isSaving) return;

    setFixedDecisionModal('');
    setFixedDecisionNote('');
    setFixedDecisionUserMessage('');
    setFixedDecisionNoteError('');
    setFixedDecisionUserMessageError('');
  }

  async function confirmFixedDecision() {
    const trimmedNote = fixedDecisionNote.trim();
    const trimmedUserMessage = fixedDecisionUserMessage.trim();
    const requiresUserMessage = fixedDecisionModal === 'close-cannot-fix';

    if (!trimmedNote) {
      setFixedDecisionNoteError(
        decisionModalConfig?.fieldLabel
          ? `اكتب ${decisionModalConfig.fieldLabel} قبل تنفيذ القرار.`
          : 'اكتب الرسالة أو الملاحظة المطلوبة قبل تنفيذ القرار.',
      );
      return;
    }

    if (trimmedNote.length > 1000) {
      setFixedDecisionNoteError('يجب ألا تتجاوز الملاحظة 1000 حرف.');
      return;
    }

    if (requiresUserMessage && !trimmedUserMessage) {
      setFixedDecisionUserMessageError(
        'اكتب الرسالة العامة الموجهة للمستخدمين قبل قبول الاعتذار.',
      );
      return;
    }

    if (requiresUserMessage && trimmedUserMessage.length > 1000) {
      setFixedDecisionUserMessageError('يجب ألا تتجاوز رسالة المستخدمين 1000 حرف.');
      return;
    }

    const wasSuccessful = await handleDecision(
      fixedDecisionModal,
      trimmedNote,
      trimmedUserMessage,
    );

    if (wasSuccessful) {
      closeFixedDecisionModal();
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

  async function handleDecision(action, modalMessage = '', modalUserMessage = '') {
    const trimmedMessage = modalMessage.trim();
    const trimmedPublicMessage = modalUserMessage.trim();

    if (!trimmedMessage) {
      setFixedDecisionNoteError('اكتب الرسالة أو الملاحظة المطلوبة قبل تنفيذ القرار.');
      return false;
    }

    if (trimmedMessage.length > 1000) {
      setFixedDecisionNoteError('يجب ألا تتجاوز الرسالة 1000 حرف.');
      return false;
    }

    const isAcceptedCannotFix = action === 'close-cannot-fix';

    if (isAcceptedCannotFix && !trimmedPublicMessage) {
      setFixedDecisionUserMessageError(
        'اكتب الرسالة العامة الموجهة للمستخدمين قبل قبول الاعتذار.',
      );
      return false;
    }

    if (isAcceptedCannotFix && trimmedPublicMessage.length > 1000) {
      setFixedDecisionUserMessageError('يجب ألا تتجاوز رسالة المستخدمين 1000 حرف.');
      return false;
    }

    const payload = {
      adminNote: trimmedMessage,
      companyMessage: trimmedMessage,
      userMessage: isAcceptedCannotFix ? trimmedPublicMessage : undefined,
      publicUserMessage: isAcceptedCannotFix ? trimmedPublicMessage : undefined,
      submissionId: response.submissionId || response.id,
      companyResponseId: response.id || response.submissionId,
      responseType: response.responseType,
    };

    setIsSaving(true);
    setActiveAction(action);
    setFixedDecisionNoteError('');
    setFixedDecisionUserMessageError('');
    setActionError('');

    try {
      if (action === 'accept-fix') {
        await onAcceptFix?.({
          ...payload,
          decision: 'AcceptFix',
        });
      }

      if (action === 'request-completion') {
        await onRequestCompletion?.({
          ...payload,
          decision: 'RequestCompletion',
        });
      }

      if (action === 'close-cannot-fix') {
        await onAcceptCannotFix?.({
          ...payload,
          decision: 'accept_cannot_fix',
        });
      }

      if (action === 'reject-cannot-fix') {
        await onRejectCannotFix?.({
          ...payload,
          decision: 'reject_and_continue',
          userMessage: undefined,
          publicUserMessage: undefined,
        });
      }

      if (action === 'reassign') {
        await onReassign?.({
          ...payload,
          decision: 'reassign',
          userMessage: undefined,
          publicUserMessage: undefined,
        });
      }

      return true;
    } catch (error) {
      const backendMessage = String(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          '',
      ).trim();

      setActionError(
        backendMessage || 'تعذر تنفيذ قرار الأدمن. راجع البيانات وحاول مرة أخرى.',
      );
      return false;
    } finally {
      setIsSaving(false);
      setActiveAction('');
    }
  }

  const decisionModalConfig = getDecisionModalConfig(
    fixedDecisionModal,
    decisionScenario,
  );

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

      {decisionScenario === 'general' && cannotFixReason ? (
        <div className="admin-company-response-warning">
          <FiAlertCircle />
          <div>
            <strong>توضيح إضافي من الشركة</strong>
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
                  : decisionScenario === 'fixed'
                    ? 'اختر قبول الحل أو طلب الاستكمال، ثم اكتب الملاحظة المطلوبة داخل نافذة التأكيد.'
                    : 'اختر القرار المناسب، واكتب سببًا واضحًا عند طلب الاستكمال.'}
              </p>
            </div>
          </div>

          <div className="admin-company-response-modal-guidance">
            <FiInfo />
            <p>
              اضغط على القرار المناسب، وسيظهر نموذج واحد فقط يوضّح لك أين ستذهب
              الرسالة ومن سيستطيع رؤيتها قبل الإرسال.
            </p>
          </div>

          <div className="admin-company-response-actions">
            {decisionScenario === 'fixed' ? (
              <>
                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--accept"
                  onClick={() => openFixedDecisionModal('accept-fix')}
                  disabled={isSaving}
                >
                  <FiCheckCircle />
                  {activeAction === 'accept-fix' ? 'جاري قبول الحل...' : 'قبول الحل وإغلاق البلاغ'}
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--complete"
                  onClick={() => openFixedDecisionModal('request-completion')}
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
                  onClick={() => openFixedDecisionModal('close-cannot-fix')}
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
                  onClick={() => openFixedDecisionModal('reassign')}
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
                  onClick={() => openFixedDecisionModal('reject-cannot-fix')}
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
                  onClick={() => openFixedDecisionModal('accept-fix')}
                  disabled={isSaving}
                >
                  <FiCheckCircle />
                  {activeAction === 'accept-fix' ? 'جاري القبول...' : 'قبول رد الشركة'}
                </button>

                <button
                  type="button"
                  className="admin-company-response-btn admin-company-response-btn--complete"
                  onClick={() => openFixedDecisionModal('request-completion')}
                  disabled={isSaving}
                >
                  <FiSend />
                  {activeAction === 'request-completion' ? 'جاري إرسال السبب...' : 'رفض الرد وطلب متابعة'}
                </button>
              </>
            ) : null}
          </div>

          {actionError && !fixedDecisionModal ? (
            <div className="admin-company-response-note-error admin-company-response-action-error" role="alert">
              <FiAlertCircle />
              <span>{actionError}</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="admin-company-response-reviewed">
          <FiCheckCircle />
          <div>
            <strong>
              {adminDecision.decisionLabel || response.reviewLabel || 'تمت مراجعة رد الشركة'}
            </strong>

            {reviewedDecisionType.includes('reassign') ? (
              <p>تم تجهيز إعادة الإسناد، وستصل الرسالة إلى الشركة الجديدة بعد تعيينها، وسيُحذف البلاغ نهائيًا من الشركة القديمة.</p>
            ) : (
              <>
                {reviewedDecisionType.includes('requestcompletion') ||
                reviewedDecisionType.includes('needscompletion') ||
                reviewedDecisionType.includes('reject') ? (
                  <p>
                    <b>الأعمال المطلوب استكمالها:</b>{' '}
                    {reviewedAdminNote || 'لا توجد بيانات للعرض'}
                  </p>
                ) : (
                  <p>
                    <b>رسالة الأدمن الموجهة للشركة:</b>{' '}
                    {reviewedAdminNote || 'لا توجد بيانات للعرض'}
                  </p>
                )}

                {reviewedDecisionType.includes('acceptcannotfix') ||
                reviewedDecisionType.includes('cannotfixaccepted') ? (
                  <p className="admin-company-response-reviewed__user-message">
                    <b>الرسالة العامة للمستخدمين:</b>{' '}
                    {reviewedPublicUserMessage || 'لا توجد بيانات للعرض'}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}

      {fixedDecisionModal && decisionModalConfig ? (
        <div
          className="admin-company-decision-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-company-decision-modal-title"
        >
          <button
            type="button"
            className="admin-company-decision-modal-backdrop__dismiss"
            onClick={closeFixedDecisionModal}
            aria-label="إغلاق النافذة"
            disabled={isSaving}
          />

          <form
            className={`admin-company-decision-modal is-${decisionModalConfig.tone}`}
            onSubmit={(event) => {
              event.preventDefault();
              confirmFixedDecision();
            }}
          >
            <header className="admin-company-decision-modal__header">
              <span className="admin-company-decision-modal__icon" aria-hidden="true">
                {fixedDecisionModal === 'accept-fix' ? (
                  <FiCheckCircle />
                ) : fixedDecisionModal === 'close-cannot-fix' ? (
                  <FiXCircle />
                ) : fixedDecisionModal === 'reassign' ? (
                  <FiRefreshCw />
                ) : (
                  <FiSend />
                )}
              </span>

              <div>
                <h3 id="admin-company-decision-modal-title">
                  {decisionModalConfig.title}
                </h3>
                <p>{decisionModalConfig.description}</p>
              </div>

              <button
                type="button"
                className="admin-company-decision-modal__close"
                onClick={closeFixedDecisionModal}
                aria-label="إغلاق"
                disabled={isSaving}
              >
                <FiX />
              </button>
            </header>

            <div className="admin-company-decision-modal__destination">
              <FiInfo />
              <div>
                <strong>مكان ظهور الرسالة</strong>
                <p>{decisionModalConfig.destination}</p>
              </div>
            </div>

            <label className="admin-company-decision-modal__field">
              <span className="admin-company-decision-modal__field-title">
                {decisionModalConfig.fieldLabel}
              </span>

              {fixedDecisionModal === 'close-cannot-fix' ? (
                <small className="admin-company-decision-modal__field-hint">
                  ستصل هذه الرسالة إلى الشركة التي قدمت طلب التعذر.
                </small>
              ) : null}

              <textarea
                autoFocus
                value={fixedDecisionNote}
                onChange={(event) => {
                  setFixedDecisionNote(event.target.value.slice(0, 1000));
                  if (fixedDecisionNoteError) setFixedDecisionNoteError('');
                  if (actionError) setActionError('');
                }}
                rows={5}
                maxLength={1000}
                className={fixedDecisionNoteError ? 'is-invalid' : ''}
                placeholder={decisionModalConfig.placeholder}
              />

              <span className="admin-company-decision-modal__counter">
                {fixedDecisionNote.length} / 1000
              </span>
            </label>

            {fixedDecisionModal === 'close-cannot-fix' ? (
              <label className="admin-company-decision-modal__field admin-company-decision-modal__field--user-message">
                <span className="admin-company-decision-modal__field-title">
                  {decisionModalConfig.userFieldLabel}
                </span>

                <small className="admin-company-decision-modal__field-hint">
                  ستظهر هذه الرسالة لصاحب البلاغ والمتابعين والمستخدمين القريبين عند فتح تفاصيل البلاغ.
                </small>

                <textarea
                  value={fixedDecisionUserMessage}
                  onChange={(event) => {
                    setFixedDecisionUserMessage(event.target.value.slice(0, 1000));
                    if (fixedDecisionUserMessageError) {
                      setFixedDecisionUserMessageError('');
                    }
                    if (actionError) setActionError('');
                  }}
                  rows={5}
                  maxLength={1000}
                  className={fixedDecisionUserMessageError ? 'is-invalid' : ''}
                  placeholder={decisionModalConfig.userPlaceholder}
                />

                <span className="admin-company-decision-modal__counter">
                  {fixedDecisionUserMessage.length} / 1000
                </span>
              </label>
            ) : null}

            {fixedDecisionNoteError ? (
              <div className="admin-company-decision-modal__error" role="alert">
                <FiAlertCircle />
                <span>{fixedDecisionNoteError}</span>
              </div>
            ) : null}

            {fixedDecisionUserMessageError ? (
              <div className="admin-company-decision-modal__error" role="alert">
                <FiAlertCircle />
                <span>{fixedDecisionUserMessageError}</span>
              </div>
            ) : null}

            {actionError ? (
              <div className="admin-company-decision-modal__error" role="alert">
                <FiAlertCircle />
                <span>{actionError}</span>
              </div>
            ) : null}

            <footer className="admin-company-decision-modal__actions">
              <button
                type="button"
                className="admin-company-decision-modal__cancel"
                onClick={closeFixedDecisionModal}
                disabled={isSaving}
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="admin-company-decision-modal__confirm"
                disabled={isSaving}
              >
                {fixedDecisionModal === 'accept-fix' ? (
                  <FiCheckCircle />
                ) : fixedDecisionModal === 'close-cannot-fix' ? (
                  <FiXCircle />
                ) : fixedDecisionModal === 'reassign' ? (
                  <FiRefreshCw />
                ) : (
                  <FiSend />
                )}
                {isSaving ? 'جاري الإرسال...' : decisionModalConfig.confirmLabel}
              </button>
            </footer>
          </form>
        </div>
      ) : null}

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
