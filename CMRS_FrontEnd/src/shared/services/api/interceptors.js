import {
  clearAuthData,
  getAccessToken,
} from '../../../features/auth/services/authStorage';

const LOGIN_PATH = '/login';

function isAuthEndpoint(url = '') {
  const normalizedUrl = String(url).toLowerCase();

  return normalizedUrl.includes('/authentication/');
}

function redirectToLogin() {
  const currentPath = window.location.pathname;

  if (currentPath !== LOGIN_PATH) {
    window.location.replace(LOGIN_PATH);
  }
}

export function setupInterceptors(axiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const requestUrl = error?.config?.url || '';

      if (status === 401 && !isAuthEndpoint(requestUrl)) {
        clearAuthData();
        redirectToLogin();
      }

      return Promise.reject(error);
    }
  );
}