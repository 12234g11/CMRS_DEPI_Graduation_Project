export const adminProfileMockData = {
  id: 'admin-cairo-1',
  name: 'أمين النظام',
  role: 'Admin',
  roleLabel: 'مدير المحافظة',
  email: 'admin.cairo@cmrs.local',
  phone: '+20 100 000 0000',
  governorate: 'القاهرة',
  department: 'إدارة متابعة البلاغات والصيانة',
  status: 'active',
  lastLogin: '2026-06-27 - 10:35 AM',
  joinedAt: '2026-01-10',

  workScope: {
    governorate: 'القاهرة',
    managedReports: 80,
    activeCompanies: 6,
    pendingReports: 10,
    completedReports: 317,
  },

  permissions: [
    {
      id: 'reports',
      label: 'إدارة البلاغات',
      description: 'مراجعة البلاغات وتحديث حالتها وتعيين الشركات المناسبة.',
    },
    {
      id: 'companies',
      label: 'إدارة الشركات',
      description: 'إضافة شركات الصيانة ومتابعة حالة التشغيل وحساب الدخول.',
    },
    {
      id: 'analytics',
      label: 'التقارير والإحصائيات',
      description: 'متابعة مؤشرات البلاغات والأداء داخل المحافظة.',
    },
  ],

  recentActivities: [
    {
      id: 'activity-1',
      title: 'مراجعة بلاغ جديد',
      description: 'تمت مراجعة بلاغ خاص بالطرق والرصف داخل نطاق المحافظة.',
      time: 'منذ 20 دقيقة',
    },
    {
      id: 'activity-2',
      title: 'تحديث حالة شركة',
      description: 'تم تحديث حالة تشغيل إحدى شركات الصيانة.',
      time: 'منذ ساعتين',
    },
    {
      id: 'activity-3',
      title: 'متابعة الإحصائيات',
      description: 'تمت مراجعة مؤشرات البلاغات والتقارير اليومية.',
      time: 'اليوم',
    },
  ],
};