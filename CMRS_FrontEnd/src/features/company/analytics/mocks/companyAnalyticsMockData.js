export const companyAnalyticsStats = [
  {
    id: 'assigned',
    title: 'بلاغات مسندة',
    subtitle: 'Assigned Reports',
    value: 24,
    change: 12,
    tone: 'primary',
  },
  {
    id: 'in-progress',
    title: 'جاري التنفيذ',
    subtitle: 'In Progress',
    value: 7,
    change: 8,
    tone: 'info',
  },
  {
    id: 'pending-review',
    title: 'بانتظار الأدمن',
    subtitle: 'Pending Review',
    value: 5,
    change: 6,
    tone: 'warning',
  },
  {
    id: 'solved',
    title: 'تم الحل',
    subtitle: 'Solved',
    value: 12,
    change: 18,
    tone: 'success',
  },
];

export const companyReportsTrendData = [
  {
    month: 'يناير',
    assigned: 10,
    solved: 6,
  },
  {
    month: 'فبراير',
    assigned: 14,
    solved: 8,
  },
  {
    month: 'مارس',
    assigned: 18,
    solved: 11,
  },
  {
    month: 'أبريل',
    assigned: 16,
    solved: 10,
  },
  {
    month: 'مايو',
    assigned: 22,
    solved: 14,
  },
  {
    month: 'يونيو',
    assigned: 24,
    solved: 12,
  },
];

export const companyStatusDistributionData = [
  {
    id: 'assigned',
    label: 'تم التعيين',
    value: 6,
    tone: 'blue',
  },
  {
    id: 'in-progress',
    label: 'جاري التنفيذ',
    value: 7,
    tone: 'violet',
  },
  {
    id: 'pending-review',
    label: 'بانتظار مراجعة الأدمن',
    value: 5,
    tone: 'orange',
  },
  {
    id: 'needs-completion',
    label: 'مطلوب استكمال',
    value: 2,
    tone: 'yellow',
  },
  {
    id: 'solved',
    label: 'تم الحل',
    value: 12,
    tone: 'green',
  },
];

export const companyAnalyticsSummary = {
  companyName: 'شركة كهرباء القاهرة',
  periodLabel: 'آخر 6 شهور',
  averageClosingTime: '2.4 يوم',
  completionRate: 62,
};