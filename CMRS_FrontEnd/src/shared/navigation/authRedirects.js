import { ROLES } from './roles';
import { ROUTES } from './routes';

const ROLE_DEFAULT_ROUTES = {
  [ROLES.USER]: ROUTES.MY_REPORTS,
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.COMPANY]: ROUTES.COMPANY_REPORTS,
};

const ROLE_ALLOWED_ROUTES = {
  [ROLES.USER]: [
    ROUTES.MY_REPORTS,
    ROUTES.ADD_REPORT,
    ROUTES.NEARBY_ISSUES,
    ROUTES.NOTIFICATIONS,
    ROUTES.PROFILE,
  ],

  [ROLES.ADMIN]: [
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.ADMIN_REVIEW_REPORTS,
    ROUTES.ADMIN_REPORT_DETAILS,
    ROUTES.ADMIN_COMPANIES,
    ROUTES.ADMIN_COMPANY_REQUESTS,
    ROUTES.ADMIN_ANALYTICS,
    ROUTES.ADMIN_NOTIFICATIONS,
    ROUTES.ADMIN_PROFILE,
  ],

  [ROLES.COMPANY]: [
    ROUTES.COMPANY_DASHBOARD,
    ROUTES.COMPANY_REPORTS,
    ROUTES.COMPANY_TEAMS,
    ROUTES.COMPANY_ANALYTICS,
    ROUTES.COMPANY_NOTIFICATIONS,
    ROUTES.COMPANY_PROFILE,
  ],
};

const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.COMPANY_SETUP_PASSWORD,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

function normalizePath(path = '') {
  if (!path || typeof path !== 'string') return '';

  const pathWithoutQuery = path.split('?')[0].split('#')[0];

  return pathWithoutQuery.endsWith('/') && pathWithoutQuery.length > 1
    ? pathWithoutQuery.slice(0, -1)
    : pathWithoutQuery;
}

export function getDefaultRouteByRole(role) {
  return ROLE_DEFAULT_ROUTES[role] || ROUTES.HOME;
}

export function canRoleAccessPath(role, path) {
  const normalizedPath = normalizePath(path);

  if (
    !normalizedPath ||
    normalizedPath === ROUTES.HOME ||
    AUTH_ROUTES.includes(normalizedPath)
  ) {
    return false;
  }

  return (ROLE_ALLOWED_ROUTES[role] || []).some((route) => {
    if (route.includes('/:')) {
      const baseRoute = route.split('/:')[0];

      return (
        normalizedPath === baseRoute ||
        normalizedPath.startsWith(`${baseRoute}/`)
      );
    }

    return normalizedPath === route;
  });
}

export function getPostLoginRedirectPath({ role, requestedPath } = {}) {
  if (canRoleAccessPath(role, requestedPath)) {
    return requestedPath;
  }

  return getDefaultRouteByRole(role);
}