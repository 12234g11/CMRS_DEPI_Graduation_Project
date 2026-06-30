export const COMPANY_NOTIFICATION_TYPES = {
  REPORT_ASSIGNED: 'report_assigned',
  ADMIN_FEEDBACK: 'admin_feedback',
  NEEDS_COMPLETION: 'needs_completion',
  SOLUTION_ACCEPTED: 'solution_accepted',
  SYSTEM: 'system',
};

export const companyNotificationFilterOptions = [
  { value: 'all', label: 'كل الإشعارات' },
  { value: 'unread', label: 'غير المقروءة' },
  { value: COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED, label: 'بلاغات مسندة' },
  { value: COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK, label: 'ردود الأدمن' },
  { value: COMPANY_NOTIFICATION_TYPES.NEEDS_COMPLETION, label: 'مطلوب استكمال' },
  { value: COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED, label: 'حلول مقبولة' },
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
    reportTitle: 'كشاف إنارة مكسور',
    location: 'شارع 26 يوليو، الزمالك',
    priority: 'متوسطة',
    priorityTone: 'warning',
    isRead: false,
    time: 'منذ 10 دقائق',
    createdAt: '2026-06-30 09:35 PM',
  },
  {
    id: 'notif-2',
    type: COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED,
    typeLabel: 'بلاغ جديد',
    tone: 'primary',
    title: 'تم إسناد بلاغ جديد للشركة',
    message:
      'تم إسناد بلاغ إنارة معطلة إلى الشركة، برجاء مراجعة التفاصيل وتعيين فرقة صيانة.',
    reportId: 'C-101',
    reportTitle: 'إنارة معطلة',
    location: 'شارع عباس العقاد، مدينة نصر',
    priority: 'عالية',
    priorityTone: 'danger',
    isRead: false,
    time: 'منذ ساعة',
    createdAt: '2026-06-30 08:45 PM',
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
    reportTitle: 'أعمدة إنارة متعددة معطلة',
    location: 'الهضبة الوسطى، المقطم',
    priority: 'عالية',
    priorityTone: 'danger',
    isRead: true,
    time: 'اليوم - 04:20 PM',
    createdAt: '2026-06-30 04:20 PM',
  },
  {
    id: 'notif-4',
    type: COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED,
    typeLabel: 'تم قبول الحل',
    tone: 'success',
    title: 'تم قبول الحل وإغلاق البلاغ',
    message:
      'الأدمن قبل الحل المرسل وتم تحويل حالة البلاغ إلى تم الحل.',
    reportId: 'C-104',
    reportTitle: 'ضعف إنارة',
    location: 'كورنيش المعادي',
    priority: 'منخفضة',
    priorityTone: 'success',
    isRead: true,
    time: 'أمس - 07:15 PM',
    createdAt: '2026-06-29 07:15 PM',
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
    reportTitle: null,
    location: null,
    priority: null,
    priorityTone: null,
    isRead: false,
    time: 'أمس - 11:30 AM',
    createdAt: '2026-06-29 11:30 AM',
  },
];

export function getCompanyNotificationsStats(notifications = companyNotifications) {
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const adminFeedbackCount = notifications.filter((notification) =>
    [
      COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK,
      COMPANY_NOTIFICATION_TYPES.NEEDS_COMPLETION,
    ].includes(notification.type),
  ).length;

  const assignedCount = notifications.filter(
    (notification) => notification.type === COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED,
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