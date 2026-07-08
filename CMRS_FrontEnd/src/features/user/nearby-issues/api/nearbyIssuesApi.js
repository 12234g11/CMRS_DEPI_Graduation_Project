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

    followersCount: report.followersCount ?? report.FollowersCount ?? 0,
    isFollowedByCurrentUser: Boolean(
      report.isFollowedByCurrentUser ?? report.IsFollowedByCurrentUser
    ),
    canCurrentUserFollow:
      (report.canCurrentUserFollow ?? report.CanCurrentUserFollow) !== false,

    verifyCount: report.verifyCount ?? report.VerifyCount ?? 0,
    isVerifiedByCurrentUser: Boolean(
      report.isVerifiedByCurrentUser ?? report.IsVerifiedByCurrentUser
    ),
    canCurrentUserVerify:
      (report.canCurrentUserVerify ?? report.CanCurrentUserVerify) !== false,

    currentUserVerifyVote:
      report.currentUserVerifyVote ??
      report.CurrentUserVerifyVote ??
      report.verifyVote ??
      report.VerifyVote ??
      report.userVerifyVote ??
      report.UserVerifyVote ??
      report.userVote ??
      report.UserVote ??
      null,

    ratingCount: report.ratingCount ?? report.RatingCount ?? 0,
    isRatedByCurrentUser: Boolean(
      report.isRatedByCurrentUser ?? report.IsRatedByCurrentUser
    ),
    canCurrentUserRate:
      (report.canCurrentUserRate ?? report.CanCurrentUserRate) !== false,

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

export async function rateReport(reportId) {
  const response = await post(
    `/api/Report/${encodeURIComponent(reportId)}/ratings`,
    buildReportActionBody(reportId),
    JSON_BODY_CONFIG
  );

  return getResponseData(response);
}

export async function unrateReport(reportId) {
  const response = await remove(
    `/api/Report/${encodeURIComponent(reportId)}/ratings`,
    buildDeleteConfig(reportId)
  );

  return getResponseData(response);
}