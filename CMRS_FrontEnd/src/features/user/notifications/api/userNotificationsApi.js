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

  if (Object.prototype.hasOwnProperty.call(response, 'data')) {
    return response.data;
  }

  return response;
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

  const isNearbyReport = Boolean(
    notification.isNearbyReport ??
      notification.IsNearbyReport ??
      notification.isNearby ??
      notification.IsNearby ??
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

function normalizeCount(response) {
  const data = getResponseData(response);
  const count = Number(data);

  return Number.isFinite(count) ? count : 0;
}

function encode(value) {
  return encodeURIComponent(String(value));
}

export async function getUserNotifications({
  userId,
  type = USER_NOTIFICATION_TYPE.ALL,
  pageNumber = 1,
  pageSize = 10,
}) {
  if (!userId) {
    return normalizeNotificationsResponse(null);
  }

  const params = {
    pageNumber,
    pageSize,
  };

  if (type && type !== USER_NOTIFICATION_TYPE.ALL) {
    params.type = type;
  }

  const response = await get(`/api/Notification/user/${encode(userId)}`, {
    params,
  });

  return normalizeNotificationsResponse(response);
}

export async function getUnreadUserNotifications(userId) {
  if (!userId) return [];

  const response = await get(`/api/Notification/user/${encode(userId)}/unread`);
  const normalizedResponse = normalizeNotificationsResponse(response);

  return normalizedResponse.items;
}

export async function getUnreadUserNotificationsCount(userId) {
  if (!userId) return 0;

  const response = await get(
    `/api/Notification/user/${encode(userId)}/unread/count`
  );

  return normalizeCount(response);
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