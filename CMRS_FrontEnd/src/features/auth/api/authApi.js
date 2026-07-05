import { get, post } from '../../../shared/services/api/request';

export function loginUser(payload) {
  return post('/api/Authentication/Login', payload);
}

export function registerUser(payload) {
  return post('/api/Authentication/register', {
    name: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    city: payload.city,
    password: payload.password,
    cPassword: payload.confirmPassword,
    termsAccepted: Boolean(payload.termsAccepted),
  });
}

export function requestPasswordReset(email) {
  return post('/api/Authentication/forgot-password', {
    email,
  });
}

export function resetPassword(payload) {
  return post('/api/Authentication/reset-password', {
    email: payload.email,
    token: payload.token,
    newPassword: payload.newPassword,
    confirmPassword: payload.confirmPassword,
  });
}

export function logoutUser() {
  return post('/api/Authentication/logout');
}

export function validateCompanyInvitation(token) {
  return get('/api/Authentication/company-invitation/validate', {
    params: { token },
  });
}

export function acceptCompanyInvitation(payload) {
  return post('/api/Authentication/company-invitation/accept', payload);
}