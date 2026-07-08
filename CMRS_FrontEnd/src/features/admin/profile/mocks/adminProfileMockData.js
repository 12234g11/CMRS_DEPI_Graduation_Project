export const adminProfileMockData = {
  id: 'cff263b7-56d5-4065-88d7-03700a36898f',
  name: 'Admin241Giza@gmail.com',
  role: 'Admin',
  roleLabel: 'مشرف نظام',
  email: 'Admin241Giza@gmail.com',
  phone: '',
  governorate: 'الجيزة',
  department: 'إدارة النظام',
  status: 'نشط',
  lastLogin: '2026-07-07T21:19:47.3026273Z',
  joinedAt: '2026-07-03T13:58:58.4166667',

  workScope: {
    governorate: 'الجيزة',
    managedReports: 15,
    activeCompanies: 0,
    pendingReports: 13,
    completedReports: 0,
  },

  permissions: [
    {
      id: 'reports.manage',
      label: 'إدارة البلاغات',
      description: 'القدرة على مراجعة البلاغات، تحويلها لشركات الصيانة، وتحديث حالتها',
    },
    {
      id: 'companies.manage',
      label: 'إدارة شركات الصيانة',
      description: 'صلاحية دعوة شركات جديدة وإدارة حساباتها ضمن النطاق',
    },
    {
      id: 'analytics.view',
      label: 'عرض الإحصائيات',
      description: 'الوصول إلى لوحة الإحصائيات التفصيلية للمنطقة',
    },
    {
      id: 'communications.send',
      label: 'التواصل والإشعارات',
      description: 'إرسال وتلقي الرسائل والإشعارات المباشرة للمواطنين والشركات',
    },
  ],

  recentActivities: [
    {
      id: '2507f98a-0821-4a6d-8f1d-88f8d9962df4',
      title: 'قبول بلاغ',
      description: "تم تحديث حالة البلاغ 'string' إلى 'مقبول'",
      time: '2026-07-06T12:12:43.2540483',
    },
    {
      id: 'fbc851f5-1012-4a7f-a9a2-cc054c4f9ccb',
      title: 'قبول بلاغ',
      description: "تم تحديث حالة البلاغ 'مشكلة في انارة المدينة' إلى 'مقبول'",
      time: '2026-07-05T19:26:38.3732583',
    },
    {
      id: 'c51712de-d73d-41ed-8053-dd992d52163e',
      title: 'قبول بلاغ',
      description: "تم تحديث حالة البلاغ 'string' إلى 'مقبول'",
      time: '2026-07-05T17:50:25.3417433',
    },
  ],
};
