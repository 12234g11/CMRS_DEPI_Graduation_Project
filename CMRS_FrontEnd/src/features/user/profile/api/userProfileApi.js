import axiosClient from '../../../../shared/services/api/axiosClient';

function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'حدث خطأ غير متوقع.';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  if (data.Message) {
    return data.Message;
  }

  if (data.title) {
    return data.title;
  }

  if (data.Title) {
    return data.Title;
  }

  const errors = data.errors || data.Errors;

  if (errors && typeof errors === 'object') {
    const messages = Object.entries(errors)
      .filter(([key]) => String(key).toLowerCase() !== 'traceid')
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${message}`);
        }

        if (typeof value === 'string') {
          return [`${field}: ${value}`];
        }

        return [];
      });

    if (messages.length) {
      return messages.join(' ');
    }
  }

  return 'حدث خطأ أثناء تنفيذ الطلب.';
}

function getResponseData(response) {
  return response?.data?.data || response?.data?.Data || null;
}

export async function getUserProfile() {
  try {
    const response = await axiosClient.get('/api/User/me');
    const data = getResponseData(response);

    return {
      profile: data?.profile || null,
      achievements: Array.isArray(data?.achievements) ? data.achievements : [],
      recentActivity: Array.isArray(data?.recentActivity)
        ? data.recentActivity
        : [],
      message:
        response?.data?.message ||
        response?.data?.Message ||
        'تم جلب بيانات الملف الشخصي بنجاح',
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function updateUserProfile(payload) {
  try {
    const response = await axiosClient.put('/api/User/me', {
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      city: payload.city,
    });

    const data = getResponseData(response);

    return {
      profile: data?.profile || data || null,
      message:
        response?.data?.message ||
        response?.data?.Message ||
        'تم تحديث بيانات الملف الشخصي بنجاح',
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}