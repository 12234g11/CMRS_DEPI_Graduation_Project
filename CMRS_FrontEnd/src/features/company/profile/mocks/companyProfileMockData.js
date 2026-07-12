export const companyProfileMockData = {
  id: 'company-cairo-electricity-1',
  companyName: 'شركة كهرباء القاهرة',
  accountType: 'حساب شركة',
  status: 'active',
  statusLabel: 'نشط',
  accountStatus: 'active',
  accountStatusLabel: 'مفعل',
  loginEmail: 'company.cairo.electricity@test.com',

  commercialName: 'شركة كهرباء القاهرة للصيانة',
  governorate: 'القاهرة',

  contactPerson: {
    name: 'م. خالد عبد الرحمن',
    role: 'مسؤول تشغيل البلاغات',
    phone: '+20 100 555 7788',
    email: 'operations@cairo-electricity.test',
  },

  officialContact: {
    phone: '+20 2 2400 1188',
    address: 'مدينة نصر، القاهرة',
  },

  performance: {
    assignedReports: 24,
    activeReports: 7,
    pendingAdminReview: 5,
    solvedReports: 12,
    teamsCount: 5,
    completionRate: 62,
    averageClosingTime: '2.4 يوم',
  },

  joinedAt: '2026-01-15',
  lastProfileUpdate: '2026-06-28 - 04:15 PM',
};

export function getCompanyProfileStats(profile = companyProfileMockData) {
  return [
    {
      id: 'assigned',
      title: 'بلاغات مسندة',
      subtitle: 'Assigned Reports',
      value: profile.performance?.assignedReports ?? 0,
      tone: 'primary',
    },
    {
      id: 'active',
      title: 'بلاغات نشطة',
      subtitle: 'Active Reports',
      value: profile.performance?.activeReports ?? 0,
      tone: 'info',
    },
    {
      id: 'pending',
      title: 'بانتظار الأدمن',
      subtitle: 'Pending Review',
      value: profile.performance?.pendingAdminReview ?? 0,
      tone: 'warning',
    },
    {
      id: 'solved',
      title: 'تم الحل',
      subtitle: 'Solved Reports',
      value: profile.performance?.solvedReports ?? 0,
      tone: 'success',
    },
  ];
}