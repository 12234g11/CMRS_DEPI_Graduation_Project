export const reportMapLegend = [
  { key: 'solved', label: 'تم الحل', tone: 'success' },
  { key: 'in-progress', label: 'جاري الحل', tone: 'info' },
  { key: 'under-review', label: 'قيد المراجعة', tone: 'warning' },
];

export const reportMapMarkers = [
  {
    id: 'marker-1',
    title: 'طريق تالف',
    subtitle: 'مدينة نصر',
    statusLabel: 'قيد المراجعة',
    tone: 'warning',
    position: { lat: 30.0626, lng: 31.3303 },
  },
  {
    id: 'marker-2',
    title: 'إشارة معطلة',
    subtitle: 'وسط البلد',
    statusLabel: 'جاري الحل',
    tone: 'info',
    position: { lat: 30.0505, lng: 31.2454 },
  },
  {
    id: 'marker-3',
    title: 'إنارة شارع',
    subtitle: 'المقطم',
    statusLabel: 'تم الحل',
    tone: 'success',
    position: { lat: 30.0223, lng: 31.3037 },
  },
  {
    id: 'marker-4',
    title: 'ماسورة تالفة',
    subtitle: 'الزمالك',
    statusLabel: 'قيد المراجعة',
    tone: 'warning',
    position: { lat: 30.0647, lng: 31.2196 },
  },
  {
    id: 'marker-5',
    title: 'رصيف مكسور',
    subtitle: 'المعادي',
    statusLabel: 'تم الحل',
    tone: 'success',
    position: { lat: 29.9602, lng: 31.2569 },
  },
];
