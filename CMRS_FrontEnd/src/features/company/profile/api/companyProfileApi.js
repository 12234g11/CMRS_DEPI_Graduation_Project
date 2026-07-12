import { getCompanyProfileStats } from '../mocks/companyProfileMockData';

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  'http://balaghasp.runasp.net';

const COMPANY_PROFILE_ENDPOINT = '/api/company/profile';

function normalizeBaseUrl(value = '') {
  return String(value).trim().replace(/\/+$/, '');
}

function buildApiUrl(path) {
  const baseUrl = normalizeBaseUrl(RAW_API_BASE_URL);

  if (!baseUrl) return path;

  // Prevent duplicated /api/api when the environment base URL already ends with /api.
  if (baseUrl.endsWith('/api') && path.startsWith('/api/')) {
    return `${baseUrl}${path.replace(/^\/api/, '')}`;
  }

  return `${baseUrl}${path}`;
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getAccessToken() {
  const currentUser = safeJsonParse(localStorage.getItem('current_user'));

  return (
    localStorage.getItem('access_token') ||
    currentUser?.access_token ||
    currentUser?.token ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    ''
  );
}

function removeUnusedProfileFields(profile = {}) {
  const { registrationNumber, taxNumber, lastLogin, officialContact, ...restProfile } =
    profile || {};

  const { emergencyPhone, ...restOfficialContact } = officialContact || {};

  return {
    ...restProfile,
    officialContact: restOfficialContact,
  };
}

function normalizeCompanyProfilePayload(payload = {}) {
  const data = payload?.data ?? payload;
  const rawProfile = data?.profile ?? data;
  const profile = removeUnusedProfileFields(rawProfile);
  const stats = Array.isArray(data?.stats)
    ? data.stats
    : getCompanyProfileStats(profile);

  return {
    profile,
    stats,
  };
}

async function parseResponseBody(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function getCompanyProfileData() {
  const token = getAccessToken();
  const response = await fetch(buildApiUrl(COMPANY_PROFILE_ENDPOINT), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      responseBody?.message ||
      responseBody?.error ||
      'تعذر تحميل بيانات الملف الشخصي للشركة في الوقت الحالي.';

    throw new Error(message);
  }

  return normalizeCompanyProfilePayload(responseBody);
}
