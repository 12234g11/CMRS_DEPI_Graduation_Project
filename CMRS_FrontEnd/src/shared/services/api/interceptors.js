import { getAccessToken, clearAuthData } from '../../../features/auth/services/authStorage';

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
      if (error?.response?.status === 401) {
        clearAuthData();
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );
}