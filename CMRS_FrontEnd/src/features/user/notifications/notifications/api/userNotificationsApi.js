import { get, put, remove } from '../../../../shared/services/api/request';

export const USER_NOTIFICATION_TYPE = {
  ALL: 'All',
  REPORT_SUBMITTED: 'ReportSubmitted',
  REPORT_ACCEPTED: 'ReportAccepted',
  REPORT_REJECTED: 'ReportRejected',
  REPORT_ASSIGNED_TO_COMPANY: 'ReportAssignedToCompany',
  REPORT_IN_PROGRESS: 'ReportInProgress',
  REPORT_RESOLVED: 'ReportResolved',
};

function getResponseData(response) {
  if (!response) return null;

  const responseBody = Object.prototype.hasOwnProperty.call(response, 'data')
    ? response.data
    : response;

  if (
    responseBody &&
    Object.prototype.hasOwnProperty.call(responseBody, 'data') &&
    (Object.prototype.hasOwnProperty.call(responseBody, 'success') ||
      Object.prototype.hasOwnProperty.call(responseBody, 'isSuccess') ||
      Object.prototype.hasOwnProperty.call(responseBody, 'message'))
  ) {
    return responseBody.data;
  }

  return responseBody;
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

function normalizeNotification(notification = {}) {
  const notificationId =
    notification.notificationId ||
    notification.NotificationId ||
    notification.id ||
    notification.Id ||
    '';

  const userId = notification.userId || notification.UserId || '';

  const reportId = notification.reportId || notification.ReportId || '';

  const type = notification.type || notification.Type || 'Notification';

  const message = notification.message || notification.Message || '';

  const createdAt =
    notification.createdAt ||
    notification.CreatedAt ||
    notification.createdDate ||
    notification.CreatedDate ||
    '';

  const isRead = notification.isRead ?? notification.IsRead ?? false;

  const targetPage =
    notification.targetPage ||
    notification.TargetPage ||
    notification.reportTargetPage ||
    notification.ReportTargetPage ||
    notification.reportScope ||
    notification.ReportScope ||
    notification.reportSource ||
    notification.ReportSource ||
    notification.source ||
    notification.Source ||
    '';

  const isNearbyReport = normalizeBoolean(
    notification.isNearbyReport ??
      notification.IsNearbyReport ??
      notification.isNearby ??
      notification.IsNearby ??
      false,
    false
  );

  const isFollowedReport = normalizeBoolean(
    notification.isFollowedReport ??
      notification.IsFollowedReport ??
      notification.isFollowed ??
      notification.IsFollowed,
    false
  );

  const isOwnReport = normalizeBoolean(
    notification.isOwnReport ??
      notification.IsOwnReport ??
      notification.isOwner ??
      notification.IsOwner ??
      notification.isReportOwner ??
      notification.IsReportOwner,
    false
  );

  return {
    id: String(notificationId),
    notificationId: String(notificationId),
    userId: String(userId),
    reportId: String(reportId),
    type: String(type),
    message: String(message),
    isRead: Boolean(isRead),
    createdAt,
    targetPage: String(targetPage),
    reportScope: String(targetPage),
    reportSource: String(targetPage),
    isNearbyReport,
    isFollowedReport,
    isOwnReport,
  };
}

function sortNotificationsByNewest(notifications = []) {
  return [...notifications].sort((firstItem, secondItem) => {
    const firstDate = new Date(firstItem.createdAt).getTime() || 0;
    const secondDate = new Date(secondItem.createdAt).getTime() || 0;

    return secondDate - firstDate;
  });
}

function normalizeTypeCounts(typeCounts = []) {
  if (!Array.isArray(typeCounts)) return [];

  return typeCounts.map((item) => ({
    type: item.type || item.Type || '',
    count: Number(item.count ?? item.Count ?? 0),
  }));
}

function normalizeNotificationsResponse(response) {
  const data = getResponseData(response);

  if (Array.isArray(data)) {
    const items = sortNotificationsByNewest(
      data.map(normalizeNotification).filter((notification) => notification.id)
    );

    return {
      items,
      pageNumber: 1,
      pageSize: items.length,
      totalCount: items.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      unreadCount: items.filter((item) => !item.isRead).length,
      typeCounts: [],
    };
  }

  const itemsSource =
    data?.items ||
    data?.Items ||
    data?.notifications ||
    data?.Notifications ||
    [];

  const items = Array.isArray(itemsSource)
    ? sortNotificationsByNewest(
        itemsSource
          .map(normalizeNotification)
          .filter((notification) => notification.id)
      )
    : [];

  const pageNumber = Number(data?.pageNumber ?? data?.PageNumber ?? 1);
  const pageSize = Number(data?.pageSize ?? data?.PageSize ?? items.length);
  const totalCount = Number(data?.totalCount ?? data?.TotalCount ?? items.length);
  const totalPages = Number(
    data?.totalPages ??
      data?.TotalPages ??
      Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize || 1)))
  );

  return {
    items,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: Boolean(data?.hasNextPage ?? data?.HasNextPage ?? false),
    hasPreviousPage: Boolean(
      data?.hasPreviousPage ?? data?.HasPreviousPage ?? false
    ),
    unreadCount: Number(data?.unreadCount ?? data?.UnreadCount ?? 0),
    typeCounts: normalizeTypeCounts(data?.typeCounts || data?.TypeCounts || []),
  };
}

function normalizeImage(image = {}) {
  const imageUrl =
    image.imageUrl ||
    image.ImageUrl ||
    image.url ||
    image.Url ||
    image.src ||
    image.Src ||
    image.path ||
    image.Path ||
    '';

  const thumbnailUrl =
    image.thumbnailUrl ||
    image.ThumbnailUrl ||
    image.thumbUrl ||
    image.ThumbUrl ||
    imageUrl;

  return {
    id: String(image.id || image.Id || image.imageId || image.ImageId || imageUrl),
    imageUrl: String(imageUrl || ''),
    thumbnailUrl: String(thumbnailUrl || imageUrl || ''),
    label: image.label || image.Label || image.type || image.Type || '',
  };
}

function normalizeImages(images = [], fallbackUrl = '') {
  const normalizedImages = Array.isArray(images)
    ? images.map(normalizeImage).filter((image) => image.imageUrl)
    : [];

  if (fallbackUrl && !normalizedImages.some((image) => image.imageUrl === fallbackUrl)) {
    normalizedImages.unshift({
      id: String(fallbackUrl),
      imageUrl: String(fallbackUrl),
      thumbnailUrl: String(fallbackUrl),
      label: 'main',
    });
  }

  return normalizedImages;
}

function normalizeTimeline(timeline = []) {
  if (!Array.isArray(timeline)) return [];

  return timeline.map((item, index) => ({
    id: String(item.id || item.Id || `timeline-${index}`),
    actorType: item.actorType || item.ActorType || item.type || item.Type || 'system',
    actor: item.actor || item.Actor || item.createdBy || item.CreatedBy || '',
    title: item.title || item.Title || item.statusLabel || item.StatusLabel || 'تحديث على البلاغ',
    description:
      item.description ||
      item.Description ||
      item.note ||
      item.Note ||
      item.reason ||
      item.Reason ||
      '',
    createdAt:
      item.createdAt ||
      item.CreatedAt ||
      item.updatedAt ||
      item.UpdatedAt ||
      item.date ||
      item.Date ||
      '',
  }));
}

function normalizeCompanyResponse(companyResponse = null) {
  if (!companyResponse) return null;

  return {
    id: String(companyResponse.id || companyResponse.Id || ''),
    status: companyResponse.status || companyResponse.Status || '',
    statusLabel: companyResponse.statusLabel || companyResponse.StatusLabel || '',
    reviewStatus: companyResponse.reviewStatus || companyResponse.ReviewStatus || '',
    reviewLabel: companyResponse.reviewLabel || companyResponse.ReviewLabel || '',
    companyName: companyResponse.companyName || companyResponse.CompanyName || '',
    submittedAt: companyResponse.submittedAt || companyResponse.SubmittedAt || '',
    note: companyResponse.note || companyResponse.Note || '',
    reason: companyResponse.reason || companyResponse.Reason || '',
    adminNote: companyResponse.adminNote || companyResponse.AdminNote || '',
    images: normalizeImages(companyResponse.images || companyResponse.Images || []),
  };
}

function normalizeReportDetails(report = {}) {
  const fallbackMainImage =
    report.mainImageUrl ||
    report.MainImageUrl ||
    report.coverImage ||
    report.CoverImage ||
    report.imageUrl ||
    report.ImageUrl ||
    '';

  const companyResponse = normalizeCompanyResponse(
    report.companyResponse || report.CompanyResponse || null
  );

  return {
    id: String(report.id || report.Id || report.reportId || report.ReportId || ''),
    title: report.title || report.Title || report.type || report.Type || 'تفاصيل البلاغ',
    type: report.type || report.Type || '',
    issueCategoryId: report.issueCategoryId || report.IssueCategoryId || '',
    issueCategoryName:
      report.issueCategoryName ||
      report.IssueCategoryName ||
      report.categoryLabel ||
      report.CategoryLabel ||
      report.type ||
      report.Type ||
      '',
    description: report.description || report.Description || '',
    status: report.status || report.Status || '',
    statusLabel: report.statusLabel || report.StatusLabel || report.status || report.Status || '—',
    priority: report.priority || report.Priority || '',
    priorityLabel: report.priorityLabel || report.PriorityLabel || report.priority || report.Priority || '—',
    rating: Number(report.rating ?? report.Rating ?? 0),
    votesCount: Number(report.votesCount ?? report.VotesCount ?? 0),
    createdAt: report.createdAt || report.CreatedAt || '',
    location: report.location || report.Location || report.address || report.Address || '',
    city: report.city || report.City || report.governorate || report.Governorate || '',
    position: report.position || report.Position || null,
    assignedCompanyId: report.assignedCompanyId || report.AssignedCompanyId || '',
    assignedCompanyName: report.assignedCompanyName || report.AssignedCompanyName || '',
    concernedCompanyName: report.concernedCompanyName || report.ConcernedCompanyName || '',
    mainImageUrl: String(fallbackMainImage || ''),
    imagesCount: Number(report.imagesCount ?? report.ImagesCount ?? 0),
    rejectionReason: report.rejectionReason || report.RejectionReason || '',
    area: report.area || report.Area || null,
    reporter: report.reporter || report.Reporter || null,
    images: normalizeImages(report.images || report.Images || [], fallbackMainImage),
    companyResponse,
    timeline: normalizeTimeline(report.timeline || report.Timeline || []),
  };
}

function encode(value) {
  return encodeURIComponent(String(value));
}

function normalizeDestinationHint(value = '') {
  return String(value || '')
    .trim()
    .replace(/[\s_\-/\\]+/g, '')
    .toLowerCase();
}

function getDestinationFromNotificationHint(notification = {}) {
  if (notification.isFollowedReport || notification.isNearbyReport) {
    return 'followed-reports';
  }

  if (notification.isOwnReport) {
    return 'my-reports';
  }

  const hint = normalizeDestinationHint(
    notification.targetPage ||
      notification.reportScope ||
      notification.reportSource ||
      notification.source
  );

  if (
    hint.includes('followed') ||
    hint.includes('following') ||
    hint.includes('tracked') ||
    hint.includes('nearby') ||
    hint.includes('متابع')
  ) {
    return 'followed-reports';
  }

  if (
    hint.includes('myreports') ||
    hint.includes('userreports') ||
    hint.includes('ownedreports') ||
    hint.includes('owner') ||
    hint.includes('بلاغاتي')
  ) {
    return 'my-reports';
  }

  return '';
}

function getIsFollowingValue(data) {
  if (typeof data === 'boolean') return data;

  return normalizeBoolean(
    data?.isFollowing ??
      data?.IsFollowing ??
      data?.isFollowedByCurrentUser ??
      data?.IsFollowedByCurrentUser ??
      data?.isFollowed ??
      data?.IsFollowed,
    false
  );
}

export async function resolveNotificationReportDestination(notification = {}) {
  const hintedDestination = getDestinationFromNotificationHint(notification);

  if (hintedDestination) {
    return hintedDestination;
  }

  const reportId = String(notification.reportId || '').trim();

  if (!reportId) {
    return 'my-reports';
  }

  try {
    const response = await get(
      `/api/Follow/${encode(reportId)}/is-following`
    );

    if (getIsFollowingValue(getResponseData(response))) {
      return 'followed-reports';
    }
  } catch {
    // في حالة تعذر فحص المتابعة، نستخدم صفحة بلاغاتي كمسار آمن افتراضي.
  }

  return 'my-reports';
}

export async function getUserNotifications({
  userId,
  type = USER_NOTIFICATION_TYPE.ALL,
  isRead,
  pageNumber = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = 'desc',
}) {
  if (!userId) {
    return normalizeNotificationsResponse(null);
  }

  // Swagger exposes these query params in PascalCase, so keep the same
  // names to match the backend binding exactly.
  const params = {
    PageNumber: pageNumber,
    PageSize: pageSize,
    SortBy: sortBy,
    SortDirection: sortDirection,
  };

  if (type && type !== USER_NOTIFICATION_TYPE.ALL) {
    params.Type = type;
  }

  if (typeof isRead === 'boolean') {
    params.IsRead = isRead;
  }

  const response = await get(`/api/Notification/user/${encode(userId)}`, {
    params,
  });

  return normalizeNotificationsResponse(response);
}

export async function getUnreadUserNotifications(userId) {
  if (!userId) return [];

  const normalizedResponse = await getUserNotifications({
    userId,
    isRead: false,
    pageNumber: 1,
    pageSize: 10,
  });

  return normalizedResponse.items;
}

export async function getUnreadUserNotificationsCount(userId) {
  if (!userId) return 0;

  const normalizedResponse = await getUserNotifications({
    userId,
    pageNumber: 1,
    pageSize: 1,
  });

  return normalizedResponse.unreadCount;
}

export async function getNotificationReportDetails(reportId) {
  if (!reportId) return null;

  const encodedReportId = encode(reportId);

  const candidateEndpoints = [
    `/api/reports/${encodedReportId}`,
    `/api/Report/${encodedReportId}`,
    `/api/Notification/report/${encodedReportId}`,
    `/api/admin/reports/${encodedReportId}`,
  ];

  let lastError = null;

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await get(endpoint);
      const data = getResponseData(response);

      if (data) {
        return normalizeReportDetails(data);
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('تعذر تحميل تفاصيل البلاغ.');
}

export async function markUserNotificationAsRead(notificationId) {
  if (!notificationId) return null;

  return put(`/api/Notification/${encode(notificationId)}/read`);
}

export async function markAllUserNotificationsAsRead(userId) {
  if (!userId) return null;

  return put(`/api/Notification/user/${encode(userId)}/read-all`);
}

export async function deleteUserNotification(notificationId) {
  if (!notificationId) return null;

  return remove(`/api/Notification/${encode(notificationId)}`);
}
