import {
  adminCompanies,
  companyServiceMapping,
} from '../mocks/adminCompaniesMockData';

function wait(value, delay = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

function createCompanyId() {
  return `company-${Date.now()}`;
}

function createCompanyCode() {
  return `CMP-${String(Date.now()).slice(-4)}`;
}

function createInviteUrl(companyId) {
  const token = `invite-${companyId}-${Date.now()}`;

  return `https://cmrs.vercel.app/company/setup-password?token=${token}`;
}

function createInvitationExpiryDate() {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + 7);

  return expiresAt.toISOString().slice(0, 10);
}

function getServiceData(specialization) {
  return companyServiceMapping[specialization] || {
    specializations: [specialization],
    problemTypes: [],
  };
}

function normalizeCompanyPayload(payload) {
  const serviceData = getServiceData(payload.specialization);

  const governorates = payload.governorates?.length
    ? payload.governorates
    : [payload.governorate].filter(Boolean);

  return {
    ...payload,
    governorate: governorates[0] || '',
    governorates,
    coverageAreas: governorates,
    specializations: serviceData.specializations,
    problemTypes: serviceData.problemTypes,
    maxCapacity: Number(payload.maxCapacity || 10),
  };
}

export async function getAdminCompanies() {
  return wait(adminCompanies);
}

export async function createAdminCompany(payload) {
  const companyId = createCompanyId();
  const inviteUrl = createInviteUrl(companyId);
  const invitationExpiresAt = createInvitationExpiryDate();

  const company = normalizeCompanyPayload({
    id: companyId,
    code: createCompanyCode(),
    status: 'active',
    accountStatus: 'invited',
    inviteUrl,
    invitationExpiresAt,
    currentTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    completedReports: 0,
    rating: null,
    performance: null,
    successRate: null,
    avgResponseHours: null,
    avgResponseTime: null,
    lastStatusReason: '',
    joinedAt: new Date().toISOString().slice(0, 10),
    ...payload,
  });

  return wait({
    company,
    account: {
      id: `account-${company.id}`,
      companyId: company.id,
      email: company.email,
      role: 'company',
      accountStatus: 'invited',
      mustSetPassword: true,
    },
    inviteUrl,
    invitationExpiresAt,
  });
}

export async function updateAdminCompany(companyId, payload) {
  const company = normalizeCompanyPayload({
    id: companyId,
    ...payload,
  });

  return wait(company);
}

export async function changeAdminCompanyStatus(companyId, payload) {
  return wait({
    id: companyId,
    status: payload.status,
    lastStatusReason: payload.reason || '',
    statusChangedAt: new Date().toISOString(),
  });
}

export async function resendCompanyInvitation(company) {
  const inviteUrl = createInviteUrl(company.id);
  const invitationExpiresAt = createInvitationExpiryDate();

  return wait({
    id: company.id,
    accountStatus: 'invited',
    inviteUrl,
    invitationExpiresAt,
  });
}