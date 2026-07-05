const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(
  /\/$/,
  ''
);

export function resolveAssetUrl(url = '') {
  if (!url) return '';

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  if (!API_BASE_URL) return url;

  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}