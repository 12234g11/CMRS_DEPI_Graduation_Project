export const nearbyIssues = [
  { id: 1, title: 'طريق تالف', distance: '0.5 كم' },
  { id: 2, title: 'حفرة', distance: '0.2 كم' },
  { id: 3, title: 'إشارة معطلة', distance: '2.2 كم' },
  { id: 4, title: 'ماسورة تالفة', distance: '1.5 كم' },
];

export const userRecentReports = [
  {
    id: 'R-101',
    issue: 'طريق تالف',
    date: '2026-03-26',
    status: 'قيد المراجعة',
    statusTone: 'warning',
  },
  {
    id: 'R-102',
    issue: 'إشارة معطلة',
    date: '2026-03-20',
    status: 'تم الحل',
    statusTone: 'success',
  },
  {
    id: 'R-103',
    issue: 'تسريب مياه',
    date: '2026-03-18',
    status: 'جاري الحل',
    statusTone: 'info',
  },
];

export const adminCompanies = [
  { id: 1, name: 'شركة 1', task: 'تخصيص كهرباء', pending: '2 مهام', tone: 'warning' },
  { id: 2, name: 'شركة 2', task: 'تخصيص طرق', pending: '4 مهام', tone: 'danger' },
  { id: 3, name: 'شركة 3', task: 'تخصيص مياه', pending: '2 مهام', tone: 'success' },
  { id: 4, name: 'شركة 4', task: 'تخصيص نظافة', pending: '1 مهمة', tone: 'warning' },
];

export const adminReports = [
  {
    id: 'R-201',
    service: 'طرق',
    location: 'مدينة نصر',
    date: '2026-03-26',
    company: 'لا يوجد تخصيص',
    status: 'قيد المراجعة',
    statusTone: 'warning',
  },
  {
    id: 'R-202',
    service: 'كهرباء',
    location: 'المعادي',
    date: '2026-03-24',
    company: 'شركة الكهرباء',
    status: 'تم الحل',
    statusTone: 'success',
  },
  {
    id: 'R-203',
    service: 'مياه',
    location: 'حلوان',
    date: '2026-03-22',
    company: 'شركة المياه',
    status: 'جاري الحل',
    statusTone: 'info',
  },
];

export const companyReports = [
  {
    id: 'R-301',
    issue: 'طريق تالف',
    date: '2026-03-26',
    priority: 4,
    status: 'مهمة',
    statusTone: 'danger',
  },
  {
    id: 'R-302',
    issue: 'إشارة معطلة',
    date: '2026-03-20',
    priority: 4,
    status: 'مهمة',
    statusTone: 'danger',
  },
  {
    id: 'R-303',
    issue: 'إنارة شارع',
    date: '2026-03-18',
    priority: 3,
    status: 'في انتظار إجراء',
    statusTone: 'warning',
  },
];