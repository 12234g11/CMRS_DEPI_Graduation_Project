const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user';

export function setAuthData({ token, accessToken, user }) {
  const resolvedToken = token || accessToken;

  if (resolvedToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, resolvedToken);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    clearAuthData();
    return null;
  }
}

export function clearAuthData() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}