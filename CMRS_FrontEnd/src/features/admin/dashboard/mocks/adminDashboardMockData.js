import { adminReports } from '../../reports/mocks/adminReportsMockData';

function countReports(predicate) {
  return adminReports.filter(predicate).length;
}

function createOptionsFromReports(key, defaultLabel) {
  const uniqueValues = [...new Set(adminReports.map((report) => report[key]))];

  return [
    { value: 'all', label: defaultLabel },
    ...uniqueValues.map((value) => ({
      value,
      label: value,
    })),
  ];
}

export const adminDashboardStats = [
  {
    id: 'total',
    title: 'إجمالي البلاغات',
    subtitle: 'Total Reports',
    value: adminReports.length,
    tone: 'primary',
  },
  {
    id: 'pending',
    title: 'قيد المراجعة',
    subtitle: 'Pending',
    value: countReports((report) =>
      ['قيد المراجعة', 'مقبول', 'بانتظار مراجعة الأدمن'].includes(report.status),
    ),
    tone: 'warning',
  },
  {
    id: 'in-progress',
    title: 'جاري الحل',
    subtitle: 'In Progress',
    value: countReports((report) =>
      ['تم التعيين', 'جاري الحل', 'مطلوب استكمال', 'بانتظار إعادة التعيين'].includes(
        report.status,
      ),
    ),
    tone: 'info',
  },
  {
    id: 'solved',
    title: 'تم الحل',
    subtitle: 'Solved',
    value: countReports((report) => report.status === 'تم الحل'),
    tone: 'success',
  },
];

export const adminDashboardProblemTypeOptions = createOptionsFromReports(
  'type',
  'كل الأنواع',
);

export const adminDashboardStatusOptions = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'قيد المراجعة', label: 'قيد المراجعة' },
  { value: 'مقبول', label: 'مقبول' },
  { value: 'تم التعيين', label: 'تم التعيين' },
  { value: 'جاري الحل', label: 'جاري الحل' },
  { value: 'بانتظار مراجعة الأدمن', label: 'بانتظار مراجعة الأدمن' },
  { value: 'مطلوب استكمال', label: 'مطلوب استكمال' },
  { value: 'بانتظار إعادة التعيين', label: 'بانتظار إعادة التعيين' },
  { value: 'متعذر التنفيذ', label: 'متعذر التنفيذ' },
  { value: 'مرفوض', label: 'مرفوض' },
  { value: 'تم الحل', label: 'تم الحل' },
];

export const adminDashboardPriorityOptions = [
  { value: 'all', label: 'كل الأولويات' },
  { value: 'عالية', label: 'عالية' },
  { value: 'متوسطة', label: 'متوسطة' },
  { value: 'منخفضة', label: 'منخفضة' },
];

export const adminDashboardReports = adminReports.map((report) => ({
  ...report,
  mapId: `admin-dashboard-report-${report.id}`,
}));