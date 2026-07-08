import { get } from '../../../../shared/services/api/request';

const ADMIN_PROFILE_ENDPOINT = '/api/admin/profile';

function getResponseData(response) {
  return response?.data?.data || response?.data || response;
}

function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'حدث خطأ غير متوقع أثناء تحميل الملف الشخصي.';
  }

  if (typeof data === 'string') {
    return data;
  }

  return (
    data.message ||
    data.Message ||
    data.error ||
    data.Error ||
    'حدث خطأ غير متوقع أثناء تحميل الملف الشخصي.'
  );
}

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function isValidDate(value) {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function formatDate(value) {
  if (!isValidDate(value)) return value || 'غير متاح';

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!isValidDate(value)) return value || 'غير متاح';

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatRelativeTime(value) {
  if (!isValidDate(value)) return value || 'غير متاح';

  const activityDate = new Date(value).getTime();
  const now = Date.now();
  const diffInMs = Math.max(now - activityDate, 0);
  const diffInMinutes = Math.floor(diffInMs / 60000);

  if (diffInMinutes < 1) return 'الآن';
  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `منذ ${diffInDays} يوم`;

  return formatDate(value);
}

function normalizeProfile(rawProfile = {}) {
  const governorate = rawProfile.governorate || rawProfile.workScope?.governorate || 'غير محدد';

  return {
    id: rawProfile.id || '',
    name: rawProfile.name || rawProfile.email || 'مشرف النظام',
    role: rawProfile.role || 'Admin',
    roleLabel: rawProfile.roleLabel || 'مشرف نظام',
    email: rawProfile.email || 'غير متاح',
    phone: rawProfile.phone || 'غير متاح',
    governorate,
    department: rawProfile.department || 'إدارة النظام',
    status: rawProfile.status || 'نشط',
    lastLogin: formatDateTime(rawProfile.lastLogin),
    joinedAt: formatDate(rawProfile.joinedAt),

    workScope: {
      governorate,
      managedReports: toNumber(rawProfile.workScope?.managedReports),
      activeCompanies: toNumber(rawProfile.workScope?.activeCompanies),
      pendingReports: toNumber(rawProfile.workScope?.pendingReports),
      completedReports: toNumber(rawProfile.workScope?.completedReports),
    },

    permissions: Array.isArray(rawProfile.permissions)
      ? rawProfile.permissions.map((permission, index) => ({
          id: permission.id || `permission-${index + 1}`,
          label: permission.label || 'صلاحية غير محددة',
          description: permission.description || 'لا يوجد وصف متاح لهذه الصلاحية.',
        }))
      : [],

    recentActivities: Array.isArray(rawProfile.recentActivities)
      ? rawProfile.recentActivities.map((activity, index) => ({
          id: activity.id || `activity-${index + 1}`,
          title: activity.title || 'نشاط جديد',
          description: activity.description || 'لا يوجد وصف متاح لهذا النشاط.',
          time: formatRelativeTime(activity.time),
          rawTime: activity.time || null,
        }))
      : [],
  };
}

export async function getAdminProfile() {
  try {
    const response = await get(ADMIN_PROFILE_ENDPOINT);
    const data = getResponseData(response);

    return normalizeProfile(data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
