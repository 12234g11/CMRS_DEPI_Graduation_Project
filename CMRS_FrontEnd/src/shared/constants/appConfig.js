const DEFAULT_API_BASE_URL = 'https://balaghasp.runasp.net';

function removeTrailingSlash(value = '') {
  return value.replace(/\/+$/, '');
}

export const APP_CONFIG = {
  apiBaseUrl: removeTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
  ),
};