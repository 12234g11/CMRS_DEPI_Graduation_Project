import { get, remove } from '../../../../shared/services/api/request';
import { resolveAssetUrl } from '../../../../shared/services/api/assetUrl';

export const FOLLOWED_REPORT_STATUS_API_VALUES = {
  all: 'all',
  accepted: 'Accepted',
  assigned: 'Assigned',
  inProgress: 'InProgress',
  resolved: 'Resolved',
  unableToExecute: 'UnableToExecute',
  needsCompletion: 'NeedsCompletion',
  pendingAdminApproval: 'PendingAdminApproval',
};

export const FOLLOWED_REPORT_STATUS_FILTER_OPTIONS = [
  { value: FOLLOWED_REPORT_STATUS_API_VALUES.all, label: 'كل الحالات' },
  { value: FOLLOWED_REPORT_STATUS_API_VALUES.accepted, label: 'مقبول' },
  { value: FOLLOWED_REPORT_STATUS_API_VALUES.assigned, label: 'تم التعيين' },
  {
    value: FOLLOWED_REPORT_STATUS_API_VALUES.inProgress,
    label: 'جاري التنفيذ',
  },
  { value: FOLLOWED_REPORT_STATUS_API_VALUES.resolved, label: 'تم الحل' },
  {
    value: FOLLOWED_REPORT_STATUS_API_VALUES.unableToExecute,
    label: 'متعذر التنفيذ',
  },
  {
    value: FOLLOWED_REPORT_STATUS_API_VALUES.needsCompletion,
    label: 'مطلوب استكمال',
  },
  {
    value: FOLLOWED_REPORT_STATUS_API_VALUES.pendingAdminApproval,
    label: 'بانتظار مراجعة الأدمن',
  },
];

const STATUS_LABELS = {
  Accepted: 'مقبول',
  Assigned: 'تم التعيين',
  InProgress: 'جاري التنفيذ',
  Resolved: 'تم الحل',
  UnableToExecute: 'متعذر التنفيذ',
  NeedsCompletion: 'مطلوب استكمال',
  PendingAdminApproval: 'بانتظار مراجعة الأدمن',
};

const STATUS_TONES = {
  Accepted: 'warning',
  Assigned: 'info',
  InProgress: 'info',
  Resolved: 'success',
  UnableToExecute: 'secondary',
  NeedsCompletion: 'warning',
  PendingAdminApproval: 'info',
};

const ALLOWED_STATUS_KEYS = new Set(
  Object.values(FOLLOWED_REPORT_STATUS_API_VALUES).filter(
    (status) => status !== FOLLOWED_REPORT_STATUS_API_VALUES.all
  )
);

function getResponseData(response) {
  return (
    response?.data?.data ||
    response?.data?.Data ||
    response?.data ||
    response?.Data ||
    response
  );
}

function normalizeStatusValue(status = '') {
  return String(status || '')
    .trim()
    .replace(/[\s_-]+/g, '')
    .toLowerCase();
}

export function getFollowedReportStatusKey(status = '') {
  const normalizedStatus = normalizeStatusValue(status);

  if (['accepted', 'approved', 'مقبول', 'تمالقبول'].includes(normalizedStatus)) {
    return FOLLOWED_REPORT_STATUS_API_VALUES.accepted;
  }

  if (['assigned', 'تمالتعيين'].includes(normalizedStatus)) {
    return FOLLOWED_REPORT_STATUS_API_VALUES.assigned;
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
    return FOLLOWED_REPORT_STATUS_API_VALUES.inProgress;
  }

  if (
    [
      'resolved',
      'solved',
      'completed',
      'complete',
      'done',
      'closed',
      'تمالحل',
    ].includes(normalizedStatus)
  ) {
    return FOLLOWED_REPORT_STATUS_API_VALUES.resolved;
  }

  if (
    [
      'unabletoexecute',
      'cannotexecute',
      'executionblocked',
      'failedexecution',
      'executionfailed',
      'متعذرالتنفيذ',
    ].includes(normalizedStatus)
  ) {
    return FOLLOWED_REPORT_STATUS_API_VALUES.unableToExecute;
  }

  if (
    [
      'needscompletion',
      'needcompletion',
      'requiredcompletion',
      'completionrequired',
      'مطلوباستكمال',
    ].includes(normalizedStatus)
  ) {
    return FOLLOWED_REPORT_STATUS_API_VALUES.needsCompletion;
  }

  if (
    [
      'pendingadminapproval',
      'waitingadminapproval',
      'awaitingadminapproval',
      'pendingapproval',
      'بانتظارمراجعةالأدمن',
      'فيانتظارمراجعةالأدمن',
      'بانتظاراعتمادالأدمن',
    ].includes(normalizedStatus)
  ) {
    return FOLLOWED_REPORT_STATUS_API_VALUES.pendingAdminApproval;
  }

  return '';
}

export function getFollowedReportStatusLabel(status = '') {
  const statusKey = getFollowedReportStatusKey(status);
  return STATUS_LABELS[statusKey] || 'غير محدد';
}

export function getFollowedReportStatusTone(status = '') {
  const statusKey = getFollowedReportStatusKey(status);
  return STATUS_TONES[statusKey] || 'warning';
}

function normalizeCount(value, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : fallback;
}

function normalizeCoordinate(value) {
  if (value === null || value === undefined || value === '') return null;

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (['true', 'yes'].includes(normalizedValue)) return true;
    if (['false', 'no'].includes(normalizedValue)) return false;
  }

  return fallback;
}

function normalizeStatusTone(tone, statusKey) {
  const normalizedTone = String(tone || '').trim().toLowerCase();

  if (normalizedTone === 'primary') return 'info';

  if (['success', 'warning', 'info', 'danger', 'secondary'].includes(normalizedTone)) {
    return normalizedTone;
  }

  return STATUS_TONES[statusKey] || 'warning';
}

function normalizeArea(area = {}, report = {}) {
  if (typeof area === 'string') {
    return {
      city: report.city || '',
      address: area,
      detailedAddress: report.detailedAddress || '',
    };
  }

  return {
    city: area?.city || area?.City || report.city || report.City || '',
    address:
      area?.address || area?.Address || report.address || report.Address || '',
    detailedAddress:
      area?.detailedAddress ||
      area?.DetailedAddress ||
      report.detailedAddress ||
      report.DetailedAddress ||
      '',
  };
}

function buildLocationText(area = {}) {
  return [area.city, area.address, area.detailedAddress]
    .filter(Boolean)
    .join(' - ');
}

function normalizeImages(report = {}) {
  const rawImages =
    report.reportImages ||
    report.ReportImages ||
    report.images ||
    report.Images ||
    [];

  if (!Array.isArray(rawImages)) return [];

  return rawImages
    .map((image, index) => {
      if (typeof image === 'string') {
        return {
          imageId: `${image}-${index}`,
          imageUrl: image,
          fullImageUrl: resolveAssetUrl(image),
          thumbnailUrl: resolveAssetUrl(image),
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

      const thumbnailUrl =
        image.thumbnailUrl || image.ThumbnailUrl || imageUrl;

      return {
        ...image,
        imageId:
          image.imageId || image.ImageId || image.id || image.Id || `${imageUrl}-${index}`,
        imageUrl,
        fullImageUrl: resolveAssetUrl(imageUrl),
        thumbnailUrl: resolveAssetUrl(thumbnailUrl),
      };
    })
    .filter((image) => image.fullImageUrl);
}

function prepareReporterPublicInfo(info) {
  if (!info || typeof info !== 'object') return null;

  const statistics = info.statistics || info.Statistics || {};

  return {
    displayName:
      info.displayName || info.DisplayName || info.name || info.Name || 'مستخدم',
    city: info.city || info.City || '',
    trustScore: Number(info.trustScore ?? info.TrustScore ?? 0),
    joinedAt: info.joinedAt || info.JoinedAt || null,
    statistics: {
      totalReports: normalizeCount(
        statistics.totalReports ?? statistics.TotalReports
      ),
      acceptedReports: normalizeCount(
        statistics.acceptedReports ?? statistics.AcceptedReports
      ),
      resolvedReports: normalizeCount(
        statistics.resolvedReports ?? statistics.ResolvedReports
      ),
    },
  };
}

function getHistoryStatusDate(history = [], statusKey, preferLatest = false) {
  const matches = history
    .filter((item) => item?.statusKey === statusKey && item?.changedAt)
    .map((item) => ({
      value: item.changedAt,
      timestamp: new Date(item.changedAt).getTime(),
    }));

  if (!matches.length) return null;

  const validMatches = matches.filter((item) => Number.isFinite(item.timestamp));
  if (!validMatches.length) {
    return preferLatest
      ? matches[matches.length - 1].value
      : matches[0].value;
  }

  validMatches.sort((first, second) => first.timestamp - second.timestamp);
  return preferLatest
    ? validMatches[validMatches.length - 1].value
    : validMatches[0].value;
}

function prepareCompanyPublicInfo(info, report = {}) {
  const source =
    info && typeof info === 'object'
      ? info
      : typeof info === 'string'
        ? { companyName: info }
        : {};

  const nestedCompany =
    source.company ||
    source.Company ||
    source.assignedCompany ||
    source.AssignedCompany ||
    {};

  const companyName =
    source.companyName ||
    source.CompanyName ||
    source.name ||
    source.Name ||
    nestedCompany.companyName ||
    nestedCompany.CompanyName ||
    nestedCompany.name ||
    nestedCompany.Name ||
    report.assignedCompanyName ||
    report.AssignedCompanyName ||
    report.companyName ||
    report.CompanyName ||
    '';

  const specialization =
    source.specialization ||
    source.Specialization ||
    source.category ||
    source.Category ||
    nestedCompany.specialization ||
    nestedCompany.Specialization ||
    nestedCompany.category ||
    nestedCompany.Category ||
    report.companySpecialization ||
    report.CompanySpecialization ||
    report.assignedCompanySpecialization ||
    report.AssignedCompanySpecialization ||
    '';

  if (!companyName && !specialization) return null;

  return {
    companyName,
    specialization,
  };
}


function cleanPublicText(value) {
  const text = String(value ?? '').trim();
  if (!text || ['null', 'undefined', 'string'].includes(text.toLowerCase())) return '';
  return text;
}

function prepareExecutionInfo(info, report = {}, history = [], statusKey = '') {
  const source = info && typeof info === 'object' ? info : {};
  const publicDecision =
    source.adminDecision ||
    source.AdminDecision ||
    report.adminDecision ||
    report.AdminDecision ||
    {};
  const reassignment =
    source.reassignment ||
    source.Reassignment ||
    report.reassignment ||
    report.Reassignment ||
    {};
  const decisionType = cleanPublicText(
    source.decisionType ||
      source.DecisionType ||
      publicDecision.decisionType ||
      publicDecision.DecisionType ||
      report.adminDecisionType ||
      report.AdminDecisionType,
  );
  const publicMessage = cleanPublicText(
    source.userMessage ||
      source.UserMessage ||
      source.publicMessage ||
      source.PublicMessage ||
      source.messageToUser ||
      source.MessageToUser ||
      publicDecision.userMessage ||
      publicDecision.UserMessage ||
      report.userMessage ||
      report.UserMessage ||
      report.publicMessage ||
      report.PublicMessage,
  );

  const assignedAt =
    source.assignedAt ||
    source.AssignedAt ||
    source.assignmentDate ||
    source.AssignmentDate ||
    report.assignedAt ||
    report.AssignedAt ||
    getHistoryStatusDate(history, FOLLOWED_REPORT_STATUS_API_VALUES.assigned) ||
    null;

  const executionStartedAt =
    source.executionStartedAt ||
    source.ExecutionStartedAt ||
    source.startedAt ||
    source.StartedAt ||
    source.startDate ||
    source.StartDate ||
    report.executionStartedAt ||
    report.ExecutionStartedAt ||
    getHistoryStatusDate(history, FOLLOWED_REPORT_STATUS_API_VALUES.inProgress) ||
    null;

  const resolvedAt =
    source.resolvedAt ||
    source.ResolvedAt ||
    source.completedAt ||
    source.CompletedAt ||
    source.closedAt ||
    source.ClosedAt ||
    report.resolvedAt ||
    report.ResolvedAt ||
    getHistoryStatusDate(
      history,
      FOLLOWED_REPORT_STATUS_API_VALUES.resolved,
      true
    ) ||
    null;

  const publicUpdate =
    source.publicUpdate ||
    source.PublicUpdate ||
    source.latestPublicUpdate ||
    source.LatestPublicUpdate ||
    source.statusUpdate ||
    source.StatusUpdate ||
    report.publicUpdate ||
    report.PublicUpdate ||
    '';

  const unableToExecuteReason = cleanPublicText(
    source.unableToExecuteReason ||
      source.UnableToExecuteReason ||
      source.publicUnableToExecuteReason ||
      source.PublicUnableToExecuteReason ||
      source.executionFailureReason ||
      source.ExecutionFailureReason ||
      publicDecision.userMessage ||
      publicDecision.UserMessage ||
      report.unableToExecuteReason ||
      report.UnableToExecuteReason,
  );

  const needsCompletionReason =
    source.needsCompletionReason ||
    source.NeedsCompletionReason ||
    source.completionReason ||
    source.CompletionReason ||
    report.needsCompletionReason ||
    report.NeedsCompletionReason ||
    null;

  const currentStatusChangedAt =
    getHistoryStatusDate(history, statusKey, true) ||
    report.updatedAt ||
    report.UpdatedAt ||
    null;

  const result = {
    assignedAt,
    executionStartedAt,
    resolvedAt,
    currentStatusChangedAt,
    unableToExecuteAt: getHistoryStatusDate(
      history,
      FOLLOWED_REPORT_STATUS_API_VALUES.unableToExecute,
      true
    ),
    needsCompletionAt: getHistoryStatusDate(
      history,
      FOLLOWED_REPORT_STATUS_API_VALUES.needsCompletion,
      true
    ),
    pendingAdminApprovalAt: getHistoryStatusDate(
      history,
      FOLLOWED_REPORT_STATUS_API_VALUES.pendingAdminApproval,
      true
    ),
    publicUpdate,
    publicMessage:
      publicMessage ||
      (statusKey === FOLLOWED_REPORT_STATUS_API_VALUES.unableToExecute
        ? unableToExecuteReason || 'تعذر تنفيذ البلاغ بعد مراجعة الجهة المختصة.'
        : ''),
    decisionType,
    pendingReviewType: cleanPublicText(
      source.pendingReviewType ||
        source.PendingReviewType ||
        report.pendingReviewType ||
        report.PendingReviewType,
    ),
    unableToExecuteReason,
    needsCompletionReason,
    wasReassigned: Boolean(
      reassignment.wasReassigned ??
        reassignment.WasReassigned ??
        source.wasReassigned ??
        source.WasReassigned ??
        report.wasReassigned ??
        report.WasReassigned ??
        String(decisionType).toLowerCase().includes('reassign'),
    ),
    previousCompanyName: cleanPublicText(
      reassignment.previousCompanyName ||
        reassignment.PreviousCompanyName ||
        report.previousAssignedCompanyName ||
        report.PreviousAssignedCompanyName,
    ),
    currentCompanyName: cleanPublicText(
      reassignment.currentCompanyName ||
        reassignment.CurrentCompanyName ||
        reassignment.newCompanyName ||
        reassignment.NewCompanyName ||
        source.currentCompanyName ||
        source.CurrentCompanyName ||
        report.assignedCompanyName ||
        report.AssignedCompanyName,
    ),
    reassignedAt:
      reassignment.reassignedAt ||
      reassignment.ReassignedAt ||
      source.reassignedAt ||
      source.ReassignedAt ||
      report.reassignedAt ||
      report.ReassignedAt ||
      null,
  };

  return Object.values(result).some(Boolean) ? result : null;
}

function prepareStatusHistory(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => {
      const statusKey = getFollowedReportStatusKey(
        item.statusKey || item.StatusKey || item.status || item.Status
      );

      return {
        statusKey,
        statusLabel:
          STATUS_LABELS[statusKey] ||
          item.statusLabel ||
          item.StatusLabel ||
          'غير محدد',
        changedAt: item.changedAt || item.ChangedAt || null,
      };
    })
    .filter((item) => item.statusKey)
    .sort((first, second) => {
      const firstTime = new Date(first.changedAt || 0).getTime();
      const secondTime = new Date(second.changedAt || 0).getTime();

      if (!Number.isFinite(firstTime) || !Number.isFinite(secondTime)) return 0;
      return firstTime - secondTime;
    });
}

export function prepareFollowedReport(report = {}) {
  const reportId =
    report.reportId || report.ReportId || report.id || report.Id || '';

  const rawStatus =
    report.statusKey ||
    report.StatusKey ||
    report.status ||
    report.Status ||
    '';

  const statusKey = getFollowedReportStatusKey(rawStatus);
  const area = normalizeArea(report.area || report.Area || {}, report);
  const reportImages = normalizeImages(report);

  const latitude = normalizeCoordinate(report.latitude ?? report.Latitude);
  const longitude = normalizeCoordinate(report.longitude ?? report.Longitude);
  const hasPosition = latitude !== null && longitude !== null;

  const engagement = report.engagement || report.Engagement || {};
  const statusHistory = prepareStatusHistory(
    report.statusHistory || report.StatusHistory || []
  );

  const rawExecutionInfo =
    report.executionInfo || report.ExecutionInfo || report.execution || report.Execution;

  const rawCompanyInfo =
    report.assignedCompanyPublicInfo ||
    report.AssignedCompanyPublicInfo ||
    report.companyPublicInfo ||
    report.CompanyPublicInfo ||
    report.assignedCompany ||
    report.AssignedCompany ||
    rawExecutionInfo?.assignedCompanyPublicInfo ||
    rawExecutionInfo?.AssignedCompanyPublicInfo ||
    rawExecutionInfo?.company ||
    rawExecutionInfo?.Company;

  let assignedCompanyPublicInfo = prepareCompanyPublicInfo(
    rawCompanyInfo,
    report
  );

  const executionInfo = prepareExecutionInfo(
    rawExecutionInfo,
    report,
    statusHistory,
    statusKey
  );

  if (!assignedCompanyPublicInfo && executionInfo?.currentCompanyName) {
    assignedCompanyPublicInfo = {
      companyName: executionInfo.currentCompanyName,
      specialization: '',
    };
  }

  return {
    ...report,
    reportId,
    id: reportId,
    reportNumber:
      report.reportNumber || report.ReportNumber || reportId || '—',
    title: report.title || report.Title || 'بلاغ بدون عنوان',
    description:
      report.description ||
      report.Description ||
      report.descriptionPreview ||
      report.DescriptionPreview ||
      'لا يوجد وصف متاح لهذا البلاغ.',
    descriptionPreview:
      report.descriptionPreview ||
      report.DescriptionPreview ||
      report.description ||
      report.Description ||
      '',
    issueCategoryId:
      report.issueCategoryId || report.IssueCategoryId || '',
    issueCategoryName:
      report.issueCategoryName ||
      report.IssueCategoryName ||
      report.categoryName ||
      report.CategoryName ||
      'أخرى',
    categoryLabel:
      report.issueCategoryName ||
      report.IssueCategoryName ||
      report.categoryName ||
      report.CategoryName ||
      'أخرى',
    statusKey,
    statusLabel:
      STATUS_LABELS[statusKey] ||
      report.statusLabel ||
      report.StatusLabel ||
      'غير محدد',
    statusTone:
      normalizeStatusTone(
        report.statusTone || report.StatusTone,
        statusKey
      ),
    priorityKey:
      report.priorityKey || report.PriorityKey || report.priority || '',
    priorityLabel:
      report.priorityLabel ||
      report.PriorityLabel ||
      report.priority ||
      report.Priority ||
      'غير محددة',
    area,
    areaText: area.city || '',
    locationText: buildLocationText(area) || 'لم يتم تحديد الموقع',
    latitude: hasPosition ? latitude : null,
    longitude: hasPosition ? longitude : null,
    position: hasPosition ? { lat: latitude, lng: longitude } : null,
    distanceKm:
      report.distanceKm == null && report.DistanceKm == null
        ? null
        : Number(report.distanceKm ?? report.DistanceKm),
    reportImages,
    images: reportImages.map((image) => image.fullImageUrl),
    coverImage:
      resolveAssetUrl(report.coverImageUrl || report.CoverImageUrl || '') ||
      reportImages[0]?.fullImageUrl ||
      '',
    imagesCount: normalizeCount(
      report.imagesCount ?? report.ImagesCount ?? reportImages.length,
      reportImages.length
    ),
    followersCount: normalizeCount(
      engagement.followersCount ??
        engagement.FollowersCount ??
        report.followersCount ??
        report.FollowersCount
    ),
    upvoteCount: normalizeCount(
      engagement.upvoteCount ??
        engagement.UpvoteCount ??
        report.upvoteCount ??
        report.UpvoteCount
    ),
    downvoteCount: normalizeCount(
      engagement.downvoteCount ??
        engagement.DownvoteCount ??
        report.downvoteCount ??
        report.DownvoteCount
    ),
    isFollowedByCurrentUser: normalizeBoolean(
      report.isFollowedByCurrentUser ?? report.IsFollowedByCurrentUser,
      true
    ),
    canCurrentUserUnfollow: normalizeBoolean(
      report.canCurrentUserUnfollow ?? report.CanCurrentUserUnfollow,
      true
    ),
    reporterPublicInfo: prepareReporterPublicInfo(
      report.reporterPublicInfo || report.ReporterPublicInfo
    ),
    assignedCompanyPublicInfo,
    executionInfo,
    statusHistory,
    createdAt: report.createdAt || report.CreatedAt || null,
    updatedAt: report.updatedAt || report.UpdatedAt || null,
    followedAt: report.followedAt || report.FollowedAt || null,
  };
}

function normalizePagination(pagination = {}, fallback = {}) {
  const pageNumber = Number(
    pagination.pageNumber ?? pagination.PageNumber ?? fallback.pageNumber ?? 1
  );
  const pageSize = Number(
    pagination.pageSize ?? pagination.PageSize ?? fallback.pageSize ?? 10
  );
  const totalCount = Number(
    pagination.totalCount ?? pagination.TotalCount ?? 0
  );
  const totalPages = Number(
    pagination.totalPages ??
      pagination.TotalPages ??
      Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)))
  );

  return {
    pageNumber: Number.isFinite(pageNumber) ? pageNumber : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 10,
    totalCount: Number.isFinite(totalCount) ? totalCount : 0,
    totalPages: Number.isFinite(totalPages) ? Math.max(1, totalPages) : 1,
    hasPreviousPage: normalizeBoolean(
      pagination.hasPreviousPage ?? pagination.HasPreviousPage,
      pageNumber > 1
    ),
    hasNextPage: normalizeBoolean(
      pagination.hasNextPage ?? pagination.HasNextPage,
      pageNumber < totalPages
    ),
  };
}

export async function getFollowedReports({
  search = '',
  status = FOLLOWED_REPORT_STATUS_API_VALUES.all,
  pageNumber = 1,
  pageSize = 10,
  sortBy = 'FollowedAt',
  sortDirection = 'desc',
} = {}) {
  const cleanStatus = String(status || '').trim();

  if (
    cleanStatus !== FOLLOWED_REPORT_STATUS_API_VALUES.all &&
    !ALLOWED_STATUS_KEYS.has(cleanStatus)
  ) {
    return {
      items: [],
      pagination: normalizePagination({}, { pageNumber, pageSize }),
    };
  }

  const response = await get('/api/Follow/followed', {
    params: {
      ...(String(search || '').trim()
        ? { search: String(search).trim() }
        : {}),
      status: cleanStatus || FOLLOWED_REPORT_STATUS_API_VALUES.all,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    },
  });

  const data = getResponseData(response) || {};
  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.Items)
      ? data.Items
      : Array.isArray(data)
        ? data
        : [];

  const items = rawItems
    .map(prepareFollowedReport)
    .filter((report) => report.reportId && ALLOWED_STATUS_KEYS.has(report.statusKey));

  return {
    items,
    pagination: normalizePagination(
      data.pagination || data.Pagination || {},
      { pageNumber, pageSize }
    ),
  };
}

export async function getFollowedReportDetails(reportId) {
  if (!reportId) {
    throw new Error('معرّف البلاغ غير متاح.');
  }

  const response = await get(
    `/api/Follow/followed/${encodeURIComponent(reportId)}`
  );

  return prepareFollowedReport(getResponseData(response) || {});
}

export async function unfollowReport(reportId) {
  if (!reportId) {
    throw new Error('معرّف البلاغ غير متاح.');
  }

  const response = await remove(
    `/api/Follow/reports/${encodeURIComponent(reportId)}`
  );

  return getResponseData(response) || {};
}

export async function getIsFollowing(reportId) {
  const response = await get(
    `/api/Follow/${encodeURIComponent(reportId)}/is-following`
  );

  return getResponseData(response) || {};
}

export async function getFollowersCount(reportId) {
  const response = await get(
    `/api/Follow/report/${encodeURIComponent(reportId)}/followers-count`
  );

  return getResponseData(response) || {};
}
