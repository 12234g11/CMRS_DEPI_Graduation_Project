import {
  COMPANY_TEAM_AVAILABILITY,
  COMPANY_TEAM_STATUSES,
  getCompanyTeamsStats,
} from '../mocks/companyTeamsMockData';

const DEFAULT_API_BASE_URL = 'http://balaghasp.runasp.net';
const COMPANY_TEAMS_ENDPOINT = '/api/company/teams';
const TEAM_ACTIVE_TASKS_LIMIT = 5;

function getApiBaseUrl() {
  const envBaseUrl =
    import.meta.env?.VITE_API_BASE_URL ||
    import.meta.env?.VITE_API_URL ||
    import.meta.env?.VITE_BASE_URL ||
    DEFAULT_API_BASE_URL;

  return String(envBaseUrl).replace(/\/+$/, '');
}

function getBrowserStorages() {
  return [localStorage, sessionStorage].filter(Boolean);
}

function cleanToken(value) {
  if (!value || typeof value !== 'string') return '';

  return value
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/^Bearer\s+/i, '');
}

function findTokenInObject(value) {
  if (!value || typeof value !== 'object') return '';

  const possibleTokenKeys = [
    'token',
    'accessToken',
    'access_token',
    'authToken',
    'auth_token',
    'jwtToken',
    'jwt',
    'bearerToken',
    'pms_token',
  ];

  for (const key of possibleTokenKeys) {
    const token = cleanToken(value?.[key]);
    if (token) return token;
  }

  for (const nestedValue of Object.values(value)) {
    if (nestedValue && typeof nestedValue === 'object') {
      const token = findTokenInObject(nestedValue);
      if (token) return token;
    }
  }

  return '';
}

function getAuthToken() {
  const directTokenKeys = [
    'access_token',
    'pms_token',
    'token',
    'authToken',
    'auth_token',
    'accessToken',
    'jwtToken',
    'jwt',
    'userToken',
    'cmrsToken',
    'bearerToken',
  ];

  const userStorageKeys = [
    'current_user',
    'currentUser',
    'user',
    'authUser',
    'auth',
    'auth-storage',
    'persist:auth',
  ];

  for (const storage of getBrowserStorages()) {
    for (const key of directTokenKeys) {
      const token = cleanToken(storage.getItem(key));
      if (token) return token;
    }

    for (const key of userStorageKeys) {
      const value = storage.getItem(key);
      if (!value) continue;

      try {
        const parsedValue = JSON.parse(value);
        const token = findTokenInObject(parsedValue);
        if (token) return token;
      } catch {
        const token = cleanToken(value);
        if (token) return token;
      }
    }
  }

  return '';
}

function normalizeEnumText(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeStatusValue(status) {
  const normalizedStatus = normalizeEnumText(status);

  if (
    normalizedStatus === COMPANY_TEAM_STATUSES.DISABLED ||
    normalizedStatus === 'disabled' ||
    normalizedStatus === 'inactive' ||
    normalizedStatus === 'stopped' ||
    normalizedStatus === 'موقوفة' ||
    normalizedStatus === 'موقوف'
  ) {
    return COMPANY_TEAM_STATUSES.DISABLED;
  }

  return COMPANY_TEAM_STATUSES.ACTIVE;
}

function getStatusMeta(status) {
  const normalizedStatus = normalizeStatusValue(status);

  if (normalizedStatus === COMPANY_TEAM_STATUSES.DISABLED) {
    return {
      status: COMPANY_TEAM_STATUSES.DISABLED,
      statusLabel: 'موقوفة',
      statusTone: 'danger',
    };
  }

  return {
    status: COMPANY_TEAM_STATUSES.ACTIVE,
    statusLabel: 'نشطة',
    statusTone: 'success',
  };
}

function normalizeAvailabilityValue(availability) {
  const normalizedAvailability = normalizeEnumText(availability);

  if (
    normalizedAvailability === COMPANY_TEAM_AVAILABILITY.BUSY ||
    normalizedAvailability === 'busy' ||
    normalizedAvailability === 'مشغولة' ||
    normalizedAvailability === 'مشغول'
  ) {
    return COMPANY_TEAM_AVAILABILITY.BUSY;
  }

  if (
    normalizedAvailability === COMPANY_TEAM_AVAILABILITY.OFFLINE ||
    normalizedAvailability === 'offline' ||
    normalizedAvailability === 'unavailable' ||
    normalizedAvailability === 'notavailable' ||
    normalizedAvailability === 'not_available' ||
    normalizedAvailability === 'غير متاحة' ||
    normalizedAvailability === 'غير متاح'
  ) {
    return COMPANY_TEAM_AVAILABILITY.OFFLINE;
  }

  return COMPANY_TEAM_AVAILABILITY.AVAILABLE;
}

function getAvailabilityMeta(availability) {
  const normalizedAvailability = normalizeAvailabilityValue(availability);

  if (normalizedAvailability === COMPANY_TEAM_AVAILABILITY.BUSY) {
    return {
      availability: COMPANY_TEAM_AVAILABILITY.BUSY,
      availabilityLabel: 'مشغولة',
      availabilityTone: 'warning',
    };
  }

  if (normalizedAvailability === COMPANY_TEAM_AVAILABILITY.OFFLINE) {
    return {
      availability: COMPANY_TEAM_AVAILABILITY.OFFLINE,
      availabilityLabel: 'غير متاحة',
      availabilityTone: 'danger',
    };
  }

  return {
    availability: COMPANY_TEAM_AVAILABILITY.AVAILABLE,
    availabilityLabel: 'متاحة',
    availabilityTone: 'success',
  };
}

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function resolveTeamAvailability(team, status, activeTasks) {
  const backendAvailability = team.availability || team.teamAvailability || team.availabilityStatus;

  if (backendAvailability) {
    return normalizeAvailabilityValue(backendAvailability);
  }

  if (status === COMPANY_TEAM_STATUSES.DISABLED) {
    return COMPANY_TEAM_AVAILABILITY.OFFLINE;
  }

  if (activeTasks >= TEAM_ACTIVE_TASKS_LIMIT) {
    return COMPANY_TEAM_AVAILABILITY.BUSY;
  }

  return COMPANY_TEAM_AVAILABILITY.AVAILABLE;
}

function normalizeTeam(team = {}) {
  const id = team.id || team.teamId || team.companyTeamId;
  const activeTasks = toNumber(team.activeTasks ?? team.activeReportsCount, 0);
  const completedTasks = toNumber(team.completedTasks ?? team.completedReportsCount, 0);
  const status = normalizeStatusValue(team.status || team.teamStatus);
  const availability = resolveTeamAvailability(team, status, activeTasks);

  return {
    ...team,
    id: String(id || ''),
    name: team.name || team.teamName || '',
    leadName: team.leadName || team.leaderName || team.teamLeadName || '',
    phone: team.phone || team.phoneNumber || team.contactPhone || '',
    membersCount: toNumber(team.membersCount ?? team.members, 0),
    activeTasks,
    completedTasks,
    ...getStatusMeta(status),
    ...getAvailabilityMeta(availability),
    lastActivity: team.lastActivity || team.updatedAt || team.createdAt || 'لا يوجد تحديث مسجل',
    notes: team.notes || '',
  };
}

function normalizeStats(stats, teams) {
  if (Array.isArray(stats) && stats.length > 0) {
    return stats.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      value: toNumber(item.value, 0),
      tone: item.tone || 'primary',
    }));
  }

  return getCompanyTeamsStats(teams);
}

function normalizeTeamsData(payload = {}) {
  const data = payload?.data ?? payload;
  const hasTeamsList = Array.isArray(data?.teams) || Array.isArray(data);
  const rawTeams = Array.isArray(data?.teams)
    ? data.teams
    : Array.isArray(data)
      ? data
      : [];

  const teams = rawTeams.map(normalizeTeam);

  return {
    team: data?.team ? normalizeTeam(data.team) : null,
    teams,
    stats: normalizeStats(data?.stats, teams),
    hasTeamsList,
    message: payload?.message || data?.message || '',
  };
}

function serializeErrorMessages(errors) {
  if (!errors) return '';

  if (Array.isArray(errors)) return errors.join('\n');

  if (typeof errors === 'string') return errors;

  if (typeof errors === 'object') {
    return Object.values(errors)
      .flat()
      .filter(Boolean)
      .join('\n');
  }

  return '';
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      payload?.message ||
      serializeErrorMessages(payload?.errors) ||
      'حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى.';

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (payload?.success === false) {
    throw new Error(
      payload?.message ||
        serializeErrorMessages(payload?.errors) ||
        'لم يتم تنفيذ العملية بنجاح.',
    );
  }

  return payload;
}

function buildTeamRequestBody(payload = {}) {
  const body = {
    name: payload.name,
    leadName: payload.leadName,
    phone: payload.phone,
    membersCount: toNumber(payload.membersCount, 0),
    notes: payload.notes || '',
  };

  if (payload.status) {
    body.status = normalizeStatusValue(payload.status);
  }

  return body;
}

async function refreshTeamsAfterMutation(fallbackPayload) {
  try {
    return await getCompanyTeamsData();
  } catch {
    return normalizeTeamsData(fallbackPayload);
  }
}

export async function getCompanyTeamsData() {
  const payload = await request(COMPANY_TEAMS_ENDPOINT);
  return normalizeTeamsData(payload);
}

export async function createCompanyTeam(payload) {
  const responsePayload = await request(COMPANY_TEAMS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(buildTeamRequestBody(payload)),
  });

  return refreshTeamsAfterMutation(responsePayload);
}

export async function updateCompanyTeam(teamId, payload) {
  const responsePayload = await request(`${COMPANY_TEAMS_ENDPOINT}/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify(buildTeamRequestBody(payload)),
  });

  return refreshTeamsAfterMutation(responsePayload);
}

export async function updateCompanyTeamStatus(teamId, nextStatus) {
  const responsePayload = await request(`${COMPANY_TEAMS_ENDPOINT}/${teamId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: normalizeStatusValue(nextStatus) }),
  });

  return refreshTeamsAfterMutation(responsePayload);
}
