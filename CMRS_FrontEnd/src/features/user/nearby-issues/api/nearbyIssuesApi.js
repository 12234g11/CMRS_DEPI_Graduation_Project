import { get, post, remove } from '../../../../shared/services/api/request';
import { resolveAssetUrl } from '../../../../shared/services/api/assetUrl';

const JSON_BODY_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const NEARBY_REPORT_STATUS_API_VALUES = {
  all: 'all',
  accepted: 'Accepted',
  assigned: 'Assigned',
  inProgress: 'InProgress',
  pendingAdminApproval: 'PendingAdminApproval',
  needsCompletion: 'NeedsCompletion',
  resolved: 'Resolved',
  unableToExecute: 'UnableToExecute',
};

export const NEARBY_VISIBLE_STATUS_VALUES = [
  NEARBY_REPORT_STATUS_API_VALUES.accepted,
  NEARBY_REPORT_STATUS_API_VALUES.assigned,
  NEARBY_REPORT_STATUS_API_VALUES.inProgress,
  NEARBY_REPORT_STATUS_API_VALUES.pendingAdminApproval,
  NEARBY_REPORT_STATUS_API_VALUES.needsCompletion,
  NEARBY_REPORT_STATUS_API_VALUES.resolved,
  NEARBY_REPORT_STATUS_API_VALUES.unableToExecute,
];

export const NEARBY_STATUS_FILTER_OPTIONS = [
  {
    label: 'كل الحالات',
    value: NEARBY_REPORT_STATUS_API_VALUES.all,
    dotClassName: 'all',
  },
  {
    label: 'مقبول',
    value: NEARBY_REPORT_STATUS_API_VALUES.accepted,
    dotClassName: 'accepted',
  },
  {
    label: 'تم التعيين',
    value: NEARBY_REPORT_STATUS_API_VALUES.assigned,
    dotClassName: 'assigned',
  },
  {
    label: 'جاري التنفيذ',
    value: NEARBY_REPORT_STATUS_API_VALUES.inProgress,
    dotClassName: 'in-progress',
  },
  {
    label: 'بانتظار مراجعة الأدمن',
    value: NEARBY_REPORT_STATUS_API_VALUES.pendingAdminApproval,
    dotClassName: 'pending-admin-approval',
  },
  {
    label: 'مطلوب استكمال',
    value: NEARBY_REPORT_STATUS_API_VALUES.needsCompletion,
    dotClassName: 'needs-completion',
  },
  {
    label: 'تم الحل',
    value: NEARBY_REPORT_STATUS_API_VALUES.resolved,
    dotClassName: 'resolved',
  },
  {
    label: 'متعذر التنفيذ',
    value: NEARBY_REPORT_STATUS_API_VALUES.unableToExecute,
    dotClassName: 'unable-to-execute',
  },
];

export const NEARBY_STATUS_LEGEND_ITEMS = [
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.accepted,
    label: 'مقبول',
    description:
      'تمت مراجعة البلاغ واعتماده، وأصبح صالحًا للظهور للمستخدمين القريبين.',
    dotClassName: 'accepted',
  },
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.assigned,
    label: 'تم التعيين',
    description:
      'تم إسناد البلاغ إلى شركة أو جهة مسؤولة، في انتظار بدء أعمال التنفيذ.',
    dotClassName: 'assigned',
  },
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.inProgress,
    label: 'جاري التنفيذ',
    description:
      'بدأت الجهة المسؤولة العمل على البلاغ، ويتم تحديث حالة التنفيذ حتى الانتهاء.',
    dotClassName: 'in-progress',
  },
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.pendingAdminApproval,
    label: 'بانتظار مراجعة الأدمن',
    description:
      'أرسلت الجهة نتيجة التنفيذ أو طلب الإغلاق، والحالة تنتظر قرار الأدمن.',
    dotClassName: 'pending-admin-approval',
  },
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.needsCompletion,
    label: 'مطلوب استكمال',
    description:
      'طلب الأدمن استكمال أعمال أو بيانات إضافية قبل اعتماد نتيجة التنفيذ.',
    dotClassName: 'needs-completion',
  },
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.resolved,
    label: 'تم الحل',
    description:
      'تم اعتماد اكتمال التنفيذ وإغلاق البلاغ بعد التأكد من معالجة المشكلة.',
    dotClassName: 'resolved',
  },
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.unableToExecute,
    label: 'متعذر التنفيذ',
    description:
      'تعذر تنفيذ الحل بسبب عائق مسجل، وتم توضيح الحالة للمستخدمين القريبين.',
    dotClassName: 'unable-to-execute',
  },
];

const STATUS_TONE = {
  Accepted: 'warning',
  Assigned: 'info',
  InProgress: 'info',
  PendingAdminApproval: 'warning',
  NeedsCompletion: 'warning',
  Resolved: 'success',
  UnableToExecute: 'secondary',
};

const STATUS_COLOR_CLASS = {
  Accepted: 'accepted',
  Assigned: 'assigned',
  InProgress: 'in-progress',
  PendingAdminApproval: 'pending-admin-approval',
  NeedsCompletion: 'needs-completion',
  Resolved: 'resolved',
  UnableToExecute: 'unable-to-execute',
};

const STATUS_LABEL = {
  Accepted: 'مقبول',
  Assigned: 'تم التعيين',
  InProgress: 'جاري التنفيذ',
  PendingAdminApproval: 'بانتظار مراجعة الأدمن',
  NeedsCompletion: 'مطلوب استكمال',
  Resolved: 'تم الحل',
  UnableToExecute: 'متعذر التنفيذ',
};

function normalizeStatusValue(status = '') {
  return String(status || '')
    .trim()
    .replace(/[\s_-]+/g, '')
    .toLowerCase();
}

function getResponseData(response) {
  return (
    response?.data?.data ||
    response?.data?.Data ||
    response?.data ||
    response?.Data ||
    response
  );
}

export function getNearbyReportStatusKey(status = '') {
  const normalizedStatus = normalizeStatusValue(status);

  if (['accepted', 'approved', 'مقبول', 'تمالقبول'].includes(normalizedStatus)) {
    return NEARBY_REPORT_STATUS_API_VALUES.accepted;
  }

  if (['assigned', 'تمالتعيين'].includes(normalizedStatus)) {
    return NEARBY_REPORT_STATUS_API_VALUES.assigned;
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
    return NEARBY_REPORT_STATUS_API_VALUES.inProgress;
  }

  if (
    [
      'pendingadminapproval',
      'pendingadminreview',
      'pendingreview',
      'waitingadminapproval',
      'بانتظارمراجعةالأدمن',
      'بانتظارمراجعةالادمن',
    ].includes(normalizedStatus)
  ) {
    return NEARBY_REPORT_STATUS_API_VALUES.pendingAdminApproval;
  }

  if (
    [
      'needscompletion',
      'needcompletion',
      'requirescompletion',
      'requestcompletion',
      'مطلوباستكمال',
    ].includes(normalizedStatus)
  ) {
    return NEARBY_REPORT_STATUS_API_VALUES.needsCompletion;
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
    return NEARBY_REPORT_STATUS_API_VALUES.resolved;
  }

  if (
    [
      'unabletoexecute',
      'cannotexecute',
      'cannotfix',
      'executionfailed',
      'failedexecution',
      'متعذرالتنفيذ',
    ].includes(normalizedStatus)
  ) {
    return NEARBY_REPORT_STATUS_API_VALUES.unableToExecute;
  }

  return '';
}

function isVisibleNearbyStatus(status = '') {
  return NEARBY_VISIBLE_STATUS_VALUES.includes(getNearbyReportStatusKey(status));
}

function getStatusTone(status) {
  const statusKey = getNearbyReportStatusKey(status);

  return STATUS_TONE[statusKey] || 'warning';
}

function getStatusColorClass(status) {
  const statusKey = getNearbyReportStatusKey(status);

  return STATUS_COLOR_CLASS[statusKey] || 'accepted';
}

function getStatusLabel(report = {}) {
  const statusKey = getNearbyReportStatusKey(
    report.status || report.Status || report.statusKey || report.StatusKey
  );

  return (
    report.statusLabel ||
    report.StatusLabel ||
    STATUS_LABEL[statusKey] ||
    'غير محدد'
  );
}

function buildAddress(area = {}) {
  return [
    area.city || area.City,
    area.address || area.Address,
    area.detailedAddress || area.DetailedAddress,
  ]
    .filter(Boolean)
    .join(' - ');
}

function buildDistanceLabel(distanceKm) {
  const distance = Number(distanceKm);

  if (!Number.isFinite(distance)) return '';

  return `${distance.toFixed(distance < 1 ? 2 : 1)} كم`;
}

function buildReportActionBody(reportId, extra = {}) {
  return {
    reportId,
    ...extra,
  };
}

function buildDeleteConfig(reportId, extra = {}) {
  return {
    ...JSON_BODY_CONFIG,
    data: buildReportActionBody(reportId, extra),
  };
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

function normalizeCount(value, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, numberValue);
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (['true', 'yes', 'up', 'upvote', 'correct'].includes(normalizedValue)) {
      return true;
    }

    if (['false', 'no', 'down', 'downvote', 'incorrect'].includes(normalizedValue)) {
      return false;
    }
  }

  return fallback;
}

function normalizeVerifyVote(value) {
  if (value == null || value === '') return null;

  if (typeof value === 'boolean') return value ? 1 : -1;

  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    if (numericValue === -1) return -1;
    if (numericValue === 1) return 1;
    return null;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (
    [
      '1',
      '+1',
      'up',
      'upvote',
      'true',
      'valid',
      'correct',
      'right',
      'positive',
      'صحيح',
      'بلاغ صحيح',
    ].includes(normalizedValue)
  ) {
    return 1;
  }

  if (
    [
      '-1',
      'down',
      'downvote',
      'false',
      'invalid',
      'incorrect',
      'wrong',
      'negative',
      'غير صحيح',
      'بلاغ غير صحيح',
    ].includes(normalizedValue)
  ) {
    return -1;
  }

  return null;
}

function getCurrentUserVerifyVote(report = {}) {
  const explicitVote = normalizeVerifyVote(
    report.currentUserVerifyVote ??
      report.CurrentUserVerifyVote ??
      report.verifyVote ??
      report.VerifyVote ??
      report.userVerifyVote ??
      report.UserVerifyVote ??
      report.userVote ??
      report.UserVote
  );

  if (explicitVote) return explicitVote;

  const isDownvotedByCurrentUser = normalizeBoolean(
    report.isDownvotedByCurrentUser ??
      report.IsDownvotedByCurrentUser ??
      report.isRejectedByCurrentUser ??
      report.IsRejectedByCurrentUser,
    false
  );

  if (isDownvotedByCurrentUser) return -1;

  const isUpvotedByCurrentUser = normalizeBoolean(
    report.isUpvotedByCurrentUser ??
      report.IsUpvotedByCurrentUser ??
      report.isConfirmedByCurrentUser ??
      report.IsConfirmedByCurrentUser,
    false
  );

  if (isUpvotedByCurrentUser) return 1;

  const isVerifiedByCurrentUser = normalizeBoolean(
    report.isVerifiedByCurrentUser ?? report.IsVerifiedByCurrentUser,
    false
  );

  return isVerifiedByCurrentUser ? 1 : null;
}


function cleanPublicText(value) {
  const text = String(value ?? '').trim();
  if (!text || ['null', 'undefined', 'string'].includes(text.toLowerCase())) return '';
  return text;
}

function preparePublicExecutionInfo(report = {}, statusKey = '') {
  const publicDecision =
    report.publicDecision ||
    report.PublicDecision ||
    report.publicExecutionInfo ||
    report.PublicExecutionInfo ||
    report.executionInfo?.publicDecision ||
    report.ExecutionInfo?.PublicDecision ||
    report.adminDecision ||
    report.AdminDecision ||
    {};
  const executionSource = report.executionInfo || report.ExecutionInfo || {};
  const decisionType = cleanPublicText(
    publicDecision.decisionType ||
      publicDecision.DecisionType ||
      executionSource.decisionType ||
      executionSource.DecisionType ||
      report.adminDecisionType ||
      report.AdminDecisionType,
  );
  const normalizedDecision = normalizeStatusValue(decisionType);
  const isUnableDecision =
    statusKey === NEARBY_REPORT_STATUS_API_VALUES.unableToExecute ||
    normalizedDecision.includes('acceptcannotfix') ||
    normalizedDecision.includes('cannotfixaccepted');
  const publicMessage = isUnableDecision
    ? cleanPublicText(
        publicDecision.message ||
          publicDecision.Message ||
          publicDecision.publicUserMessage ||
          publicDecision.PublicUserMessage ||
          publicDecision.userMessage ||
          publicDecision.UserMessage ||
          executionSource.publicUpdate ||
          executionSource.PublicUpdate ||
          executionSource.publicMessage ||
          executionSource.PublicMessage ||
          report.publicMessage ||
          report.PublicMessage,
      )
    : '';
  const unableToExecuteReason = isUnableDecision
    ? cleanPublicText(
        publicDecision.unableToExecuteReason ||
          publicDecision.UnableToExecuteReason ||
          publicDecision.publicUnableReason ||
          publicDecision.PublicUnableReason ||
          executionSource.unableToExecuteReason ||
          executionSource.UnableToExecuteReason ||
          report.unableToExecuteReason ||
          report.UnableToExecuteReason,
      )
    : '';
  const decidedAt =
    publicDecision.decidedAt ||
    publicDecision.DecidedAt ||
    executionSource.unableToExecuteAt ||
    executionSource.UnableToExecuteAt ||
    null;
  const normalizedPublicDecision = isUnableDecision
    ? {
        decisionType: decisionType || 'accept_cannot_fix',
        decisionLabel: cleanPublicText(
          publicDecision.decisionLabel ||
            publicDecision.DecisionLabel ||
            'تم إغلاق البلاغ لتعذر التنفيذ',
        ),
        message: publicMessage,
        unableToExecuteReason,
        decidedAt,
        isFinal: Boolean(publicDecision.isFinal ?? publicDecision.IsFinal ?? true),
      }
    : null;

  return {
    decisionType: normalizedPublicDecision?.decisionType || '',
    decisionLabel: normalizedPublicDecision?.decisionLabel || '',
    publicMessage,
    unableToExecuteReason,
    publicDecision: normalizedPublicDecision,
    unableToExecuteAt: decidedAt,
    isFinal: normalizedPublicDecision?.isFinal || false,
    pendingReviewType: cleanPublicText(
      executionSource.pendingReviewType ||
        executionSource.PendingReviewType ||
        report.pendingReviewType ||
        report.PendingReviewType,
    ),
    wasReassigned: false,
    previousCompanyName: '',
    reassignedAt: null,
    currentCompanyName: cleanPublicText(
      report.assignedCompanyName ||
        report.AssignedCompanyName ||
        report.concernedCompanyName ||
        report.ConcernedCompanyName,
    ),
  };
}

function prepareNearbyReport(report = {}) {
  const reportImages = getReportImages(report);

  const address = buildAddress(report.area || report.Area || {});
  const latitude = Number(report.latitude ?? report.Latitude);
  const longitude = Number(report.longitude ?? report.Longitude);

  const rawStatus =
    report.status ||
    report.Status ||
    report.statusKey ||
    report.StatusKey ||
    '';

  const statusKey = getNearbyReportStatusKey(rawStatus);
  const statusTone = getStatusTone(statusKey);
  const executionInfo = preparePublicExecutionInfo(report, statusKey);

  const categoryLabel =
    report.issueCategoryName ||
    report.IssueCategoryName ||
    report.categoryLabel ||
    report.CategoryLabel ||
    report.categoryName ||
    report.CategoryName ||
    'أخرى';

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
      'بلاغ قريب منك',

    description:
      report.description ||
      report.Description ||
      'لا يوجد وصف متاح لهذا البلاغ.',

    category: categoryLabel,
    typeLabel: categoryLabel,
    issueCategoryName: categoryLabel,

    status: statusKey || rawStatus,
    statusKey,
    statusLabel: getStatusLabel(report),
    tone: statusTone,
    statusTone,
    statusColorClass: getStatusColorClass(statusKey),
    executionInfo,
    publicDecision: executionInfo.publicDecision,
    pendingReviewType: executionInfo.pendingReviewType,
    userMessage: executionInfo.publicMessage,
    assignedCompanyName: executionInfo.currentCompanyName,

    area:
      report.area?.city ||
      report.Area?.City ||
      report.area?.address ||
      report.Area?.Address ||
      'موقع قريب',

    address: address || report.address || report.Address || 'لم يتم تحديد العنوان',

    distanceLabel: buildDistanceLabel(report.distanceKm ?? report.DistanceKm),
    date:
      report.reportedAt ||
      report.ReportedAt ||
      report.createdAt ||
      report.CreatedAt,

    reportedAt: report.reportedAt || report.ReportedAt,
    createdAt: report.createdAt || report.CreatedAt,

    reportImages,
    images: reportImages.map((image) => image.fullImageUrl).filter(Boolean),
    coverImage: reportImages[0]?.fullImageUrl || '',

    followersCount: normalizeCount(report.followersCount ?? report.FollowersCount),
    isFollowedByCurrentUser: normalizeBoolean(
      report.isFollowedByCurrentUser ?? report.IsFollowedByCurrentUser,
      false
    ),
    canCurrentUserFollow: normalizeBoolean(
      report.canCurrentUserFollow ?? report.CanCurrentUserFollow,
      true
    ),

    verifyCount: normalizeCount(
      report.verifyCount ??
        report.VerifyCount ??
        Number(report.upvoteCount ?? report.UpvoteCount ?? 0) +
          Number(report.downvoteCount ?? report.DownvoteCount ?? 0)
    ),
    upvoteCount: normalizeCount(
      report.upvoteCount ??
        report.UpvoteCount ??
        report.validReportCount ??
        report.ValidReportCount ??
        report.correctReportCount ??
        report.CorrectReportCount
    ),
    downvoteCount: normalizeCount(
      report.downvoteCount ??
        report.DownvoteCount ??
        report.invalidReportCount ??
        report.InvalidReportCount ??
        report.wrongReportCount ??
        report.WrongReportCount
    ),
    isVerifiedByCurrentUser: normalizeBoolean(
      report.isVerifiedByCurrentUser ?? report.IsVerifiedByCurrentUser,
      false
    ),
    canCurrentUserVerify: normalizeBoolean(
      report.canCurrentUserVerify ?? report.CanCurrentUserVerify,
      true
    ),

    currentUserVerifyVote: getCurrentUserVerifyVote(report),

    ownerUserName:
      report.ownerUserName ||
      report.OwnerUserName ||
      report.userName ||
      report.UserName ||
      '—',

    priorityLabel:
      report.priorityLabel ||
      report.PriorityLabel ||
      report.severityLabel ||
      report.SeverityLabel ||
      report.priority ||
      report.Priority ||
      '—',

    position:
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? {
            lat: latitude,
            lng: longitude,
          }
        : null,
  };
}

export async function getNearbyReports({
  lat,
  lng,
  pageNumber = 1,
  status = NEARBY_REPORT_STATUS_API_VALUES.all,
} = {}) {
  if (lat == null || lng == null) {
    return [];
  }

  const cleanStatus = String(status || '').trim();

  const isFilteringByStatus =
    cleanStatus && cleanStatus !== NEARBY_REPORT_STATUS_API_VALUES.all;

  if (isFilteringByStatus && !NEARBY_VISIBLE_STATUS_VALUES.includes(cleanStatus)) {
    return [];
  }

  const endpoint = isFilteringByStatus
    ? '/api/Report/nearby/status'
    : '/api/Report/nearby';

  const response = await get(endpoint, {
    params: {
      lat,
      lng,
      pageNumber,
      ...(isFilteringByStatus ? { status: cleanStatus } : {}),
    },
  });

  const data = getResponseData(response);

  const reports = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.Items)
        ? data.Items
        : [];

  const preparedReports = reports
    .map(prepareNearbyReport)
    .filter((report) => report.id && report.position)
    .filter((report) => isVisibleNearbyStatus(report.statusKey || report.status));

  if (!isFilteringByStatus) {
    return preparedReports;
  }

  return preparedReports.filter(
    (report) =>
      getNearbyReportStatusKey(report.statusKey || report.status) === cleanStatus
  );
}
export async function followReport(
  reportId,
  { currentLatitude, currentLongitude } = {}
) {
  if (!reportId) {
    throw new Error('معرّف البلاغ غير متاح.');
  }

  const latitude = Number(currentLatitude);
  const longitude = Number(currentLongitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('يجب تحديد موقعك الحالي قبل متابعة البلاغ.');
  }

  const response = await post(
    `/api/Follow/reports/${encodeURIComponent(reportId)}`,
    {
      currentLatitude: latitude,
      currentLongitude: longitude,
    },
    JSON_BODY_CONFIG
  );

  return getResponseData(response) || {};
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

export async function verifyReport(reportId, vote = 1) {
  const normalizedVote = Number(vote) === -1 ? -1 : 1;

  const response = await post(
    `/api/Report/${encodeURIComponent(reportId)}/verify`,
    buildReportActionBody(reportId, {
      vote: normalizedVote,
    }),
    JSON_BODY_CONFIG
  );

  return getResponseData(response);
}

export async function unverifyReport(reportId) {
  const response = await remove(
    `/api/Report/${encodeURIComponent(reportId)}/verify`,
    buildDeleteConfig(reportId)
  );

  return getResponseData(response);
}

