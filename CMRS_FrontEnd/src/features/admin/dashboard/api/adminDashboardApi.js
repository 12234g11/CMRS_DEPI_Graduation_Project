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

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

export function isRejectedReport(report = {}) {
  const status = normalizeText(
    `${report.statusValue || ''} ${report.status || ''} ${report.statusLabel || ''}`,
  );

  return status.includes('rejected') || status.includes('reject') || status.includes('مرفوض');
}

function getStatusTone(statusValue, statusLabel) {
  const status = normalizeText(`${statusValue || ''} ${statusLabel || ''}`);

  if (
    status.includes('resolved') ||
    status.includes('closed') ||
    status.includes('تم الحل') ||
    status.includes('مغلق')
  ) {
    return 'success';
  }

  if (
    status.includes('follow') ||
    status.includes('cannot') ||
    status.includes('failed') ||
    status.includes('متعذر') ||
    status.includes('استكمال') ||
    status.includes('متابعة')
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
  const priority = normalizeText(`${priorityValue || ''} ${priorityLabel || ''}`);

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

function normalizeReporter(reporter = {}) {
  return {
    id: reporter.id || '',
    name: reporter.name || 'غير محدد',
    email: reporter.email || '-',
    phone: reporter.phone || '-',
  };
}

function normalizeCompanyResponse(response) {
  if (!response) return null;

  return {
    ...response,
    statusLabel: response.statusLabel || response.status || 'رد شركة',
    reviewLabel: response.reviewLabel || response.reviewStatus || '-',
    companyName: response.companyName || '-',
    note: response.note || response.reason || response.adminNote || '',
    images: normalizeImages(response.images || []),
  };
}

function normalizeReport(report = {}) {
  const statusValue = report.status || '';
  const statusLabel = report.statusLabel || statusValue || '-';
  const priorityValue = report.priority || '';
  const priorityLabel = report.priorityLabel || priorityValue || '-';
  const images = normalizeImages(report.images || []);
  const mainImageUrl = report.mainImageUrl || images[0] || '';
  const areaAddress = report.area?.detailedAddress || report.area?.address || '';

  return {
    ...report,
    type: report.type || report.issueCategoryName || '-',
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
    date: formatDate(report.createdAt),
    location: report.location || areaAddress || report.city || '-',
    city: report.city || report.area?.city || '',
    position: report.position || {
      lat: report.latitude ?? report.lat,
      lng: report.longitude ?? report.lng,
    },
    assignedCompany: report.assignedCompanyName || report.assignedCompany || 'غير معين',
    assignedCompanyName: report.assignedCompanyName || report.assignedCompany || '',
    concernedCompanyName: report.concernedCompanyName || '',
    rating: report.rating ?? 0,
    votesCount: report.votesCount ?? 0,
    mainImageUrl,
    images: images.length ? images : [mainImageUrl].filter(Boolean),
    imagesCount: report.imagesCount ?? images.length,
    reporter: normalizeReporter(report.reporter),
    companyResponse: normalizeCompanyResponse(report.companyResponse),
  };
}

function normalizeReportsPayload(payload = {}) {
  const items = Array.isArray(payload) ? payload : payload.items || [];
  const normalizedItems = items.map(normalizeReport);

  return {
    items: normalizedItems,
    totalCount: payload.totalCount ?? normalizedItems.length,
    pageNumber: payload.pageNumber ?? 1,
    pageSize: payload.pageSize ?? normalizedItems.length,
    totalPages: payload.totalPages ?? 1,
    summary: payload.summary || {},
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

function removeRejectedStatusOptions(statuses = []) {
  return statuses.filter((status) => !isRejectedReport({
    statusValue: status.value,
    statusLabel: status.label,
  }));
}

function normalizeFilterOptions(data = {}) {
  const statuses = removeRejectedStatusOptions(normalizeOptions(data.statuses || []));

  return {
    problemTypes: [
      { value: 'all', label: 'كل الأنواع' },
      ...normalizeIssueCategories(data.issueCategories || []),
    ],
    statuses: [{ value: 'all', label: 'كل الحالات المعروضة' }, ...statuses],
    priorities: [
      { value: 'all', label: 'كل الأولويات' },
      ...normalizeOptions(data.priorities || []),
    ],
  };
}

function buildStats(summary = {}, reports = []) {
  const safeSummary = summary || {};

  return [
    {
      id: 'total',
      title: 'إجمالي البلاغات',
      subtitle: 'Total Reports',
      value: safeSummary.totalReports ?? reports.length,
      tone: 'primary',
    },
    {
      id: 'pending',
      title: 'قيد المراجعة',
      subtitle: 'Under Review',
      value:
        safeSummary.underReviewCount ??
        reports.filter((report) => report.statusTone === 'warning').length,
      tone: 'warning',
    },
    {
      id: 'in-progress',
      title: 'جاري الحل',
      subtitle: 'In Progress',
      value:
        (safeSummary.assignedCount ?? 0) +
        (safeSummary.inProgressCount ??
          reports.filter((report) => report.statusTone === 'info').length),
      tone: 'info',
    },
    {
      id: 'solved',
      title: 'تم الحل',
      subtitle: 'Resolved',
      value:
        safeSummary.resolvedCount ??
        reports.filter((report) => report.statusTone === 'success').length,
      tone: 'success',
    },
  ];
}

export async function getAdminDashboardData(params = {}) {
  const [reportsResponse, filterOptionsResponse] = await Promise.all([
    axiosClient.get(buildAdminUrl('/reports'), {
      params: removeEmptyParams({
        pageNumber: 1,
        pageSize: params.pageSize || 1000,
      }),
    }),
    axiosClient.get(buildAdminUrl('/reports/filter-options')),
  ]);

  const reportsPayload = normalizeReportsPayload(unwrapResponse(reportsResponse));
  const visibleReports = reportsPayload.items.filter((report) => !isRejectedReport(report));
  const filterOptions = normalizeFilterOptions(unwrapResponse(filterOptionsResponse) || {});

  return {
    stats: buildStats(reportsPayload.summary, reportsPayload.items),
    reports: visibleReports,
    totalReportsCount: reportsPayload.totalCount,
    hiddenRejectedCount: reportsPayload.summary?.rejectedCount ?? Math.max(reportsPayload.items.length - visibleReports.length, 0),
    filters: filterOptions,
  };
}
