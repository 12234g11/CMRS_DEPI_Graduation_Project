import axiosClient from '../../../../shared/services/api/axiosClient';
import { resolveAssetUrl } from '../../../../shared/services/api/assetUrl';

export const REPORT_STATUS_API_VALUES = {
  all: 'all',
  underReview: 'UnderReview',
  pending: 'Pending',
  accepted: 'Accepted',
  assigned: 'Assigned',
  inProgress: 'InProgress',
  resolved: 'Resolved',
  completed: 'Completed',
  closed: 'Closed',
  rejected: 'Rejected',
};

export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS_API_VALUES.underReview]: 'قيد المراجعة',
  [REPORT_STATUS_API_VALUES.pending]: 'معلق',
  [REPORT_STATUS_API_VALUES.accepted]: 'تم القبول',
  [REPORT_STATUS_API_VALUES.assigned]: 'تم التعيين',
  [REPORT_STATUS_API_VALUES.inProgress]: 'جاري الحل',
  [REPORT_STATUS_API_VALUES.resolved]: 'تم الحل',
  [REPORT_STATUS_API_VALUES.completed]: 'مكتمل',
  [REPORT_STATUS_API_VALUES.closed]: 'مغلق',
  [REPORT_STATUS_API_VALUES.rejected]: 'مرفوض',
};

export const REPORT_STATUS_FILTER_OPTIONS = [
  { value: REPORT_STATUS_API_VALUES.all, label: 'كل الحالات' },
  { value: REPORT_STATUS_API_VALUES.underReview, label: 'قيد المراجعة' },
  { value: REPORT_STATUS_API_VALUES.pending, label: 'معلق' },
  { value: REPORT_STATUS_API_VALUES.accepted, label: 'تم القبول' },
  { value: REPORT_STATUS_API_VALUES.assigned, label: 'تم التعيين' },
  { value: REPORT_STATUS_API_VALUES.inProgress, label: 'جاري الحل' },
  { value: REPORT_STATUS_API_VALUES.resolved, label: 'تم الحل' },
  { value: REPORT_STATUS_API_VALUES.completed, label: 'مكتمل' },
  { value: REPORT_STATUS_API_VALUES.closed, label: 'مغلق' },
  { value: REPORT_STATUS_API_VALUES.rejected, label: 'مرفوض' },
];

function normalizeStatusValue(status = '') {
  return String(status || '')
    .trim()
    .replace(/[\s_-]+/g, '')
    .toLowerCase();
}

function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'حدث خطأ غير متوقع.';
  }

  if (typeof data === 'string') {
    return data;
  }

  const errors = data.errors || data.Errors;

  if (errors && typeof errors === 'object') {
    const messages = Object.entries(errors)
      .filter(([key]) => String(key).toLowerCase() !== 'traceid')
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${message}`);
        }

        if (typeof value === 'string') {
          return [`${field}: ${value}`];
        }

        return [];
      });

    if (messages.length) {
      return messages.join(' ');
    }
  }

  return (
    data.message ||
    data.Message ||
    data.title ||
    data.Title ||
    'حدث خطأ أثناء تحميل البلاغات.'
  );
}

function getResponseData(response) {
  return response?.data?.data || response?.data?.Data || response?.data;
}

export function getReportStatusKey(status = '') {
  const normalizedStatus = normalizeStatusValue(status);

  if (['resolved', 'solved'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.resolved;
  }

  if (['inprogress', 'progress', 'processing', 'working'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.inProgress;
  }

  if (['underreview', 'review', 'reviewing'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.underReview;
  }

  if (['pending', 'waiting'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.pending;
  }

  if (['accepted', 'approved'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.accepted;
  }

  if (['assigned'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.assigned;
  }

  if (['completed', 'complete', 'done'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.completed;
  }

  if (['closed', 'close'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.closed;
  }

  if (['rejected', 'refused', 'declined'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.rejected;
  }

  return REPORT_STATUS_API_VALUES.underReview;
}

export function getStatusTone(status = '') {
  const statusKey = getReportStatusKey(status);

  if (
    statusKey === REPORT_STATUS_API_VALUES.resolved ||
    statusKey === REPORT_STATUS_API_VALUES.completed ||
    statusKey === REPORT_STATUS_API_VALUES.closed
  ) {
    return 'success';
  }

  if (
    statusKey === REPORT_STATUS_API_VALUES.inProgress ||
    statusKey === REPORT_STATUS_API_VALUES.assigned ||
    statusKey === REPORT_STATUS_API_VALUES.accepted
  ) {
    return 'info';
  }

  if (statusKey === REPORT_STATUS_API_VALUES.rejected) {
    return 'danger';
  }

  return 'warning';
}

export function getStatusLabel(status = '') {
  const statusKey = getReportStatusKey(status);

  return REPORT_STATUS_LABELS[statusKey] || 'قيد المراجعة';
}

function buildAreaText(area = {}) {
  if (typeof area === 'string') {
    return area;
  }

  return [area.city, area.address, area.detailedAddress]
    .filter(Boolean)
    .join(' - ');
}

function prepareReportForUi(report = {}) {
  const reportImages = Array.isArray(report.reportImages)
    ? report.reportImages.map((image) => ({
        ...image,
        imageUrl: image.imageUrl || '',
        fullImageUrl: resolveAssetUrl(image.imageUrl || ''),
      }))
    : [];

  const imageUrls = reportImages
    .map((image) => image.fullImageUrl)
    .filter(Boolean);

  const areaText = buildAreaText(report.area || {});
  const rawStatus = report.status || report.statusKey || report.Status || '';
  const statusKey = getReportStatusKey(rawStatus);

  return {
    ...report,

    id: report.reportId || report.id,
    categoryLabel: report.issueCategoryName || report.categoryLabel,

    status: rawStatus || statusKey,
    statusLabel: report.statusLabel || report.StatusLabel || getStatusLabel(statusKey),
    statusTone: report.statusTone || report.tone || getStatusTone(statusKey),
    statusKey,

    ownerUserId:
      report.ownerUserId ||
      report.userId ||
      report.UserId ||
      report.createdByUserId ||
      report.reporterId ||
      report.ownerId ||
      report.user?.id ||
      report.user?.userId ||
      '',

    areaText,
    locationText: report.locationText || report.address || areaText,

    imageUrls,
    images: imageUrls.length ? imageUrls : report.images || [],
    coverImage: imageUrls[0] || report.coverImage || report.image || '',

    position:
      Number.isFinite(Number(report.latitude)) &&
      Number.isFinite(Number(report.longitude))
        ? {
            lat: Number(report.latitude),
            lng: Number(report.longitude),
          }
        : report.position || null,
  };
}

function extractReportsPage(response) {
  const data = getResponseData(response);

  if (Array.isArray(data)) {
    return {
      items: data.map(prepareReportForUi),
      totalCount: data.length,
      pageNumber: 1,
      pageSize: data.length || 10,
      totalPages: 1,
    };
  }

  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.Items)
      ? data.Items
      : [];

  const totalCount = Number(
    data?.totalCount ??
      data?.TotalCount ??
      data?.count ??
      data?.Count ??
      data?.totalItems ??
      data?.TotalItems ??
      items.length
  );
  const pageNumber = Number(data?.pageNumber ?? data?.PageNumber ?? 1);
  const pageSize = Number(data?.pageSize ?? data?.PageSize ?? data?.size ?? data?.Size ?? 10);
  const apiTotalPages = Number(data?.totalPages ?? data?.TotalPages ?? 0);
  const totalPages = apiTotalPages > 0
    ? apiTotalPages
    : Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)));

  return {
    items: items.map(prepareReportForUi),
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
  };
}

export async function getUserReports(input = {}) {
  const userId = typeof input === 'string' ? input : input.userId;
  const pageNumber = typeof input === 'string' ? 1 : input.pageNumber || 1;
  const pageSize = typeof input === 'string' ? undefined : input.pageSize;

  if (!userId) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    };
  }

  try {
    const response = await axiosClient.get(
      `/api/Report/user/${encodeURIComponent(userId)}`,
      {
        params: {
          pageNumber,
          ...(pageSize ? { pageSize } : {}),
        },
      }
    );

    return extractReportsPage(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getReportsByStatus(status) {
  const apiStatus = String(status || '').trim();

  if (!apiStatus || apiStatus === REPORT_STATUS_API_VALUES.all) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    };
  }

  try {
    const response = await axiosClient.get(
      `/api/Report/Status/${encodeURIComponent(apiStatus)}`
    );

    return extractReportsPage(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function searchReports(searchTerm = '') {
  const term = String(searchTerm || '').trim();

  if (!term) {
    return [];
  }

  try {
    const response = await axiosClient.get('/api/Report/search', {
      params: {
        term,
      },
    });

    const data = getResponseData(response);
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.Items)
          ? data.Items
          : [];

    return items.map(prepareReportForUi);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
