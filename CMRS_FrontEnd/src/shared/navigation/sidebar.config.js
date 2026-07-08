import { ROUTES } from './routes';
import { ROLES } from './roles';

export const DASHBOARD_LAYOUT_CONFIG = {
  [ROLES.USER]: {
    navItems: [
      {
        key: 'my-reports',
        label: 'بلاغاتي',
        path: ROUTES.MY_REPORTS,
        icon: 'file-text',
        end: true,
      },
      {
        key: 'add-report',
        label: 'إضافة بلاغ',
        path: ROUTES.ADD_REPORT,
        icon: 'plus',
      },
      {
        key: 'nearby-issues',
        label: 'مشاكل قريبة منك',
        path: ROUTES.NEARBY_ISSUES,
        icon: 'map-pin',
      },
      {
        key: 'notifications',
        label: 'الإشعارات',
        path: ROUTES.NOTIFICATIONS,
        icon: 'bell',
      },
      {
        key: 'profile',
        label: 'الملف الشخصي',
        path: ROUTES.PROFILE,
        icon: 'user',
      },
    ],
  },

  [ROLES.ADMIN]: {
    navItems: [
      {
        key: 'dashboard',
        label: 'التحكم',
        path: ROUTES.ADMIN_DASHBOARD,
        icon: 'grid',
        end: true,
      },
      {
        key: 'manage-reports',
        label: 'إدارة البلاغات',
        path: ROUTES.ADMIN_REVIEW_REPORTS,
        icon: 'file-text',
      },
      {
        key: 'companies',
        label: 'الشركات',
        path: ROUTES.ADMIN_COMPANIES,
        icon: 'users',
      },
      {
        key: 'analytics',
        label: 'التقارير والإحصائيات',
        path: ROUTES.ADMIN_ANALYTICS,
        icon: 'bar-chart',
      },
      {
        key: 'notifications',
        label: 'الإشعارات',
        path: ROUTES.ADMIN_NOTIFICATIONS,
        icon: 'bell',
      },
      {
        key: 'profile',
        label: 'الملف الشخصي',
        path: ROUTES.ADMIN_PROFILE,
        icon: 'user',
      },
    ],
  },

  [ROLES.COMPANY]: {
    navItems: [
      {
        key: 'dashboard',
        label: 'الصفحة الرئيسية',
        path: ROUTES.COMPANY_DASHBOARD,
        icon: 'home',
        end: true,
      },
      {
        key: 'reports',
        label: 'البلاغات',
        path: ROUTES.COMPANY_REPORTS,
        icon: 'file-text',
      },
      {
        key: 'teams',
        label: 'فرق الصيانة',
        path: ROUTES.COMPANY_TEAMS,
        icon: 'tool',
      },
      {
        key: 'analytics',
        label: 'التقارير والإحصائيات',
        path: ROUTES.COMPANY_ANALYTICS,
        icon: 'bar-chart',
      },
      {
        key: 'notifications',
        label: 'الإشعارات',
        path: ROUTES.COMPANY_NOTIFICATIONS,
        icon: 'bell',
      },
      {
        key: 'profile',
        label: 'الملف الشخصي',
        path: ROUTES.COMPANY_PROFILE,
        icon: 'user',
      },
    ],
  },
};