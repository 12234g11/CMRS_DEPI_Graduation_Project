import { get, post, remove } from '../../../../shared/services/api/request';
import { resolveAssetUrl } from '../../../../shared/services/api/assetUrl';

const JSON_BODY_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const STATUS_TONE = {
  UnderReview: 'warning',
  InProgress: 'info',
  Resolved: 'success',
};

const STATUS_LABEL = {
  UnderReview: 'قيد المراجعة',
  InProgress: 'جاري الحل',
  Resolved: 'تم الحل',
};

function getResponseData(response) {
  return response?.data || response?.Data || response;
}

function getStatusTone(status) {
  return STATUS_TONE[status] || 'warning';
}

function getStatusLabel(report = {}) {
  return report.statusLabel || STATUS_LABEL[report.status] || 'قيد المراجعة';
}

function buildAddress(area = {}) {
  return [area.city, area.address, area.detailedAddress]
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

function prepareNearbyReport(report = {}) {
  const reportImages = Array.isArray(report.reportImages)
    ? report.reportImages.map((image) => ({
        ...image,
        fullImageUrl: resolveAssetUrl(image.imageUrl || ''),
      }))
    : [];

  const address = buildAddress(report.area || {});
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);
  const statusTone = getStatusTone(report.status);
  const categoryLabel = report.issueCategoryName || 'أخرى';

  return {
    ...report,

    id: report.reportId,
    title: report.title || 'بلاغ قريب منك',
    description: report.description || 'لا يوجد وصف متاح لهذا البلاغ.',
    category: categoryLabel,
    typeLabel: categoryLabel,

    area: report.area?.city || report.area?.address || 'موقع قريب',
    address: address || 'لم يتم تحديد العنوان',

    distanceLabel: buildDistanceLabel(report.distanceKm),
    date: report.reportedAt || report.createdAt,

    statusLabel: getStatusLabel(report),
    tone: statusTone,
    statusTone,

    reportImages,
    images: reportImages.map((image) => image.fullImageUrl).filter(Boolean),
    coverImage: reportImages[0]?.fullImageUrl || '',

    followersCount: report.followersCount ?? 0,
    isFollowedByCurrentUser: Boolean(report.isFollowedByCurrentUser),
    canCurrentUserFollow: report.canCurrentUserFollow !== false,

    verifyCount: report.verifyCount ?? 0,
    isVerifiedByCurrentUser: Boolean(report.isVerifiedByCurrentUser),
    canCurrentUserVerify: report.canCurrentUserVerify !== false,

    // لو الباك رجع قيمة vote الحالية للمستخدم هنستخدمها.
    currentUserVerifyVote:
      report.currentUserVerifyVote ??
      report.verifyVote ??
      report.userVerifyVote ??
      report.userVote ??
      null,

    ratingCount: report.ratingCount ?? 0,
    isRatedByCurrentUser: Boolean(report.isRatedByCurrentUser),
    canCurrentUserRate: report.canCurrentUserRate !== false,

    position:
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? {
            lat: latitude,
            lng: longitude,
          }
        : null,
  };
}

export async function getNearbyReports({ lat, lng, pageNumber = 1 } = {}) {
  if (lat == null || lng == null) {
    return [];
  }

  const response = await get('/api/Report/nearby', {
    params: {
      lat,
      lng,
      pageNumber,
    },
  });

  const data = getResponseData(response);
  const reports = Array.isArray(data) ? data : data?.items || [];

  return reports
    .map(prepareNearbyReport)
    .filter((report) => report.id && report.position);
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