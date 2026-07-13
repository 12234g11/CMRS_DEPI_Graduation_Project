export const COMPANY_NOTIFICATION_TYPES = {
  REPORT_ASSIGNED: 'report_assigned',
  ADMIN_FEEDBACK: 'admin_feedback',
  NEEDS_COMPLETION: 'completion_requested',
  COMPLETION_REQUESTED: 'completion_requested',
  CANNOT_FIX_ACCEPTED: 'cannot_fix_accepted',
  SOLUTION_ACCEPTED: 'solution_accepted',
  SYSTEM: 'system',
};

export const COMPANY_NOTIFICATION_READ_FILTERS = {
  ALL: 'all',
  UNREAD: 'unread',
};

export const companyNotificationFilterOptions = [
  {
    value: 'all',
    label: 'كل الأنواع',
    description: 'عرض جميع إشعارات الشركة',
  },
  {
    value: COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED,
    label: 'بلاغات مسندة',
    description: 'البلاغات الجديدة التي تم إسنادها للشركة',
  },
  {
    value: COMPANY_NOTIFICATION_TYPES.CANNOT_FIX_ACCEPTED,
    label: 'اعتذارات مقبولة',
    description: 'طلبات تعذر التنفيذ التي وافق عليها الأدمن',
  },
  {
    value: COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED,
    label: 'حلول مقبولة',
    description: 'الحلول التي وافق عليها الأدمن',
  },
  {
    value: COMPANY_NOTIFICATION_TYPES.NEEDS_COMPLETION,
    label: 'مطلوب استكمال',
    description: 'الحلول التي تحتاج استكمالًا أو تعديلًا',
  },
];
