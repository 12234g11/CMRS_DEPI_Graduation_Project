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
  resolved: 'Resolved',
};

export const NEARBY_VISIBLE_STATUS_VALUES = [
  NEARBY_REPORT_STATUS_API_VALUES.accepted,
  NEARBY_REPORT_STATUS_API_VALUES.assigned,
  NEARBY_REPORT_STATUS_API_VALUES.inProgress,
  NEARBY_REPORT_STATUS_API_VALUES.resolved,
];

export const NEARBY_STATUS_FILTER_OPTIONS = [
  { label: 'كل الحالات', value: NEARBY_REPORT_STATUS_API_VALUES.all },
  { label: 'مقبول', value: NEARBY_REPORT_STATUS_API_VALUES.accepted },
  { label: 'تم التعيين', value: NEARBY_REPORT_STATUS_API_VALUES.assigned },
  { label: 'جاري التنفيذ', value: NEARBY_REPORT_STATUS_API_VALUES.inProgress },
  { label: 'تم الحل', value: NEARBY_REPORT_STATUS_API_VALUES.resolved },
];

export const NEARBY_STATUS_LEGEND_ITEMS = [
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.accepted,
    label: 'مقبول',
    description: 'بلاغ تمت مراجعته والتأكد أنه صالح للظهور للمستخدمين القريبين.',
    dotClassName: 'accepted',
  },
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.assigned,
    label: 'تم التعيين',
    description: 'تم إسناد البلاغ إلى شركة أو جهة مسؤولة عن التنفيذ.',
    dotClassName: 'assigned',
  },
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.inProgress,
    label: 'جاري التنفيذ',
    description: 'الجهة المسؤولة بدأت التعامل مع البلاغ وتحديث حالته.',
    dotClassName: 'in-progress',
  },
  {
    id: NEARBY_REPORT_STATUS_API_VALUES.resolved,
    label: 'تم الحل',
    description: 'تم إنهاء المشكلة، ويمكن تقييم جودة الحل خلال فترة الظهور.',
    dotClassName: 'resolved',
  },
];

const STATUS_TONE = {
  Accepted: 'warning',
  Assigned: 'info',
  InProgress: 'info',
  Resolved: 'success',
};

const STATUS_LABEL = {
  Accepted: 'مقبول',
  Assigned: 'تم التعيين',
  InProgress: 'جاري التنفيذ',
  Resolved: 'تم الحل',
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

  return '';
}

function isVisibleNearbyStatus(status = '') {
  return NEARBY_VISIBLE_STATUS_VALUES.includes(getNearbyReportStatusKey(status));
}

function getStatusTone(status) {
  const statusKey = getNearbyReportStatusKey(status);

  return STATUS_TONE[statusKey] || 'warning';
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
export async function followReport(reportId) {
  const response = await post(
    `/api/Report/${encodeURIComponent(reportId)}/follow`,
    buildReportActionBody(reportId),
    JSON_BODY_CONFIG
  );

  return getResponseData(response);
}

export async function unfollowReport(reportId) {
  const response = await remove(
    `/api/Report/${encodeURIComponent(reportId)}/follow`,
    buildDeleteConfig(reportId)
  );

  return getResponseData(response);
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

