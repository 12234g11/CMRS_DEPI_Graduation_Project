import axiosClient from '../../../../shared/services/api/axiosClient';

function getAdminApiBase() {
  const configuredBaseUrl = String(axiosClient?.defaults?.baseURL || '').replace(/\/$/, '');

  return configuredBaseUrl.endsWith('/api') ? '/admin' : '/api/admin';
}

const ADMIN_API_BASE = getAdminApiBase();

function buildAdminUrl(path) {
  return `${ADMIN_API_BASE}${path}`;
}

function unwrapResponse(response) {
  const root = response?.data ?? response;

  return root?.data ?? root;
}

function removeEmptyParams(params = {}) {
  return Object.entries(params).reduce((cleanParams, [key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
      return cleanParams;
    }

    cleanParams[key] = value;
    return cleanParams;
  }, {});
}

function normalizeOptions(options = []) {
  return options.map((option) => ({
    value: option.value ?? option.id ?? option.name,
    label: option.label ?? option.name ?? option.value,
    specializations: option.specializations || [],
    problemTypes: option.problemTypes || [],
  }));
}

function normalizeCompany(company = {}) {
  const governorates = company.governorates?.length
    ? company.governorates
    : [company.governorate].filter(Boolean);

  return {
    ...company,
    id: company.id || company.companyId || '',
    code: company.code || '-',
    name: company.name || company.companyName || '-',
    specialization: company.specialization || '-',
    specializations: company.specializations || [],
    problemTypes: company.problemTypes || [],
    governorate: company.governorate || governorates[0] || '',
    governorates,
    coverageAreas: company.coverageAreas || governorates,
    status: company.status || 'active',
    accountStatus: company.accountStatus || 'active',
    currentTasks: company.currentTasks ?? company.activeTasks ?? 0,
    activeTasks: company.activeTasks ?? company.currentTasks ?? 0,
    completedTasks: company.completedTasks ?? company.completedReports ?? 0,
    completedReports: company.completedReports ?? company.completedTasks ?? 0,
    maxCapacity: company.maxCapacity ?? 0,
    rating: company.rating ?? null,
    performance: company.performance ?? company.successRate ?? null,
    successRate: company.successRate ?? company.performance ?? null,
    avgResponseHours: company.avgResponseHours ?? null,
    avgResponseTime: company.avgResponseTime || null,
    phone: company.phone || '-',
    email: company.email || '-',
    managerName: company.managerName || '-',
    managerPhone: company.managerPhone || '-',
    address: company.address || '-',
    joinedAt: company.joinedAt || '-',
    description: company.description || '',
    lastStatusReason: company.lastStatusReason || '',
    inviteUrl: company.inviteUrl || null,
    invitationExpiresAt: company.invitationExpiresAt || null,
  };
}

function normalizeCompaniesPayload(payload = {}) {
  const items = Array.isArray(payload) ? payload : payload.items || [];

  return {
    items: items.map(normalizeCompany),
    summary: payload.summary || {
      totalCompanies: items.length,
      activeCompanies: items.filter((company) => company.status === 'active').length,
      activeTasks: items.reduce(
        (total, company) => total + Number(company.activeTasks || company.currentTasks || 0),
        0,
      ),
      completedTasks: items.reduce(
        (total, company) => total + Number(company.completedTasks || 0),
        0,
      ),
    },
    pagination: payload.pagination || {
      page: 1,
      pageSize: items.length,
      totalItems: items.length,
      totalPages: 1,
    },
  };
}

function mapCreateCompanyPayload(payload = {}) {
  return {
    companyName: payload.companyName || payload.name,
    email: payload.email,
    phone: payload.phone,
    specialization: payload.specialization,
    areaId: payload.areaId || null,
    managerName: payload.managerName || null,
    managerPhone: payload.managerPhone || null,
    notes: payload.notes || payload.description || null,
  };
}

function mapUpdateCompanyPayload(payload = {}) {
  const governorates = payload.governorates?.length
    ? payload.governorates
    : [payload.governorate].filter(Boolean);

  return {
    name: payload.name || payload.companyName,
    specialization: payload.specialization,
    governorates,
    governorate: payload.governorate || governorates[0] || null,
    coverageAreas: payload.coverageAreas?.length ? payload.coverageAreas : governorates,
    maxCapacity: Number(payload.maxCapacity || 0),
    phone: payload.phone,
    email: payload.email,
    managerName: payload.managerName || null,
    managerPhone: payload.managerPhone || null,
    address: payload.address || null,
    description: payload.description || null,
  };
}

export async function getAdminCompanies(params = {}) {
  const response = await axiosClient.get(buildAdminUrl('/companies'), {
    params: removeEmptyParams(params),
  });

  return normalizeCompaniesPayload(unwrapResponse(response));
}

export async function getAdminCompanyOptions() {
  const response = await axiosClient.get(buildAdminUrl('/companies/options'));
  const data = unwrapResponse(response) || {};

  return {
    statuses: [{ value: 'all', label: 'كل الحالات' }, ...normalizeOptions(data.statuses || [])],
    accountStatuses: [
      { value: 'all', label: 'كل حالات الحساب' },
      ...normalizeOptions(data.accountStatuses || []),
    ],
    governorates: [
      { value: 'all', label: 'كل المحافظات' },
      ...normalizeOptions(data.governorates || []),
    ],
    specializations: [
      { value: 'all', label: 'كل الخدمات', specializations: [], problemTypes: [] },
      ...normalizeOptions(data.specializations || []),
    ],
  };
}

export async function getAdminCompanyById(companyId) {
  const response = await axiosClient.get(buildAdminUrl(`/companies/${companyId}`));

  return normalizeCompany(unwrapResponse(response));
}

export async function inviteAdminCompany(payload) {
  const response = await axiosClient.post(
    buildAdminUrl('/companies/invite'),
    mapCreateCompanyPayload(payload),
  );

  return response?.data ?? response;
}

export async function createAdminCompany(payload) {
  return inviteAdminCompany(payload);
}

export async function updateAdminCompany(companyId, payload) {
  const response = await axiosClient.put(
    buildAdminUrl(`/companies/${companyId}`),
    mapUpdateCompanyPayload(payload),
  );

  return normalizeCompany(unwrapResponse(response));
}

export async function changeAdminCompanyStatus(companyId, payload) {
  const response = await axiosClient.patch(
    buildAdminUrl(`/companies/${companyId}/status`),
    {
      status: payload.status,
      reason: payload.reason || null,
    },
  );

  return unwrapResponse(response);
}

export async function resendCompanyInvitation(companyOrId) {
  const companyId = typeof companyOrId === 'string' ? companyOrId : companyOrId.id;
  const response = await axiosClient.post(
    buildAdminUrl(`/companies/${companyId}/invitations/resend`),
  );

  return unwrapResponse(response);
}
