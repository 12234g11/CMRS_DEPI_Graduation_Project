import { get, put, remove } from '../../../../shared/services/api/request';

export const ADMIN_NOTIFICATION_TYPE = {
  ALL: 'All',
  NEW_REPORT_IN_GOVERNORATE: 'NewReport',
  COMPANY_STARTED_EXECUTION: 'CompanyStartedExecution',
  COMPANY_REQUESTED_CLOSURE: 'CompanyRequestedClosure',
  COMPANY_EXECUTION_FAILED: 'CompanyExecutionFailed',
};

export const ADMIN_NOTIFICATION_READ_STATUS = {
  ALL: 'All',
  READ: 'Read',
  UNREAD: 'Unread',
};

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function getResponseBody(response) {
  if (!response) return null;

  if (hasOwn(response, 'data')) {
    return response.data;
  }

  return response;
}

function getResponseData(response) {
  const body = getResponseBody(response);

  if (!body) return null;

  // Handles API wrapper shape:
  // { success: true, message: '...', data: ... }
  if (
    typeof body === 'object' &&
    !Array.isArray(body) &&
    (hasOwn(body, 'success') || hasOwn(body, 'message')) &&
    hasOwn(body, 'data')
  ) {
    return body.data;
  }

  return body;
}

function parseNotificationDate(createdAt) {
  if (!createdAt) return null;

  const rawDate = String(createdAt).trim();

  if (!rawDate) return null;

  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(rawDate);
  const normalizedDate = hasTimezone ? rawDate : `${rawDate}Z`;
  const parsedDate = new Date(normalizedDate);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  const fallbackDate = new Date(rawDate);

  if (!Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  return null;
}

function normalizeNotification(notification = {}) {
  const notificationId =
    notification.notificationId ||
    notification.NotificationId ||
    notification.id ||
    notification.Id ||
    '';

  const recipientId =
    notification.recipientId ||
    notification.RecipientId ||
    notification.adminId ||
    notification.AdminId ||
    notification.userId ||
    notification.UserId ||
    '';

  const recipientType =
    notification.recipientType || notification.RecipientType || 'Admin';

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

  const reportTitle =
    notification.reportTitle ||
    notification.ReportTitle ||
    notification.title ||
    notification.Title ||
    '';

  const area =
    notification.area ||
    notification.Area ||
    notification.city ||
    notification.City ||
    notification.governorate ||
    notification.Governorate ||
    '';

  return {
    id: String(notificationId),
    notificationId: String(notificationId),
    recipientId: String(recipientId),
    recipientType: String(recipientType),
    reportId: String(reportId),
    reportTitle: String(reportTitle),
    area: String(area),
    type: String(type),
    message: String(message),
    isRead: Boolean(isRead),
    createdAt,
  };
}

function sortNotificationsByNewest(notifications = []) {
  return [...notifications].sort((firstItem, secondItem) => {
    const firstDate = parseNotificationDate(firstItem.createdAt)?.getTime() || 0;
    const secondDate =
      parseNotificationDate(secondItem.createdAt)?.getTime() || 0;

    return secondDate - firstDate;
  });
}

function normalizeTypeCounts(typeCounts = []) {
  if (!Array.isArray(typeCounts)) return [];

  return typeCounts.map((item) => ({
    type: String(item.type || item.Type || ''),
    count: Number(item.count ?? item.Count ?? 0),
  }));
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return fallback;
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
      totalPages: items.length ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
      unreadCount: items.filter((item) => !item.isRead).length,
      typeCounts: [],
    };
  }

  const safeData = data && typeof data === 'object' ? data : {};

  const itemsSource =
    safeData.items ||
    safeData.Items ||
    safeData.notifications ||
    safeData.Notifications ||
    [];

  const items = Array.isArray(itemsSource)
    ? sortNotificationsByNewest(
        itemsSource
          .map(normalizeNotification)
          .filter((notification) => notification.id)
      )
    : [];

  const pageNumber = Number(safeData.pageNumber ?? safeData.PageNumber ?? 1);
  const pageSize = Number(safeData.pageSize ?? safeData.PageSize ?? 10);
  const totalCount = Number(
    safeData.totalCount ?? safeData.TotalCount ?? items.length
  );
  const totalPagesFromResponse = Number(
    safeData.totalPages ?? safeData.TotalPages
  );
  const computedTotalPages = Math.ceil(
    totalCount / Math.max(1, pageSize || 1)
  );
  const totalPages = Number.isFinite(totalPagesFromResponse)
    ? totalPagesFromResponse
    : computedTotalPages;

  return {
    items,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: normalizeBoolean(
      safeData.hasNextPage ?? safeData.HasNextPage,
      pageNumber < totalPages
    ),
    hasPreviousPage: normalizeBoolean(
      safeData.hasPreviousPage ?? safeData.HasPreviousPage,
      pageNumber > 1
    ),
    unreadCount: Number(safeData.unreadCount ?? safeData.UnreadCount ?? 0),
    typeCounts: normalizeTypeCounts(
      safeData.typeCounts || safeData.TypeCounts || []
    ),
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

export async function getAdminNotifications({
  adminId,
  type = ADMIN_NOTIFICATION_TYPE.ALL,
  readStatus = ADMIN_NOTIFICATION_READ_STATUS.ALL,
  pageNumber = 1,
  pageSize = 10,
}) {
  if (!adminId) {
    return normalizeNotificationsResponse(null);
  }

  const response = await get(`/api/Notification/admin/${encode(adminId)}/filter`, {
    params: {
      type: type || ADMIN_NOTIFICATION_TYPE.ALL,
      readStatus: readStatus || ADMIN_NOTIFICATION_READ_STATUS.ALL,
      pageNumber,
      pageSize,
    },
  });

  return normalizeNotificationsResponse(response);
}

export async function getUnreadAdminNotificationsCount(adminId) {
  if (!adminId) return 0;

  const response = await get(
    `/api/Notification/admin/${encode(adminId)}/unread/count`
  );

  return normalizeCount(response);
}

export async function markAdminNotificationAsRead(notificationId) {
  if (!notificationId) return null;

  return put(`/api/Notification/${encode(notificationId)}/read`);
}

export async function markAllAdminNotificationsAsRead(adminId) {
  if (!adminId) return null;

  return put(`/api/Notification/admin/${encode(adminId)}/read-all`);
}

export async function deleteAdminNotification(notificationId) {
  if (!notificationId) return null;

  return remove(`/api/Notification/${encode(notificationId)}`);
}
