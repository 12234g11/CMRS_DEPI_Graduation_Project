const EGYPT_TIME_ZONE = 'Africa/Cairo';

const egyptDateTimeFormatter = new Intl.DateTimeFormat('ar-EG', {
  timeZone: EGYPT_TIME_ZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const egyptDateFormatter = new Intl.DateTimeFormat('ar-EG', {
  timeZone: EGYPT_TIME_ZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function isIsoLikeDate(value) {
  if (typeof value !== 'string') return false;

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value.trim());
}

export function formatEgyptDateTime(value, fallback = 'غير متوفر') {
  if (!value) return fallback;

  if (value instanceof Date && isValidDate(value)) {
    return egyptDateTimeFormatter.format(value);
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return fallback;
  }

  // Only convert timestamps that contain a real machine-readable datetime.
  // Legacy formatted strings are displayed as received because they do not
  // contain enough timezone information for a safe conversion.
  if (typeof value === 'string' && !isIsoLikeDate(value)) {
    return value;
  }

  const parsedDate = new Date(value);
  return isValidDate(parsedDate)
    ? egyptDateTimeFormatter.format(parsedDate)
    : String(value);
}

export function formatEgyptDate(value, fallback = 'غير متوفر') {
  if (!value) return fallback;

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [year, month, day] = value.split('-').map(Number);
    const safeDate = new Date(Date.UTC(year, month - 1, day, 12));
    return egyptDateFormatter.format(safeDate);
  }

  if (typeof value === 'string' && !isIsoLikeDate(value)) {
    return value;
  }

  const parsedDate = value instanceof Date ? value : new Date(value);
  return isValidDate(parsedDate)
    ? egyptDateFormatter.format(parsedDate)
    : String(value);
}

export function getAdminReviewPresentation(adminReview, companyResponse = null) {
  const status = adminReview?.status;
  const responseType =
    companyResponse?.responseType ||
    companyResponse?.status ||
    '';
  const companyMessage =
    adminReview?.companyMessage || adminReview?.note || 'لا توجد بيانات للعرض';
  const completionRequirements =
    adminReview?.completionRequirements || 'لا توجد بيانات للعرض';

  if (status === 'accepted') {
    return {
      tone: 'accepted',
      title: adminReview.label || 'تم قبول الحل من الأدمن',
      description: companyMessage,
      completionRequirements: '',
      showCompletionRequirements: false,
    };
  }

  if (status === 'cannot_fix_accepted') {
    return {
      tone: 'accepted',
      title: adminReview.label || 'تم قبول طلب تعذر التنفيذ',
      description: companyMessage,
      completionRequirements: '',
      showCompletionRequirements: false,
    };
  }

  if (status === 'reassigned') {
    return {
      tone: 'reassigned',
      title: adminReview.label || 'لم يعد البلاغ مسندًا لهذه الشركة',
      description: 'تم نقل البلاغ إلى شركة أخرى، ولا توجد إجراءات متاحة على هذا البلاغ.',
      completionRequirements: '',
      showCompletionRequirements: false,
    };
  }

  if (status === 'needs_completion' || status === 'cannot_fix_rejected') {
    const isCannotFixReview =
      responseType === 'cannot_fix' ||
      responseType === 'cannot-fix';

    return {
      tone: 'needs-completion',
      title:
        adminReview.label ||
        (isCannotFixReview
          ? 'تم رفض طلب التعذر ومطلوب استكمال التنفيذ'
          : 'الأدمن طلب استكمال الحل'),
      description: companyMessage,
      completionRequirements,
      showCompletionRequirements: true,
    };
  }

  if (status === 'rejected') {
    return {
      tone: 'rejected',
      title: adminReview.label || 'لم يعتمد الأدمن الرد',
      description: companyMessage,
      completionRequirements,
      showCompletionRequirements: true,
    };
  }

  return {
    tone: 'pending',
    title: adminReview?.label || 'بانتظار مراجعة الأدمن',
    description: companyMessage,
    completionRequirements: '',
    showCompletionRequirements: false,
  };
}

export function getWorkflowStep(report) {
  if (!report) return 0;

  if (
    ['تم الحل', 'متعذر التنفيذ'].includes(report.status) ||
    ['accepted', 'cannot_fix_accepted', 'reassigned'].includes(
      report.adminReview?.status,
    )
  ) {
    return 4;
  }

  if (report.status === 'مطلوب استكمال') {
    return 2;
  }

  if (report.status === 'بانتظار مراجعة الأدمن') {
    return 3;
  }

  if (report.status === 'جاري التنفيذ') {
    return 2;
  }

  return 1;
}
