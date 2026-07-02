import {
  authMockUsers,
  authMockAdmins,
  authMockCompanies,
} from '../mocks/authMockData';

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

function sanitizeAdmin(admin) {
  return {
    id: admin.id,
    fullName: admin.fullName,
    name: admin.fullName,
    phone: admin.phone,
    email: admin.email,
    city: admin.city,
    role: admin.role,
  };
}

function sanitizeCompany(company) {
  return {
    id: company.id,
    companyName: company.companyName,
    name: company.companyName,
    email: company.officialEmail,
    officialEmail: company.officialEmail,
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

  const admin = authMockAdmins.find(
    (item) => normalizeEmail(item.email) === email && item.password === password
  );

  if (admin) {
    return {
      token: `mock-admin-token-${admin.id}`,
      user: sanitizeAdmin(admin),
    };
  }

  const user = authMockUsers.find(
    (item) => normalizeEmail(item.email) === email && item.password === password
  );

  if (user) {
    return {
      token: `mock-token-${user.id}`,
      user: sanitizeUser(user),
    };
  }

  throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
}

export async function registerUser(payload) {
  await wait(800);

  const email = normalizeEmail(payload.email);
  const phone = payload.phone.trim();

  const allPeopleAccounts = [...authMockUsers, ...authMockAdmins];

  const existingUserByEmail = allPeopleAccounts.find(
    (item) => normalizeEmail(item.email) === email
  );

  if (existingUserByEmail) {
    throw new Error('هذا البريد الإلكتروني مستخدم بالفعل.');
  }

  const existingUserByPhone = allPeopleAccounts.find((item) => item.phone === phone);

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

  const allAccounts = [...authMockUsers, ...authMockAdmins, ...authMockCompanies];

  const account = allAccounts.find((item) => {
    const accountEmail = item.email || item.officialEmail;
    return normalizeEmail(accountEmail) === normalizedEmail;
  });

  if (!account) {
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
export async function acceptCompanyInvitation(payload) {
  await wait(700);

  if (!payload.token) {
    throw new Error('رابط الدعوة غير صحيح أو منتهي الصلاحية.');
  }

  if (!payload.email || !payload.password || !payload.confirmPassword) {
    throw new Error('من فضلك املأ جميع الحقول المطلوبة.');
  }

  if (payload.password !== payload.confirmPassword) {
    throw new Error('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
  }

  return {
    success: true,
    message: 'تم تفعيل حساب الشركة بنجاح.',
  };
}
export async function resetPassword(payload) {
  await wait(700);

  if (!payload.token) {
    throw new Error('رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية.');
  }

  if (!payload.password || !payload.confirmPassword) {
    throw new Error('من فضلك املأ كلمة المرور وتأكيد كلمة المرور.');
  }

  if (payload.password.length < 8) {
    throw new Error('كلمة المرور يجب ألا تقل عن 8 أحرف.');
  }

  if (payload.password !== payload.confirmPassword) {
    throw new Error('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
  }

  return {
    success: true,
    message: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.',
  };
}