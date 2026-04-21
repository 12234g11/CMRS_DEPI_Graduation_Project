import { authMockUsers, authMockCompanies } from '../mocks/authMockData';

function wait(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    name: user.fullName,
    phone: user.phone,
    email: user.email,
    city: user.city,
    role: user.role,
    location: user.location || null,
  };
}

function sanitizeCompany(company) {
  return {
    id: company.id,
    companyName: company.companyName,
    name: company.companyName,
    email: company.officialEmail,
    commercialRegistration: company.commercialRegistration,
    serviceType: company.serviceType,
    governorate: company.governorate,
    city: company.city,
    role: company.role,
  };
}

export async function loginUser(credentials) {
  await wait();

  const email = normalizeEmail(credentials.email);
  const password = credentials.password;

  const user = authMockUsers.find(
    (item) => normalizeEmail(item.email) === email && item.password === password
  );

  if (!user) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
  }

  return {
    token: `mock-token-${user.id}`,
    user: sanitizeUser(user),
  };
}

export async function registerUser(payload) {
  await wait(800);

  const email = normalizeEmail(payload.email);
  const phone = payload.phone.trim();

  const existingUserByEmail = authMockUsers.find(
    (item) => normalizeEmail(item.email) === email
  );

  if (existingUserByEmail) {
    throw new Error('هذا البريد الإلكتروني مستخدم بالفعل.');
  }

  const existingUserByPhone = authMockUsers.find((item) => item.phone === phone);

  if (existingUserByPhone) {
    throw new Error('رقم الهاتف مستخدم بالفعل.');
  }

  const newUser = {
    id: Date.now(),
    fullName: payload.fullName.trim(),
    phone,
    email,
    city: payload.city.trim(),
    password: payload.password,
    role: 'user',
    location: payload.location || null,
  };

  authMockUsers.push(newUser);

  return {
    token: `mock-token-${newUser.id}`,
    user: sanitizeUser(newUser),
  };
}

export async function requestPasswordReset(email) {
  await wait(700);

  const normalizedEmail = normalizeEmail(email);

  const user = authMockUsers.find(
    (item) => normalizeEmail(item.email) === normalizedEmail
  );

  if (!user) {
    throw new Error('لا يوجد حساب مرتبط بهذا البريد الإلكتروني.');
  }

  return {
    success: true,
    message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
  };
}

export async function loginCompany(credentials) {
  await wait(750);

  const officialEmail = normalizeEmail(credentials.officialEmail);
  const companyName = credentials.companyName.trim();
  const commercialRegistration = credentials.commercialRegistration.trim();
  const serviceType = credentials.serviceType;
  const governorate = credentials.governorate;
  const password = credentials.password;

  const company = authMockCompanies.find(
    (item) =>
      normalizeEmail(item.officialEmail) === officialEmail &&
      item.companyName === companyName &&
      item.commercialRegistration === commercialRegistration &&
      item.serviceType === serviceType &&
      item.governorate === governorate &&
      item.password === password
  );

  if (!company) {
    throw new Error('بيانات تسجيل دخول الشركة غير صحيحة.');
  }

  return {
    token: `mock-company-token-${company.id}`,
    user: sanitizeCompany(company),
  };
}