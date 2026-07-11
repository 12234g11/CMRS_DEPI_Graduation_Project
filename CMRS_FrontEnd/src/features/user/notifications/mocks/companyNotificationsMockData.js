export const COMPANY_NOTIFICATION_TYPES = {
  REPORT_ASSIGNED: 'report_assigned',
  ADMIN_FEEDBACK: 'admin_feedback',
  NEEDS_COMPLETION: 'needs_completion',
  SOLUTION_ACCEPTED: 'solution_accepted',
  SYSTEM: 'system',
};

// The company page intentionally exposes only the three requested type filters,
// in addition to the default "all types" option.
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

export const companyNotifications = [
  {
    id: 'notif-1',
    type: COMPANY_NOTIFICATION_TYPES.NEEDS_COMPLETION,
    typeLabel: 'مطلوب استكمال',
    tone: 'warning',
    title: 'الأدمن طلب استكمال الحل',
    message:
      'الأدمن طلب رفع صورة أوضح بعد الإصلاح قبل اعتماد إغلاق البلاغ.',
    reportId: 'C-103',
    reportNumber: 'C-103',
    reportTitle: 'كشاف إنارة مكسور',
    location: 'شارع 26 يوليو، الزمالك',
    priority: 'متوسطة',
    priorityTone: 'warning',
    isRead: false,
    createdAt: '2026-07-10T21:35:00Z',
  },
  {
    id: 'notif-2',
    type: COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED,
    typeLabel: 'بلاغ مسند',
    tone: 'primary',
    title: 'تم إسناد بلاغ جديد للشركة',
    message:
      'تم إسناد بلاغ إنارة معطلة إلى الشركة، برجاء مراجعة التفاصيل وتعيين فرقة صيانة.',
    reportId: 'C-101',
    reportNumber: 'C-101',
    reportTitle: 'إنارة معطلة',
    location: 'شارع عباس العقاد، مدينة نصر',
    priority: 'عالية',
    priorityTone: 'danger',
    isRead: false,
    createdAt: '2026-07-10T20:45:00Z',
  },
  {
    id: 'notif-3',
    type: COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK,
    typeLabel: 'رد الأدمن',
    tone: 'info',
    title: 'ملاحظة من الأدمن على بلاغ قائم',
    message:
      'برجاء بدء التنفيذ خلال أقرب وقت، البلاغ له أولوية بسبب تكرار الشكاوى في نفس المنطقة.',
    reportId: 'C-102',
    reportNumber: 'C-102',
    reportTitle: 'أعمدة إنارة متعددة معطلة',
    location: 'الهضبة الوسطى، المقطم',
    priority: 'عالية',
    priorityTone: 'danger',
    isRead: true,
    createdAt: '2026-07-10T16:20:00Z',
  },
  {
    id: 'notif-4',
    type: COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED,
    typeLabel: 'حل مقبول',
    tone: 'success',
    title: 'تم قبول الحل وإغلاق البلاغ',
    message: 'الأدمن قبل الحل المرسل وتم تحويل حالة البلاغ إلى تم الحل.',
    reportId: 'C-104',
    reportNumber: 'C-104',
    reportTitle: 'ضعف إنارة',
    location: 'كورنيش المعادي',
    priority: 'منخفضة',
    priorityTone: 'success',
    isRead: true,
    createdAt: '2026-07-09T19:15:00Z',
  },
  {
    id: 'notif-5',
    type: COMPANY_NOTIFICATION_TYPES.SYSTEM,
    typeLabel: 'تنبيه نظام',
    tone: 'neutral',
    title: 'تحديث بيانات فرق الصيانة',
    message:
      'يفضل مراجعة حالة توفر فرق الصيانة حتى يتم توزيع البلاغات بشكل أدق.',
    reportId: null,
    reportNumber: null,
    reportTitle: null,
    location: null,
    priority: null,
    priorityTone: null,
    isRead: false,
    createdAt: '2026-07-09T11:30:00Z',
  },
];

export function getCompanyNotificationsStats(
  notifications = companyNotifications,
) {
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const adminFeedbackCount = notifications.filter((notification) =>
    [
      COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK,
      COMPANY_NOTIFICATION_TYPES.NEEDS_COMPLETION,
    ].includes(notification.type),
  ).length;

  const assignedCount = notifications.filter(
    (notification) =>
      notification.type === COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED,
  ).length;

  return [
    {
      id: 'total',
      title: 'إجمالي الإشعارات',
      subtitle: 'Total Notifications',
      value: notifications.length,
      tone: 'primary',
    },
    {
      id: 'unread',
      title: 'غير مقروءة',
      subtitle: 'Unread',
      value: unreadCount,
      tone: 'warning',
    },
    {
      id: 'admin',
      title: 'ردود الأدمن',
      subtitle: 'Admin Feedback',
      value: adminFeedbackCount,
      tone: 'info',
    },
    {
      id: 'assigned',
      title: 'بلاغات جديدة',
      subtitle: 'New Assignments',
      value: assignedCount,
      tone: 'success',
    },
  ];
}
