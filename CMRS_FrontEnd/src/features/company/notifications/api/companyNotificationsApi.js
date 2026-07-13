import {
  COMPANY_NOTIFICATION_READ_FILTERS,
  COMPANY_NOTIFICATION_TYPES,
} from '../constants/companyNotifications';

const DEFAULT_API_BASE_URL = 'https://balaghasp.runasp.net';

function getApiBaseUrl() {
  const configuredUrl = import.meta.env?.VITE_API_BASE_URL?.trim();
  return (configuredUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

function getAccessToken() {
  return window.localStorage.getItem('access_token')?.trim() || '';
}

function createApiError(message, status, payload) {
  const error = new Error(message || 'حدث خطأ غير متوقع أثناء تنفيذ الطلب.');
  error.status = status;
  error.payload = payload;
  return error;
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    return text ? { message: text } : null;
  }

  return response.json();
}

async function apiRequest(path, options = {}) {
  const token = getAccessToken();

  if (!token) {
    throw createApiError('برجاء تسجيل الدخول أولًا.', 401, null);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.title ||
      (response.status === 401
        ? 'انتهت صلاحية جلسة تسجيل الدخول.'
        : 'تعذر تنفيذ الطلب، برجاء المحاولة مرة أخرى.');

    if (response.status === 401) {
      window.localStorage.removeItem('access_token');
    }

    throw createApiError(message, response.status, payload);
  }

  return payload;
}

function normalizeType(type) {
  const value = String(type || '').trim();
  const normalized = value.toLowerCase().replace(/[\s-]+/g, '_');

  const aliases = {
    reportassigned: COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED,
    report_assigned: COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED,
    reportassignedtocompany: COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED,
    report_assigned_to_company: COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED,
    solutionaccepted: COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED,
    solution_accepted: COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED,
    cannotfixaccepted: COMPANY_NOTIFICATION_TYPES.CANNOT_FIX_ACCEPTED,
    cannot_fix_accepted: COMPANY_NOTIFICATION_TYPES.CANNOT_FIX_ACCEPTED,
    completionrequested: COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED,
    completion_requested: COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED,
    needcompletion: COMPANY_NOTIFICATION_TYPES.NEEDS_COMPLETION,
    needscompletion: COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED,
    needs_completion: COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED,
    adminfeedback: COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK,
    admin_feedback: COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK,
    system: COMPANY_NOTIFICATION_TYPES.SYSTEM,
  };

  return aliases[normalized.replace(/_/g, '')] || aliases[normalized] || normalized;
}

function getDefaultTone(type) {
  switch (type) {
    case COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED:
    case COMPANY_NOTIFICATION_TYPES.CANNOT_FIX_ACCEPTED:
      return 'success';
    case COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED:
      return 'warning';
    case COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK:
      return 'info';
    case COMPANY_NOTIFICATION_TYPES.SYSTEM:
      return 'neutral';
    default:
      return 'primary';
  }
}

function getDefaultTypeLabel(type) {
  switch (type) {
    case COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED:
      return 'بلاغ مسند';
    case COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED:
      return 'حل مقبول';
    case COMPANY_NOTIFICATION_TYPES.CANNOT_FIX_ACCEPTED:
      return 'تم قبول التعذر';
    case COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED:
      return 'مطلوب استكمال';
    case COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK:
      return 'رد الأدمن';
    case COMPANY_NOTIFICATION_TYPES.SYSTEM:
      return 'تنبيه نظام';
    default:
      return 'إشعار';
  }
}

function toSafeNumber(value, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function normalizeNotification(notification = {}) {
  const type = normalizeType(
    notification.type ?? notification.notificationType ?? notification.kind,
  );

  return {
    id:
      notification.id ??
      notification.notificationId ??
      notification.notificationID ??
      '',
    type,
    typeLabel:
      notification.typeLabel ??
      notification.notificationTypeLabel ??
      getDefaultTypeLabel(type),
    tone: notification.tone || getDefaultTone(type),
    title: notification.title || '',
    message: notification.message ?? notification.body ?? '',
    reportId: notification.reportId ?? notification.relatedReportId ?? null,
    reportNumber:
      notification.reportNumber ?? notification.reportCode ?? null,
    reportTitle: notification.reportTitle ?? notification.issueTitle ?? null,
    location:
      notification.location ??
      notification.address ??
      notification.reportLocation ??
      null,
    priority: notification.priority ?? notification.priorityLabel ?? null,
    priorityTone: notification.priorityTone ?? null,
    isRead:
      typeof notification.isRead === 'boolean'
        ? notification.isRead
        : Boolean(notification.readAt ?? notification.isSeen ?? false),
    createdAt:
      notification.createdAt ??
      notification.createdOn ??
      notification.timestamp ??
      null,
  };
}

function normalizeTypeCounts(typeCounts, notifications, totalCount) {
  const counts = {
    all: toSafeNumber(totalCount, notifications.length),
    [COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED]: 0,
    [COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED]: 0,
    [COMPANY_NOTIFICATION_TYPES.CANNOT_FIX_ACCEPTED]: 0,
    [COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED]: 0,
  };

  if (Array.isArray(typeCounts)) {
    typeCounts.forEach((item) => {
      const type = normalizeType(item?.type ?? item?.value);
      if (!type) return;
      counts[type] = toSafeNumber(item?.count, counts[type] || 0);
    });
  } else if (typeCounts && typeof typeCounts === 'object') {
    Object.entries(typeCounts).forEach(([type, count]) => {
      const normalizedType = normalizeType(type);
      counts[normalizedType] = toSafeNumber(count, counts[normalizedType] || 0);
    });
  }

  if (!typeCounts) {
    notifications.forEach((notification) => {
      if (notification.type !== 'all') {
        counts[notification.type] = (counts[notification.type] || 0) + 1;
      }
    });
  }

  return counts;
}

function normalizeNotificationsPayload(payload) {
  const data = payload?.data ?? payload ?? {};
  const rawItems = data.items ?? data.notifications ?? [];
  const notifications = Array.isArray(rawItems)
    ? rawItems.map(normalizeNotification).filter((item) => item.id)
    : [];

  const totalCount = toSafeNumber(
    data.totalCount ?? data.totalNotifications,
    notifications.length,
  );

  return {
    notifications,
    totalCount,
    unreadCount: toSafeNumber(
      data.unreadCount,
      notifications.filter((notification) => !notification.isRead).length,
    ),
    filteredCount: toSafeNumber(data.filteredCount, notifications.length),
    typeCounts: normalizeTypeCounts(
      data.typeCounts,
      notifications,
      totalCount,
    ),
    message: payload?.message || '',
  };
}

export async function getCompanyNotificationsData({
  type = 'all',
  readStatus = COMPANY_NOTIFICATION_READ_FILTERS.ALL,
  signal,
} = {}) {
  const params = new URLSearchParams({
    type,
    readStatus,
  });

  const payload = await apiRequest(
    `/api/Notification/company/filter?${params.toString()}`,
    {
      method: 'GET',
      signal,
    },
  );

  return normalizeNotificationsPayload(payload);
}

export async function markCompanyNotificationAsRead(notificationId) {
  if (!notificationId) {
    throw createApiError('معرّف الإشعار غير صالح.', 400, null);
  }

  return apiRequest(
    `/api/Notification/${encodeURIComponent(notificationId)}/read`,
    {
      method: 'PUT',
    },
  );
}

export async function markAllCompanyNotificationsAsRead() {
  return apiRequest('/api/Notification/read-all', {
    method: 'PUT',
  });
}

export async function deleteCompanyNotification(notificationId) {
  if (!notificationId) {
    throw createApiError('معرّف الإشعار غير صالح.', 400, null);
  }

  return apiRequest(`/api/Notification/${encodeURIComponent(notificationId)}`, {
    method: 'DELETE',
  });
}
