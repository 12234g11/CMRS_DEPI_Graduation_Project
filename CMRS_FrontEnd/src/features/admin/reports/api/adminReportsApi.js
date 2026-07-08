import axiosClient from '../../../../shared/services/api/axiosClient';

function getAdminApiBase() {
  const configuredBaseUrl = String(axiosClient?.defaults?.baseURL || '').replace(/\/$/, '');

  return configuredBaseUrl.endsWith('/api') ? '/admin' : '/api/admin';
}

const ADMIN_API_BASE = getAdminApiBase();

function buildAdminUrl(path) {
  return `${ADMIN_API_BASE}${path}`;
}

function unwrapResponse(response) {
  const root = response?.data ?? response;

  return root?.data ?? root;
}

function removeEmptyParams(params = {}) {
  return Object.entries(params).reduce((cleanParams, [key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
      return cleanParams;
    }

    cleanParams[key] = value;
    return cleanParams;
  }, {});
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusTone(statusValue, statusLabel) {
  const status = `${statusValue || ''} ${statusLabel || ''}`.toLowerCase();

  if (
    status.includes('resolved') ||
    status.includes('closed') ||
    status.includes('تم الحل') ||
    status.includes('مغلق')
  ) {
    return 'success';
  }

  if (
    status.includes('rejected') ||
    status.includes('cannot') ||
    status.includes('مرفوض') ||
    status.includes('متعذر')
  ) {
    return 'danger';
  }

  if (
    status.includes('assigned') ||
    status.includes('inprogress') ||
    status.includes('in progress') ||
    status.includes('accepted') ||
    status.includes('تم التعيين') ||
    status.includes('جاري') ||
    status.includes('مقبول')
  ) {
    return 'info';
  }

  return 'warning';
}

function getPriorityTone(priorityValue, priorityLabel) {
  const priority = `${priorityValue || ''} ${priorityLabel || ''}`.toLowerCase();

  if (priority.includes('high') || priority.includes('عالية')) return 'danger';
  if (priority.includes('low') || priority.includes('منخفضة')) return 'success';

  return 'warning';
}

function getBackendAssetBaseUrl() {
  const explicitAssetBaseUrl = String(
    import.meta.env?.VITE_ASSET_BASE_URL ||
      import.meta.env?.VITE_UPLOADS_BASE_URL ||
      '',
  ).replace(/\/$/, '');

  const configuredBaseUrl = String(
    explicitAssetBaseUrl ||
      import.meta.env?.VITE_API_BASE_URL ||
      axiosClient?.defaults?.baseURL ||
      '',
  ).replace(/\/$/, '');

  if (!configuredBaseUrl) return '';

  try {
    const browserOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
    const absoluteBaseUrl = new URL(configuredBaseUrl, browserOrigin);
    const pathname = absoluteBaseUrl.pathname.replace(/\/$/, '').replace(/\/api$/i, '');

    return `${absoluteBaseUrl.origin}${pathname}`.replace(/\/$/, '');
  } catch {
    return configuredBaseUrl.replace(/\/api$/i, '');
  }
}

const BACKEND_ASSET_BASE_URL = getBackendAssetBaseUrl();

function resolveAssetUrl(value) {
  if (!value || typeof value !== 'string') return '';

  const url = value.trim();

  if (/^(https?:)?\/\//i.test(url) || /^(data|blob):/i.test(url)) {
    return url;
  }

  if (!BACKEND_ASSET_BASE_URL) return url;

  const path = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_ASSET_BASE_URL}${path}`;
}

function imageToUrl(image) {
  if (!image) return '';

  const imageUrl = typeof image === 'string'
    ? image
    : image.imageUrl || image.thumbnailUrl || image.url || '';

  return resolveAssetUrl(imageUrl);
}

function normalizeImages(images = []) {
  return images.map(imageToUrl).filter(Boolean);
}

function normalizeCompanyResponse(response) {
  if (!response) return null;

  return {
    ...response,
    statusLabel: response.statusLabel || response.status || 'رد شركة',
    reviewLabel: response.reviewLabel || response.reviewStatus || '-',
    submittedAt: formatDateTime(response.submittedAt),
    images: normalizeImages(response.images || []),
  };
}

function normalizeReporter(reporter = {}) {
  return {
    id: reporter.id || '',
    name: reporter.name || 'غير متاح',
    email: reporter.email || '-',
    phone: reporter.phone || '-',
    reportsCount: reporter.reportsCount ?? 0,
    trustScore: reporter.trustScore ?? 0,
    verified: Boolean(reporter.verified),
  };
}

function normalizeTimeline(timeline = []) {
  return timeline.map((item, index) => ({
    ...item,
    id: item.id || `${item.createdAt || Date.now()}-${index}`,
    actorType: item.actorType || 'system',
    actor: item.actor || 'النظام',
    title: item.title || 'تحديث على البلاغ',
    description: item.description || '',
    date: formatDateTime(item.createdAt || item.date),
  }));
}

export function normalizeAdminReport(report = {}) {
  const statusValue = report.status || '';
  const statusLabel = report.statusLabel || statusValue || '-';
  const priorityValue = report.priority || '';
  const priorityLabel = report.priorityLabel || priorityValue || '-';
  const images = normalizeImages(report.images || []);
  const mainImageUrl = report.mainImageUrl || images[0] || '';

  return {
    ...report,
    type: report.type || report.issueCategoryName || report.title || '-',
    issueCategoryId: report.issueCategoryId || '',
    issueCategoryName: report.issueCategoryName || report.type || '-',
    statusValue,
    status: statusLabel,
    statusLabel,
    statusTone: getStatusTone(statusValue, statusLabel),
    priorityValue,
    priority: priorityLabel,
    priorityLabel,
    priorityTone: getPriorityTone(priorityValue, priorityLabel),
    date: formatDate(report.createdAt || report.date),
    createdAt: report.createdAt || report.date || '',
    location: report.location || report.area?.address || report.area?.detailedAddress || '-',
    city: report.city || report.area?.city || '',
    position: report.position || {
      lat: report.latitude ?? report.lat,
      lng: report.longitude ?? report.lng,
    },
    assignedCompanyId: report.assignedCompanyId || '',
    assignedCompany: report.assignedCompanyName || report.assignedCompany || 'غير معين',
    assignedCompanyName: report.assignedCompanyName || report.assignedCompany || '',
    concernedCompany: report.concernedCompanyName || report.concernedCompany || 'غير معين',
    concernedCompanyName: report.concernedCompanyName || report.concernedCompany || '',
    rating: report.rating ?? 0,
    votesCount: report.votesCount ?? 0,
    mainImageUrl,
    imagesCount: report.imagesCount ?? images.length,
    images: images.length ? images : [mainImageUrl].filter(Boolean),
    reporter: normalizeReporter(report.reporter),
    companyResponse: normalizeCompanyResponse(report.companyResponse),
    excludedCompanyIds: report.excludedCompanyIds || [],
    excludedCompanyNames: report.excludedCompanyNames || [],
    timeline: normalizeTimeline(report.timeline || []),
  };
}

function normalizeReportsPayload(payload = {}) {
  const items = Array.isArray(payload) ? payload : payload.items || [];

  return {
    items: items.map(normalizeAdminReport),
    totalCount: payload.totalCount ?? items.length,
    pageNumber: payload.pageNumber ?? 1,
    pageSize: payload.pageSize ?? items.length,
    totalPages: payload.totalPages ?? 1,
    summary: payload.summary || {
      totalReports: items.length,
      underReviewCount: 0,
      pendingCompanyReviewCount: 0,
      assignedCount: 0,
      inProgressCount: 0,
      resolvedCount: 0,
      rejectedCount: 0,
    },
  };
}

function normalizeOptions(options = []) {
  return options.map((option) => ({
    value: option.value ?? option.id ?? option.name,
    label: option.label ?? option.name ?? option.value,
  }));
}

function normalizeIssueCategories(categories = []) {
  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
}

function normalizeAssignmentCompany(company = {}) {
  const activeTasks = Number(company.activeTasks || company.currentTasks || 0);
  const maxCapacity = Number(company.maxCapacity || 0);
  const capacityRatio =
    company.capacityRatio ?? (maxCapacity ? activeTasks / Math.max(maxCapacity, 1) : 0);

  return {
    ...company,
    activeTasks,
    currentTasks: company.currentTasks ?? activeTasks,
    maxCapacity,
    capacityRatio,
    workloadLabel:
      company.workloadLabel ||
      (maxCapacity ? `${activeTasks}/${maxCapacity} مهام` : `${activeTasks} مهام نشطة`),
    workloadTone:
      capacityRatio >= 0.85 ? 'danger' : capacityRatio >= 0.6 ? 'warning' : 'success',
    avgResponseTime: company.avgResponseTime || 'لا توجد بيانات بعد',
    rating: company.rating ?? 'لا توجد بيانات',
    successRate: company.successRate ?? 0,
    coverageAreas: company.coverageAreas || [],
    specializations: company.specializations || [],
    problemTypes: company.problemTypes || [],
    matchReasons: company.matchReasons || [],
    matchScore: company.matchScore ?? 0,
  };
}

export async function getAdminReports(params = {}) {
  const response = await axiosClient.get(buildAdminUrl('/reports'), {
    params: removeEmptyParams(params),
  });

  return normalizeReportsPayload(unwrapResponse(response));
}

export async function getAdminReportFilterOptions() {
  const response = await axiosClient.get(buildAdminUrl('/reports/filter-options'));
  const data = unwrapResponse(response) || {};

  return {
    statuses: [{ value: 'all', label: 'كل الحالات' }, ...normalizeOptions(data.statuses || [])],
    priorities: [{ value: 'all', label: 'كل الأولويات' }, ...normalizeOptions(data.priorities || [])],
    issueCategories: [
      { value: 'all', label: 'كل التصنيفات' },
      ...normalizeIssueCategories(data.issueCategories || []),
    ],
  };
}

export async function getAdminReportById(reportId) {
  const response = await axiosClient.get(buildAdminUrl(`/reports/${reportId}`));

  return normalizeAdminReport(unwrapResponse(response));
}

export async function approveAdminReport(reportId) {
  await axiosClient.put(buildAdminUrl(`/reports/${reportId}/approve`));

  return getAdminReportById(reportId);
}

export async function rejectAdminReport(reportId, rejectionReason) {
  await axiosClient.put(buildAdminUrl(`/reports/${reportId}/reject`), null, {
    params: { RejectionReason: rejectionReason },
  });

  return getAdminReportById(reportId);
}

export async function resolveAdminReport(reportId) {
  await axiosClient.put(buildAdminUrl(`/reports/${reportId}/resolve`));

  return getAdminReportById(reportId);
}

export async function requestAdminReportFollowUp(reportId) {
  await axiosClient.put(buildAdminUrl(`/reports/${reportId}/request-followup`));

  return getAdminReportById(reportId);
}

export async function closeAdminReport(reportId) {
  await axiosClient.put(buildAdminUrl(`/reports/${reportId}/close`));

  return getAdminReportById(reportId);
}


export async function getAssignmentCompaniesForReport(reportId, filters = {}) {
  const response = await axiosClient.get(buildAdminUrl('/reports/assignment-companies'), {
    params: removeEmptyParams({
      id: reportId,
      search: filters.search,
      specialization: filters.specialization,
    }),
  });

  const data = unwrapResponse(response) || [];

  return Array.isArray(data) ? data.map(normalizeAssignmentCompany) : [];
}


export async function assignCompanyToReport(reportId, payload) {
  const response = await axiosClient.post(
    buildAdminUrl(`/reports/${reportId}/assign-company`),
    {
      companyId: payload.companyId,
      adminNote: payload.adminNote || null,
      assignmentSource: payload.assignmentSource || 'manual',
    },
  );

  const data = unwrapResponse(response) || {};

  return {
    ...data,
    companyId: data.assignedCompanyId || data.assignment?.companyId || payload.companyId,
    assignedCompany:
      data.assignedCompanyName || data.assignment?.companyName || data.concernedCompanyName || '',
    concernedCompany: data.concernedCompanyName || data.assignedCompanyName || '',
    status: data.statusLabel || data.status || '',
    statusValue: data.status || '',
    statusTone: getStatusTone(data.status, data.statusLabel),
  };
}

export async function reviewCompanyResponse(reportId, payload) {
  const response = await axiosClient.post(
    buildAdminUrl(`/reports/${reportId}/company-response/review`),
    {
      action: payload.action,
      adminNote: payload.adminNote || null,
      excludeCurrentCompany: Boolean(payload.excludeCurrentCompany),
    },
  );

  return unwrapResponse(response);
}

export async function acceptCompanyFix(reportId, payload = {}) {
  await reviewCompanyResponse(reportId, {
    action: 'approve',
    adminNote: payload.adminNote,
    excludeCurrentCompany: false,
  });

  return getAdminReportById(reportId);
}

export async function requestCompanyCompletion(reportId, payload = {}) {
  await reviewCompanyResponse(reportId, {
    action: 'reject',
    adminNote: payload.adminNote,
    excludeCurrentCompany: false,
  });

  return getAdminReportById(reportId);
}

export async function acceptCompanyCannotFix(reportId, payload = {}) {
  await closeAdminReport(reportId, payload);

  return getAdminReportById(reportId);
}

export async function prepareReportReassignment(reportId, payload = {}) {
  await reviewCompanyResponse(reportId, {
    action: 'reject',
    adminNote: payload.adminNote,
    excludeCurrentCompany: true,
  });

  return getAdminReportById(reportId);
}

export async function getPendingCompanyReviewReports(params = {}) {
  const payload = await getAdminReports({
    ...params,
    companyReviewStatus: params.companyReviewStatus || 'pending',
  });

  return payload.items;
}
