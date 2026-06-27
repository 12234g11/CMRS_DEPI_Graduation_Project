export const ADD_REPORT_STEPS = [
  { id: 1, key: 'category', label: 'الفئة' },
  { id: 2, key: 'details', label: 'التفاصيل' },
  { id: 3, key: 'location', label: 'الموقع' },
  { id: 4, key: 'review', label: 'إرسال' },
];

export const ADD_REPORT_CATEGORIES = [
  {
    id: 'roads-pavements',
    label: 'الطرق والرصف',
    subtitle: 'Roads & Pavements',
    iconKey: 'map',
    tone: 'orange',
  },
  {
    id: 'lighting-electricity',
    label: 'الإنارة والكهرباء',
    subtitle: 'Lighting & Electricity',
    iconKey: 'zap',
    tone: 'amber',
  },
  {
    id: 'cleaning-waste',
    label: 'النظافة والمخلفات',
    subtitle: 'Cleaning & Waste',
    iconKey: 'trash',
    tone: 'mint',
  },
  {
    id: 'water-drainage',
    label: 'المياه والصرف',
    subtitle: 'Water & Drainage',
    iconKey: 'droplet',
    tone: 'sky',
  },
  {
    id: 'traffic-signals',
    label: 'الإشارات والمرور',
    subtitle: 'Traffic & Signals',
    iconKey: 'traffic',
    tone: 'rose',
  },
  {
    id: 'trees-gardens',
    label: 'الأشجار والحدائق',
    subtitle: 'Trees & Gardens',
    iconKey: 'tree',
    tone: 'emerald',
  },
  {
    id: 'public-safety',
    label: 'السلامة العامة',
    subtitle: 'Public Safety',
    iconKey: 'shield',
    tone: 'violet',
  },
  {
    id: 'gas',
    label: 'الغاز',
    subtitle: 'Gas',
    iconKey: 'fire',
    tone: 'rose',
  },
  {
    id: 'networks',
    label: 'الشبكات',
    subtitle: 'Networks',
    iconKey: 'wifi',
    tone: 'sky',
  },
  {
    id: 'general-maintenance',
    label: 'صيانة عامة',
    subtitle: 'General Maintenance',
    iconKey: 'tool',
    tone: 'slate',
  },
];

export const REPORT_SEVERITY_OPTIONS = [
  { id: 'low', label: 'منخفضة', subtitle: 'Low', tone: 'success' },
  { id: 'medium', label: 'متوسطة', subtitle: 'Medium', tone: 'warning' },
  { id: 'high', label: 'عالية', subtitle: 'High', tone: 'danger' },
];

export const REPORT_DETAILS_LIMITS = {
  maxImages: 4,
  maxDescriptionLength: 500,
  maxImageSizeMb: 10,
};

export const LOCATION_PREVIEW_MARKERS = [
  {
    id: 'preview-1',
    title: 'بلاغ تم حله',
    subtitle: 'المعادي',
    tone: 'success',
    position: { lat: 29.9619, lng: 31.2563 },
  },
  {
    id: 'preview-2',
    title: 'بلاغ قيد المراجعة',
    subtitle: 'مدينة نصر',
    tone: 'warning',
    position: { lat: 30.0613, lng: 31.3286 },
  },
  {
    id: 'preview-3',
    title: 'بلاغ جاري العمل عليه',
    subtitle: 'وسط البلد',
    tone: 'info',
    position: { lat: 30.0496, lng: 31.2475 },
  },
  {
    id: 'preview-4',
    title: 'بلاغ تم حله',
    subtitle: 'الزمالك',
    tone: 'success',
    position: { lat: 30.0649, lng: 31.2222 },
  },
  {
    id: 'preview-5',
    title: 'بلاغ قيد المراجعة',
    subtitle: 'المقطم',
    tone: 'warning',
    position: { lat: 30.0247, lng: 31.3006 },
  },
];