import axiosClient from './axiosClient';

function createApiError(error) {
  const responseData = error?.response?.data;

  const message =
    responseData?.message ||
    responseData?.title ||
    responseData?.error ||
    error?.message ||
    'حدث خطأ غير متوقع.';

  const apiError = new Error(message);

  apiError.status = error?.response?.status;
  apiError.errors = responseData?.errors || null;
  apiError.data = responseData || null;

  return apiError;
}

function ensureSuccess(data) {
  if (data?.success === false) {
    const apiError = new Error(data.message || 'حدث خطأ أثناء تنفيذ الطلب.');

    apiError.errors = data.errors || null;
    apiError.data = data;

    throw apiError;
  }

  return data;
}

async function request(config) {
  try {
    const response = await axiosClient(config);
    return ensureSuccess(response.data);
  } catch (error) {
    throw createApiError(error);
  }
}

export function get(url, config = {}) {
  return request({
    method: 'GET',
    url,
    ...config,
  });
}

export function post(url, data, config = {}) {
  return request({
    method: 'POST',
    url,
    data,
    ...config,
  });
}

export function put(url, data, config = {}) {
  return request({
    method: 'PUT',
    url,
    data,
    ...config,
  });
}

export function patch(url, data, config = {}) {
  return request({
    method: 'PATCH',
    url,
    data,
    ...config,
  });
}

export function remove(url, config = {}) {
  return request({
    method: 'DELETE',
    url,
    ...config,
  });
}