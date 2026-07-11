const DEFAULT_MONTHS = 6;
const FALLBACK_API_BASE_URL = 'https://balaghasp.runasp.net';

function getApiBaseUrl() {
  const envBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BASE_URL ||
    FALLBACK_API_BASE_URL;

  return String(envBaseUrl).replace(/\/+$/, '');
}

function buildApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();

  if (baseUrl.endsWith('/api') && cleanPath.startsWith('/api/')) {
    return `${baseUrl}${cleanPath.replace(/^\/api/, '')}`;
  }

  return `${baseUrl}${cleanPath}`;
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function cleanToken(value) {
  if (!value || typeof value !== 'string') return '';

  const token = value.trim().replace(/^Bearer\s+/i, '');

  if (!token || token === 'undefined' || token === 'null') return '';

  return token;
}

function isJwtLike(value) {
  return /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(
    cleanToken(value),
  );
}

function findTokenInObject(value, visited = new Set()) {
  if (!value || typeof value !== 'object' || visited.has(value)) return '';

  visited.add(value);

  const preferredTokenKeys = [
    'access_token',
    'accessToken',
    'token',
    'jwt',
    'jwtToken',
    'authToken',
    'bearerToken',
  ];

  for (const key of preferredTokenKeys) {
    const token = cleanToken(value[key]);

    if (token) return token;
  }

  for (const item of Object.values(value)) {
    if (typeof item === 'string' && isJwtLike(item)) {
      return cleanToken(item);
    }

    if (item && typeof item === 'object') {
      const nestedToken = findTokenInObject(item, visited);

      if (nestedToken) return nestedToken;
    }
  }

  return '';
}

function findTokenInStorage(storage) {
  if (!storage) return '';

  const preferredStorageKeys = [
    'access_token',
    'token',
    'accessToken',
    'authToken',
    'jwtToken',
    'jwt',
    'bearerToken',
    'cmrs_token',
    'current_user',
    'currentUser',
    'user',
    'auth_user',
    'auth',
  ];

  for (const key of preferredStorageKeys) {
    const rawValue = storage.getItem(key);
    const directToken = cleanToken(rawValue);

    if (directToken && (key !== 'current_user' || isJwtLike(directToken))) {
      return directToken;
    }

    const parsedValue = safeParseJson(rawValue);
    const nestedToken = findTokenInObject(parsedValue);

    if (nestedToken) return nestedToken;
  }

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    const rawValue = storage.getItem(key);
    const directToken = cleanToken(rawValue);

    if (isJwtLike(directToken)) return directToken;

    const parsedValue = safeParseJson(rawValue);
    const nestedToken = findTokenInObject(parsedValue);

    if (nestedToken) return nestedToken;
  }

  return '';
}

function getAuthToken() {
  return findTokenInStorage(localStorage) || findTokenInStorage(sessionStorage);
}

function normalizeCompanyAnalyticsResponse(responseData, months = DEFAULT_MONTHS) {
  const payload = responseData?.data ?? responseData ?? {};

  return {
    stats: Array.isArray(payload.stats) ? payload.stats : [],
    summary: {
      companyName: payload.summary?.companyName || '',
      periodLabel: payload.summary?.periodLabel || `آخر ${months} شهور`,
      averageClosingTime: payload.summary?.averageClosingTime || '0 يوم',
      completionRate: Number(payload.summary?.completionRate || 0),
    },
    reportsTrend: Array.isArray(payload.reportsTrend) ? payload.reportsTrend : [],
    statusDistribution: Array.isArray(payload.statusDistribution)
      ? payload.statusDistribution
      : [],
  };
}

async function requestJson(url, options = {}) {
  const token = getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const responseData = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const isAuthError = response.status === 401 || response.status === 403;
    const fallbackMessage = isAuthError
      ? 'غير مصرح بعرض إحصائيات الشركة. تأكد إنك مسجل دخول بحساب شركة مفعل.'
      : 'تعذر تحميل بيانات الإحصائيات. برجاء المحاولة مرة أخرى.';

    const error = new Error(
      responseData?.message || responseData?.title || fallbackMessage,
    );

    error.status = response.status;
    error.response = { data: responseData };
    throw error;
  }

  return responseData;
}

export async function getCompanyAnalyticsData(months = DEFAULT_MONTHS) {
  const params = new URLSearchParams({ months: String(months) });
  const url = buildApiUrl(`/api/company/analytics?${params.toString()}`);
  const responseData = await requestJson(url);

  return normalizeCompanyAnalyticsResponse(responseData, months);
}
