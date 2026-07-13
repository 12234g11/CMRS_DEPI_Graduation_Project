const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASEURL ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://balaghasp.runasp.net'
).replace(/\/$/, '');

const COMPANY_REPORT_STATUS_OPTIONS_FALLBACK = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'تم التعيين', label: 'تم التعيين' },
  { value: 'جاري التنفيذ', label: 'جاري التنفيذ' },
  { value: 'بانتظار مراجعة الأدمن', label: 'بانتظار مراجعة الأدمن' },
  { value: 'مطلوب استكمال', label: 'مطلوب استكمال' },
  { value: 'متعذر التنفيذ', label: 'متعذر التنفيذ' },
  { value: 'تم الحل', label: 'تم الحل' },
];

const COMPANY_REPORT_PRIORITY_OPTIONS_FALLBACK = [
  { value: 'all', label: 'كل الأولويات' },
  { value: 'عالية', label: 'عالية' },
  { value: 'متوسطة', label: 'متوسطة' },
  { value: 'منخفضة', label: 'منخفضة' },
];

const STATUS_MAP = {
  assigned: { label: 'تم التعيين', tone: 'info' },
  accepted: { label: 'تم التعيين', tone: 'info' },
  reportaccepted: { label: 'تم التعيين', tone: 'info' },
  inprogress: { label: 'جاري التنفيذ', tone: 'info' },
  started: { label: 'جاري التنفيذ', tone: 'info' },
  pendingadminapproval: { label: 'بانتظار مراجعة الأدمن', tone: 'warning' },
  pendingadminreview: { label: 'بانتظار مراجعة الأدمن', tone: 'warning' },
  pendingapproval: { label: 'بانتظار مراجعة الأدمن', tone: 'warning' },
  needscompletion: { label: 'مطلوب استكمال', tone: 'warning' },
  needcompletion: { label: 'مطلوب استكمال', tone: 'warning' },
  rejected: { label: 'مطلوب استكمال', tone: 'warning' },
  cannotfix: { label: 'متعذر التنفيذ', tone: 'danger' },
  cannotfixaccepted: { label: 'متعذر التنفيذ', tone: 'danger' },
  unabletoexecute: { label: 'متعذر التنفيذ', tone: 'danger' },
  resolved: { label: 'تم الحل', tone: 'success' },
  completed: { label: 'تم الحل', tone: 'success' },
  closed: { label: 'تم الحل', tone: 'success' },
};

const PRIORITY_MAP = {
  high: { label: 'عالية', tone: 'danger' },
  urgent: { label: 'عالية', tone: 'danger' },
  medium: { label: 'متوسطة', tone: 'warning' },
  normal: { label: 'متوسطة', tone: 'warning' },
  low: { label: 'منخفضة', tone: 'success' },
};

function compactKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function readStorageValue(key) {
  try {
    return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function extractTokenFromObject(value) {
  if (!value || typeof value !== 'object') return '';

  return (
    value.token ||
    value.accessToken ||
    value.jwt ||
    value.jwtToken ||
    value.userToken ||
    value.authToken ||
    value?.data?.token ||
    value?.data?.accessToken ||
    value?.user?.token ||
    value?.user?.accessToken ||
    ''
  );
}

function normalizeStoredToken(token) {
  if (!token || typeof token !== 'string') return '';

  let normalizedToken = token.trim();

  try {
    const parsedToken = JSON.parse(normalizedToken);
    if (typeof parsedToken === 'string') {
      normalizedToken = parsedToken.trim();
    }
  } catch {
    // The token is already a plain string.
  }

  return normalizedToken.replace(/^Bearer\s+/i, '').trim();
}

function getAuthToken() {
  const directTokenKeys = [
    'access_token',
    'pms_token',
    'token',
    'accessToken',
    'authToken',
    'jwt',
    'jwtToken',
    'userToken',
    'cmrs_token',
  ];

  for (const key of directTokenKeys) {
    const token = normalizeStoredToken(readStorageValue(key));
    if (token) return token;
  }

  const userObjectKeys = [
    'current_user',
    'currentUser',
    'authUser',
    'user',
    'pms_user',
    'loggedInUser',
  ];

  for (const key of userObjectKeys) {
    const rawValue = readStorageValue(key);
    if (!rawValue) continue;

    try {
      const parsedValue = JSON.parse(rawValue);
      const token = normalizeStoredToken(extractTokenFromObject(parsedValue));
      if (token) return token;
    } catch {
      // Ignore invalid JSON values and continue checking storage keys.
    }
  }

  return '';
}

function buildUrl(path, queryParams = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    url.searchParams.set(key, value);
  });

  return url.toString();
}

function normalizeApiResponse(responseBody) {
  if (
    responseBody &&
    typeof responseBody === 'object' &&
    Object.prototype.hasOwnProperty.call(responseBody, 'success') &&
    Object.prototype.hasOwnProperty.call(responseBody, 'data')
  ) {
    return responseBody.data;
  }

  return responseBody;
}

function normalizeImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return imageUrl;

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('blob:') ||
    imageUrl.startsWith('data:')
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

function normalizeImages(images) {
  if (Array.isArray(images)) {
    return images
      .map((image) => {
        if (typeof image === 'string') return image;
        return image?.imageUrl || image?.thumbnailUrl || image?.url || image?.fullImageUrl || '';
      })
      .filter(Boolean)
      .map(normalizeImageUrl);
  }

  if (typeof images === 'string' && images.trim()) {
    return images
      .split(',')
      .map((image) => image.trim())
      .filter(Boolean)
      .map(normalizeImageUrl);
  }

  return [];
}

function cleanApiText(value) {
  const text = String(value ?? '').trim();
  if (!text || ['null', 'undefined', 'string'].includes(text.toLowerCase())) return '';
  return text;
}

function inferCompanyResponseType(companyResponse = {}, report = {}) {
  const explicitType = cleanApiText(
    companyResponse.type ||
      companyResponse.responseType ||
      companyResponse.companyResponseType ||
      companyResponse.submissionType ||
      report.pendingReviewType ||
      report.companyResponseType,
  );

  const searchableValue = compactKey(
    `${explicitType} ${companyResponse.status || ''} ${companyResponse.statusLabel || ''}`,
  );

  if (
    cleanApiText(companyResponse.reason) ||
    searchableValue.includes('cannotfix') ||
    searchableValue.includes('unabletoexecute') ||
    searchableValue.includes('تعذر') ||
    searchableValue.includes('اعتذار')
  ) {
    return 'cannot_fix';
  }

  if (
    searchableValue.includes('fixed') ||
    searchableValue.includes('solution') ||
    searchableValue.includes('resolved') ||
    searchableValue.includes('تمالإصلاح')
  ) {
    return 'fixed';
  }

  if (
    searchableValue.includes('started') ||
    searchableValue.includes('inprogress') ||
    searchableValue.includes('بدءالتنفيذ')
  ) {
    return 'started';
  }

  return explicitType || '';
}

function normalizeStatus(report) {
  const rawStatus =
    report.companyStatus ||
    report.assignmentStatus ||
    report.statusLabel ||
    report.status ||
    '';

  const arabicStatuses = [
    'تم التعيين',
    'جاري التنفيذ',
    'بانتظار مراجعة الأدمن',
    'مطلوب استكمال',
    'متعذر التنفيذ',
    'تم الحل',
  ];

  if (arabicStatuses.includes(rawStatus)) {
    const tone =
      report.statusTone ||
      (rawStatus === 'تم الحل'
        ? 'success'
        : rawStatus === 'متعذر التنفيذ'
          ? 'danger'
          : rawStatus === 'بانتظار مراجعة الأدمن' || rawStatus === 'مطلوب استكمال'
            ? 'warning'
            : 'info');

    return { label: rawStatus, tone };
  }

  const mapped = STATUS_MAP[compactKey(rawStatus)];
  return mapped || {
    label: rawStatus || 'تم التعيين',
    tone: report.statusTone || 'info',
  };
}

function normalizePriority(report) {
  const rawPriority = report.priorityLabel || report.priority || '';
  const arabicPriorities = ['عالية', 'متوسطة', 'منخفضة'];

  if (arabicPriorities.includes(rawPriority)) {
    return {
      label: rawPriority,
      tone:
        report.priorityTone ||
        (rawPriority === 'عالية'
          ? 'danger'
          : rawPriority === 'متوسطة'
            ? 'warning'
            : 'success'),
    };
  }

  const mapped = PRIORITY_MAP[compactKey(rawPriority)];
  return mapped || {
    label: rawPriority || 'متوسطة',
    tone: report.priorityTone || 'warning',
  };
}

function normalizeAdminReview(adminReview, companyResponse = null) {
  const reviewSource =
    adminReview ||
    companyResponse?.adminReview ||
    companyResponse?.AdminReview ||
    (companyResponse
      ? {
          status: companyResponse.reviewStatus,
          label: companyResponse.reviewLabel,
          companyMessage: companyResponse.adminNote || companyResponse.reviewNote,
          completionRequirements: companyResponse.completionRequirements,
          reviewedAt: companyResponse.reviewedAt,
          decisionType: companyResponse.decisionType || companyResponse.decision,
          isFinal: companyResponse.isFinal,
        }
      : null);

  if (!reviewSource) return null;

  const decisionType = cleanApiText(
    reviewSource.decisionType ||
      reviewSource.DecisionType ||
      reviewSource.decision ||
      reviewSource.Decision ||
      reviewSource.status ||
      reviewSource.Status ||
      reviewSource.reviewStatus ||
      reviewSource.ReviewStatus,
  );
  const normalizedStatus = compactKey(
    reviewSource.status || reviewSource.reviewStatus || decisionType,
  );

  const statusAliases = {
    accepted: 'accepted',
    approved: 'accepted',
    acceptfix: 'accepted',
    solutionaccepted: 'accepted',
    cannotfixaccepted: 'cannot_fix_accepted',
    cannotfixapproved: 'cannot_fix_accepted',
    acceptedcannotfix: 'cannot_fix_accepted',
    acceptcannotfix: 'cannot_fix_accepted',
    needcompletion: 'needs_completion',
    needscompletion: 'needs_completion',
    requestcompletion: 'needs_completion',
    rejectandcontinue: 'needs_completion',
    rejectcannotfix: 'needs_completion',
    cannotfixrejected: 'needs_completion',
    rejectedcannotfix: 'needs_completion',
    rejected: 'rejected',
    reassigned: 'reassigned',
    reassign: 'reassigned',
    reassignmentrequested: 'reassigned',
    pending: 'pending',
    pendingreview: 'pending',
  };

  const companyMessage = cleanApiText(
    reviewSource.companyMessage ||
      reviewSource.CompanyMessage ||
      reviewSource.messageToCompany ||
      reviewSource.MessageToCompany ||
      reviewSource.note ||
      reviewSource.Note ||
      reviewSource.adminNote ||
      reviewSource.AdminNote ||
      reviewSource.reviewNote ||
      reviewSource.ReviewNote,
  );

  return {
    ...reviewSource,
    status: statusAliases[normalizedStatus] || reviewSource.status || 'pending',
    decisionType,
    label: cleanApiText(
      reviewSource.label ||
        reviewSource.Label ||
        reviewSource.reviewLabel ||
        reviewSource.ReviewLabel ||
        reviewSource.decisionLabel ||
        reviewSource.DecisionLabel,
    ),
    companyMessage,
    note: companyMessage,
    completionRequirements: cleanApiText(
      reviewSource.completionRequirements ||
        reviewSource.CompletionRequirements ||
        reviewSource.requiredCompletion ||
        reviewSource.RequiredCompletion ||
        reviewSource.requirements ||
        reviewSource.Requirements,
    ),
    reviewedAt:
      reviewSource.reviewedAt ||
      reviewSource.ReviewedAt ||
      reviewSource.decidedAt ||
      reviewSource.DecidedAt ||
      null,
    isFinal: Boolean(reviewSource.isFinal ?? reviewSource.IsFinal ?? false),
  };
}

function normalizeCompanyResponse(companyResponse, report = {}) {
  if (!companyResponse) return null;

  const responseType = inferCompanyResponseType(companyResponse, report);
  const normalizedStatus = compactKey(responseType || companyResponse.status);
  const statusAliases = {
    started: 'started',
    fixed: 'fixed',
    solution: 'fixed',
    cannotfix: 'cannot_fix',
    unabletoexecute: 'cannot_fix',
  };

  return {
    ...companyResponse,
    id: companyResponse.id || companyResponse.submissionId || companyResponse.responseId,
    responseType,
    status: statusAliases[normalizedStatus] || responseType || companyResponse.status,
    statusLabel:
      cleanApiText(companyResponse.typeLabel || companyResponse.responseTypeLabel) ||
      (responseType === 'cannot_fix'
        ? 'طلب تعذر تنفيذ'
        : responseType === 'fixed'
          ? 'حل وإثبات تنفيذ'
          : responseType === 'started'
            ? 'بدء التنفيذ'
            : cleanApiText(companyResponse.statusLabel)),
    reason: cleanApiText(
      companyResponse.reason ||
        companyResponse.cannotFixReason ||
        companyResponse.failureReason,
    ),
    note: cleanApiText(
      companyResponse.note ||
        companyResponse.companyNote ||
        companyResponse.details ||
        companyResponse.description,
    ),
    adminNote: cleanApiText(companyResponse.adminNote || companyResponse.reviewNote),
    userMessage: cleanApiText(
      companyResponse.userMessage ||
        companyResponse.publicMessage ||
        companyResponse.messageToUser,
    ),
    reviewStatus: cleanApiText(companyResponse.reviewStatus),
    reviewLabel: cleanApiText(companyResponse.reviewLabel),
    images: normalizeImages(
      companyResponse.images ||
        companyResponse.attachments ||
        companyResponse.proofImages,
    ),
  };
}


function normalizeTeam(team) {
  if (!team) return null;

  const getFirstDefinedValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== '');

  const parseBooleanValue = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;

    const normalizedValue = compactKey(value);
    if (['true', '1', 'yes', 'active', 'enabled'].includes(normalizedValue)) return true;
    if (['false', '0', 'no', 'inactive', 'disabled'].includes(normalizedValue)) return false;
    return null;
  };

  const rawStatus = getFirstDefinedValue(
    team.status,
    team.teamStatus,
    team.activationStatus,
    team.accountStatus,
  );
  const normalizedStatus = compactKey(
    `${rawStatus || ''} ${team.availability || team.availabilityStatus || team.workStatus || ''}`,
  );
  const explicitEnabled = parseBooleanValue(
    getFirstDefinedValue(team.isEnabled, team.enabled, team.isActive, team.active),
  );
  const hasDisabledStatus = [
    'disabled',
    'inactive',
    'deactivated',
    'suspended',
    'offline',
    'غيرمفعل',
    'معطل',
    'موقوف',
  ].some((status) => normalizedStatus.includes(status));
  const isEnabled = hasDisabledStatus ? false : explicitEnabled ?? true;

  const activeTasks = Number(
    getFirstDefinedValue(team.activeTasks, team.activeReportsCount, team.currentTasks, 0),
  );
  const maxCapacity = Number(
    getFirstDefinedValue(team.maxCapacity, team.capacity, team.maximumCapacity, 5),
  );
  const hasCapacityValues = Number.isFinite(activeTasks) && Number.isFinite(maxCapacity);
  const isAtCapacity = hasCapacityValues && maxCapacity > 0 && activeTasks >= maxCapacity;

  const rawAvailability = getFirstDefinedValue(
    team.availability,
    team.availabilityStatus,
    team.workStatus,
  );
  const normalizedAvailability = compactKey(rawAvailability);
  const unavailableByAvailability = [
    'unavailable',
    'offline',
    'disabled',
    'inactive',
  ].includes(normalizedAvailability);
  const busyByAvailability = normalizedAvailability === 'busy';
  const canAssign = isEnabled && !isAtCapacity && !unavailableByAvailability && !busyByAvailability;

  const availability = !isEnabled
    ? 'Offline'
    : isAtCapacity || busyByAvailability
      ? 'Busy'
      : rawAvailability || 'Available';

  const availabilityLabel = !isEnabled
    ? 'غير مفعّل'
    : isAtCapacity || busyByAvailability
      ? 'مشغول'
      : team.availabilityLabel || (compactKey(availability) === 'available' ? 'متاح' : availability);

  const unavailableReason = !isEnabled
    ? 'لا يمكن تعيين البلاغ إلى فريق غير مفعّل.'
    : isAtCapacity || busyByAvailability
      ? `وصل الفريق إلى الحد الأقصى للبلاغات النشطة${hasCapacityValues ? ` (${activeTasks}/${maxCapacity})` : ''}.`
      : unavailableByAvailability
        ? 'الفريق غير متاح للتعيين حاليًا.'
        : '';

  return {
    ...team,
    id: team.id || team.teamId || team.technicianId,
    name: team.name || team.teamName || 'فرقة صيانة',
    leadName: team.leadName || team.teamLeader || team.managerName || '',
    phone: team.phone || team.phoneNumber || '',
    status: rawStatus || (isEnabled ? 'Active' : 'Disabled'),
    isEnabled,
    activeTasks: Number.isFinite(activeTasks) ? activeTasks : 0,
    maxCapacity: Number.isFinite(maxCapacity) ? maxCapacity : 5,
    availability,
    availabilityLabel,
    canAssign,
    unavailableReason,
  };
}

function normalizeReport(report) {
  if (!report) return null;

  const { rating: _rating, votesCount: _votesCount, ...reportData } = report;
  const reportId = report.id || report.reportId;
  const status = normalizeStatus(report);
  const priority = normalizePriority(report);

  const originalImages = normalizeImages(report.images);

  const rawPosition = report.position || {};
  const position = {
    lat: rawPosition.lat ?? rawPosition.latitude ?? report.latitude ?? report.lat,
    lng:
      rawPosition.lng ??
      rawPosition.lon ??
      rawPosition.longitude ??
      report.longitude ??
      report.lng ??
      report.lon,
  };

  const companyResponse = normalizeCompanyResponse(
    report.companyResponse ||
      report.latestCompanyResponse ||
      (Array.isArray(report.companySubmissions) ? report.companySubmissions.at(-1) : null) ||
      (Array.isArray(report.companyResponseHistory) ? report.companyResponseHistory.at(-1) : null),
    report,
  );

  const companySubmissionsSource =
    report.companySubmissions ||
    report.companyResponseHistory ||
    report.companyResponses ||
    [];

  return {
    ...reportData,
    id: reportId,
    position,
    status: status.label,
    statusTone: status.tone,
    priority: priority.label,
    priorityTone: priority.tone,
    reporter: report.reporter || null,
    assignedTeam: normalizeTeam(report.assignedTeam || report.team),
    companyResponse,
    companySubmissions: Array.isArray(companySubmissionsSource)
      ? companySubmissionsSource.map((submission) =>
          normalizeCompanyResponse(submission, report),
        )
      : [],
    adminReview: normalizeAdminReview(
      report.adminReview || report.AdminReview || report.adminDecision || report.AdminDecision,
      companyResponse,
    ),
    pendingReviewType:
      cleanApiText(report.pendingReviewType) ||
      companyResponse?.responseType ||
      '',
    assignmentHistory: Array.isArray(report.assignmentHistory)
      ? report.assignmentHistory
      : [],
    userMessage: '',
    timeline: Array.isArray(report.timeline) ? report.timeline : [],
    images: originalImages,
  };
}

function normalizePagination(pagination = {}) {
  return {
    page: Number(pagination.page || 1),
    pageSize: Number(pagination.pageSize || 10),
    totalItems: Number(pagination.totalItems || pagination.totalCount || 0),
    totalPages: Number(pagination.totalPages || 1),
  };
}

function normalizeReportsList(data) {
  const items = Array.isArray(data) ? data : data?.items || [];
  const normalizedItems = items.map(normalizeReport);

  return {
    items: normalizedItems,
    summary: data?.summary || {
      totalAssignedReports: normalizedItems.length,
      needsCompletionCount: normalizedItems.filter(
        (report) => report?.adminReview?.status === 'needs_completion',
      ).length,
      pendingAdminReviewCount: normalizedItems.filter(
        (report) => report?.status === 'بانتظار مراجعة الأدمن',
      ).length,
    },
    pagination: normalizePagination(
      data?.pagination || {
        page: 1,
        pageSize: normalizedItems.length || 10,
        totalItems: normalizedItems.length,
        totalPages: 1,
      },
    ),
  };
}

async function request(
  path,
  { method = 'GET', queryParams, body, isFormData = false } = {},
) {
  const token = getAuthToken();
  const headers = {};

  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(buildUrl(path, queryParams), {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const responseBody = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const validationMessage = responseBody?.errors
      ? Object.values(responseBody.errors)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .find(Boolean)
      : '';
    const message =
      validationMessage ||
      responseBody?.message ||
      responseBody?.title ||
      'حدث خطأ أثناء الاتصال بالخادم.';

    const error = new Error(message);
    error.status = response.status;
    error.response = responseBody;
    throw error;
  }

  return normalizeApiResponse(responseBody);
}

function appendFilesToFormData(formData, fieldName, files = []) {
  files.forEach((file) => {
    if (typeof File !== 'undefined' && file instanceof File) {
      formData.append(fieldName, file);
    }
  });
}

export async function getCompanyReportFilterOptions() {
  const data = await request('/api/company/reports/options');

  return {
    statusOptions: data?.statusOptions?.length
      ? data.statusOptions
      : COMPANY_REPORT_STATUS_OPTIONS_FALLBACK,
    priorityOptions: data?.priorityOptions?.length
      ? data.priorityOptions
      : COMPANY_REPORT_PRIORITY_OPTIONS_FALLBACK,
  };
}

export async function getCompanyReports(params = {}) {
  const data = await request('/api/company/reports', {
    queryParams: {
      search: params.search || undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
      priority:
        params.priority && params.priority !== 'all'
          ? params.priority
          : undefined,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    },
  });

  return normalizeReportsList(data);
}

export async function getCompanyReportById(reportId) {
  const data = await request(`/api/company/reports/${reportId}`);
  return normalizeReport(data);
}

export async function getCompanyMaintenanceTeams() {
  const data = await request('/api/company/teams');
  const items = Array.isArray(data)
    ? data
    : data?.items || data?.teams || data?.maintenanceTeams || [];

  return items.map(normalizeTeam).filter(Boolean);
}

export async function assignMaintenanceTeamToReport(reportId, payload) {
  const teamId = payload?.teamId || payload?.TeamId || payload?.technicianId;

  if (!teamId) {
    throw new Error('معرّف فرقة الصيانة مطلوب لإتمام التعيين.');
  }

  const data = await request(`/api/company/reports/${reportId}/assign-team`, {
    method: 'PATCH',
    body: { TeamId: teamId },
  });

  return normalizeReport(data);
}

export async function startCompanyReportWork(reportId, payload = {}) {
  const data = await request(`/api/company/reports/${reportId}/start-work`, {
    method: 'PATCH',
    body: payload.note ? { note: payload.note } : undefined,
  });

  return normalizeReport(data);
}

export async function submitCompanyReportSolution(reportId, payload) {
  const formData = new FormData();
  formData.append('note', payload.note || '');
  appendFilesToFormData(formData, 'images', payload.files || []);

  const data = await request(`/api/company/reports/${reportId}/solution`, {
    method: 'POST',
    body: formData,
    isFormData: true,
  });

  return normalizeReport(data);
}

export async function submitCompanyReportCannotFix(reportId, payload) {
  const formData = new FormData();
  formData.append('reason', payload.reason || '');
  formData.append('note', payload.note || '');
  appendFilesToFormData(formData, 'images', payload.files || []);

  const data = await request(`/api/company/reports/${reportId}/cannot-fix`, {
    method: 'POST',
    body: formData,
    isFormData: true,
  });

  return normalizeReport(data);
}
