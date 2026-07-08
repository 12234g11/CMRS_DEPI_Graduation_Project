import axiosClient from '../../../../shared/services/api/axiosClient';
import { resolveAssetUrl } from '../../../../shared/services/api/assetUrl';

export const REPORT_STATUS_API_VALUES = {
  all: 'all',
  underReview: 'UnderReview',
  accepted: 'Accepted',
  rejected: 'Rejected',
  assigned: 'Assigned',
  inProgress: 'InProgress',
  pendingAdminApproval: 'PendingAdminApproval',
  needsCompletion: 'NeedsCompletion',
  unableToExecute: 'UnableToExecute',
  resolved: 'Resolved',
};

export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS_API_VALUES.underReview]: 'قيد المراجعة',
  [REPORT_STATUS_API_VALUES.accepted]: 'مقبول',
  [REPORT_STATUS_API_VALUES.rejected]: 'مرفوض',
  [REPORT_STATUS_API_VALUES.assigned]: 'تم التعيين',
  [REPORT_STATUS_API_VALUES.inProgress]: 'جاري التنفيذ',
  [REPORT_STATUS_API_VALUES.pendingAdminApproval]: 'بانتظار اعتماد الأدمن',
  [REPORT_STATUS_API_VALUES.needsCompletion]: 'مطلوب استكمال',
  [REPORT_STATUS_API_VALUES.unableToExecute]: 'متعذر التنفيذ',
  [REPORT_STATUS_API_VALUES.resolved]: 'تم الحل',
};

export const REPORT_STATUS_FILTER_OPTIONS = [
  { value: REPORT_STATUS_API_VALUES.all, label: 'كل الحالات' },
  { value: REPORT_STATUS_API_VALUES.underReview, label: 'قيد المراجعة' },
  { value: REPORT_STATUS_API_VALUES.accepted, label: 'مقبول' },
  { value: REPORT_STATUS_API_VALUES.rejected, label: 'مرفوض' },
  { value: REPORT_STATUS_API_VALUES.assigned, label: 'تم التعيين' },
  { value: REPORT_STATUS_API_VALUES.inProgress, label: 'جاري التنفيذ' },
  {
    value: REPORT_STATUS_API_VALUES.pendingAdminApproval,
    label: 'بانتظار اعتماد الأدمن',
  },
  { value: REPORT_STATUS_API_VALUES.needsCompletion, label: 'مطلوب استكمال' },
  { value: REPORT_STATUS_API_VALUES.unableToExecute, label: 'متعذر التنفيذ' },
  { value: REPORT_STATUS_API_VALUES.resolved, label: 'تم الحل' },
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

  if (
    [
      'underreview',
      'review',
      'reviewing',
      'pending',
      'waiting',
      'قيدالمراجعة',
    ].includes(normalizedStatus)
  ) {
    return REPORT_STATUS_API_VALUES.underReview;
  }

  if (
    ['accepted', 'approved', 'مقبول', 'تمالقبول'].includes(normalizedStatus)
  ) {
    return REPORT_STATUS_API_VALUES.accepted;
  }

  if (
    ['rejected', 'refused', 'declined', 'مرفوض'].includes(normalizedStatus)
  ) {
    return REPORT_STATUS_API_VALUES.rejected;
  }

  if (['assigned', 'تمالتعيين'].includes(normalizedStatus)) {
    return REPORT_STATUS_API_VALUES.assigned;
  }

  if (
    [
      'inprogress',
      'progress',
      'processing',
      'working',
      'inexecution',
      'جاريالتنفيذ',
      'جاريالحل',
    ].includes(normalizedStatus)
  ) {
    return REPORT_STATUS_API_VALUES.inProgress;
  }

  if (
    [
      'pendingadminapproval',
      'waitingadminapproval',
      'awaitingadminapproval',
      'pendingapproval',
      'waitingapproval',
      'awaitingapproval',
      'بانتظاراعتمادالأدمن',
      'فيانتظاراعتمادالأدمن',
    ].includes(normalizedStatus)
  ) {
    return REPORT_STATUS_API_VALUES.pendingAdminApproval;
  }

  if (
    [
      'needscompletion',
      'needcompletion',
      'requiredcompletion',
      'completionrequired',
      'needmorework',
      'moreworkrequired',
      'مطلوباستكمال',
    ].includes(normalizedStatus)
  ) {
    return REPORT_STATUS_API_VALUES.needsCompletion;
  }

  if (
    [
      'unabletoexecute',
      'cannotexecute',
      'executionblocked',
      'blocked',
      'failedexecution',
      'executionfailed',
      'متعذرالتنفيذ',
    ].includes(normalizedStatus)
  ) {
    return REPORT_STATUS_API_VALUES.unableToExecute;
  }

  if (
    [
      'resolved',
      'solved',
      'completed',
      'complete',
      'done',
      'closed',
      'close',
      'تمالحل',
    ].includes(normalizedStatus)
  ) {
    return REPORT_STATUS_API_VALUES.resolved;
  }

  return REPORT_STATUS_API_VALUES.underReview;
}

export function getStatusTone(status = '') {
  const statusKey = getReportStatusKey(status);

  if (statusKey === REPORT_STATUS_API_VALUES.resolved) {
    return 'success';
  }

  if (
    statusKey === REPORT_STATUS_API_VALUES.accepted ||
    statusKey === REPORT_STATUS_API_VALUES.assigned ||
    statusKey === REPORT_STATUS_API_VALUES.inProgress
  ) {
    return 'info';
  }

  if (
    statusKey === REPORT_STATUS_API_VALUES.rejected ||
    statusKey === REPORT_STATUS_API_VALUES.unableToExecute
  ) {
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

  return [
    area.city || area.City,
    area.address || area.Address,
    area.detailedAddress || area.DetailedAddress,
  ]
    .filter(Boolean)
    .join(' - ');
}

function getReportImages(report = {}) {
  const rawImages =
    report.reportImages ||
    report.ReportImages ||
    report.images ||
    report.Images ||
    [];

  if (!Array.isArray(rawImages)) {
    return [];
  }

  return rawImages
    .map((image) => {
      if (typeof image === 'string') {
        return {
          imageUrl: image,
          fullImageUrl: resolveAssetUrl(image),
        };
      }

      const imageUrl =
        image.imageUrl ||
        image.ImageUrl ||
        image.url ||
        image.Url ||
        image.path ||
        image.Path ||
        '';

      return {
        ...image,
        imageUrl,
        fullImageUrl: resolveAssetUrl(imageUrl),
      };
    })
    .filter((image) => image.fullImageUrl);
}

function getReportPosition(report = {}) {
  const latitude =
    report.latitude ??
    report.Latitude ??
    report.lat ??
    report.Lat ??
    report.position?.lat ??
    report.position?.latitude;

  const longitude =
    report.longitude ??
    report.Longitude ??
    report.lng ??
    report.Lng ??
    report.position?.lng ??
    report.position?.longitude;

  if (Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
    return {
      lat: Number(latitude),
      lng: Number(longitude),
    };
  }

  return null;
}

export function prepareReportForUi(report = {}) {
  const reportImages = getReportImages(report);
  const imageUrls = reportImages
    .map((image) => image.fullImageUrl)
    .filter(Boolean);

  const areaText = buildAreaText(report.area || report.Area || {});

  const rawStatus =
    report.status ||
    report.Status ||
    report.statusKey ||
    report.StatusKey ||
    '';

  const statusKey = getReportStatusKey(rawStatus);

  return {
    ...report,

    id: report.reportId || report.ReportId || report.id || report.Id,

    reportId: report.reportId || report.ReportId || report.id || report.Id,

    reportNumber:
      report.reportNumber ||
      report.ReportNumber ||
      report.number ||
      report.Number,

    title:
      report.title ||
      report.Title ||
      report.issueTitle ||
      report.IssueTitle ||
      report.issueCategoryName ||
      report.IssueCategoryName ||
      'بلاغ',

    description: report.description || report.Description || '',

    rejectionReason:
      report.rejectionReason ||
      report.RejectionReason ||
      report.rejectReason ||
      report.RejectReason ||
      report.refusalReason ||
      report.RefusalReason ||
      report.adminRejectionReason ||
      report.AdminRejectionReason ||
      report.statusReason ||
      report.StatusReason ||
      '',

    categoryLabel:
      report.issueCategoryName ||
      report.IssueCategoryName ||
      report.categoryLabel ||
      report.CategoryLabel ||
      report.categoryName ||
      report.CategoryName ||
      'أخرى',

    issueCategoryName:
      report.issueCategoryName ||
      report.IssueCategoryName ||
      report.categoryLabel ||
      report.CategoryLabel ||
      report.categoryName ||
      report.CategoryName ||
      'أخرى',

    status: rawStatus || statusKey,
    statusKey,

    statusLabel:
      report.statusLabel ||
      report.StatusLabel ||
      getStatusLabel(statusKey),

    statusTone:
      report.statusTone ||
      report.tone ||
      report.Tone ||
      getStatusTone(statusKey),

    ownerUserId:
      report.ownerUserId ||
      report.OwnerUserId ||
      report.userId ||
      report.UserId ||
      report.createdByUserId ||
      report.CreatedByUserId ||
      report.reporterId ||
      report.ReporterId ||
      report.ownerId ||
      report.OwnerId ||
      report.user?.id ||
      report.user?.userId ||
      report.User?.Id ||
      '',

    areaText,

    locationText:
      report.locationText ||
      report.LocationText ||
      report.address ||
      report.Address ||
      areaText,

    imageUrls,
    images: imageUrls,

    coverImage:
      imageUrls[0] ||
      report.coverImage ||
      report.CoverImage ||
      report.image ||
      report.Image ||
      '',

    position: getReportPosition(report),
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

  const items =
    data?.items ||
    data?.Items ||
    data?.reports ||
    data?.Reports ||
    data?.data ||
    data?.Data ||
    [];

  const safeItems = Array.isArray(items) ? items : [];

  const totalCount = Number(
    data?.totalCount ??
      data?.TotalCount ??
      data?.count ??
      data?.Count ??
      data?.totalItems ??
      data?.TotalItems ??
      safeItems.length
  );

  const pageNumber = Number(data?.pageNumber ?? data?.PageNumber ?? 1);
  const pageSize = Number(data?.pageSize ?? data?.PageSize ?? 10);
  const apiTotalPages = Number(data?.totalPages ?? data?.TotalPages ?? 0);

  const totalPages =
    apiTotalPages > 0
      ? apiTotalPages
      : Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)));

  return {
    items: safeItems.map(prepareReportForUi),
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
  };
}

export async function getUserReports(input = {}) {
  const userId = typeof input === 'string' ? input : input.userId;
  const pageNumber = typeof input === 'string' ? 1 : input.pageNumber || 1;
  const pageSize = typeof input === 'string' ? 10 : input.pageSize || 10;

  if (!userId) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize,
      totalPages: 1,
    };
  }

  try {
    const response = await axiosClient.get(
      `/api/Report/user/${encodeURIComponent(userId)}`,
      {
        params: {
          pageNumber,
          pageSize,
        },
      }
    );

    return extractReportsPage(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function searchReports(term = '') {
  const cleanTerm = String(term || '').trim();

  if (!cleanTerm) {
    return [];
  }

  try {
    const response = await axiosClient.get('/api/Report/search', {
      params: {
        term: cleanTerm,
      },
    });

    return extractReportsPage(response).items;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getReportsByStatus(status = '') {
  const cleanStatus = String(status || '').trim();

  if (!cleanStatus || cleanStatus === REPORT_STATUS_API_VALUES.all) {
    return [];
  }

  try {
    const response = await axiosClient.get(
      `/api/Report/Status/${encodeURIComponent(cleanStatus)}`
    );

    return extractReportsPage(response).items;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getReportById(reportId = '') {
  const cleanReportId = String(reportId || '').trim();

  if (!cleanReportId) {
    return null;
  }

  try {
    const response = await axiosClient.get(
      `/api/Report/${encodeURIComponent(cleanReportId)}`
    );

    const data = getResponseData(response);

    const report =
      data?.report ||
      data?.Report ||
      data?.item ||
      data?.Item ||
      data;

    if (!report || Array.isArray(report)) {
      return null;
    }

    return prepareReportForUi(report);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
