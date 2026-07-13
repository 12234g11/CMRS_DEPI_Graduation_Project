const TONE_COLORS = {
  warning: {
    primary: '#f59e0b',
    secondary: '#fff7ed',
    surface: '#fffbeb',
  },
  info: {
    primary: '#3b82f6',
    secondary: '#eff6ff',
    surface: '#f8fbff',
  },
  success: {
    primary: '#10b981',
    secondary: '#ecfdf5',
    surface: '#f7fffb',
  },
  danger: {
    primary: '#ef4444',
    secondary: '#fef2f2',
    surface: '#fff8f8',
  },
  primary: {
    primary: '#025f48',
    secondary: '#e8fff4',
    surface: '#f7fffb',
  },
};

function escapeSvgText(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildReportPreviewImage({
  title = 'بلاغ جديد',
  categoryLabel = 'أخرى',
  tone = 'warning',
} = {}) {
  const palette = TONE_COLORS[tone] || TONE_COLORS.warning;
  const safeTitle = escapeSvgText(title).slice(0, 46);
  const safeCategory = escapeSvgText(categoryLabel).slice(0, 24);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="900" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.surface}" />
          <stop offset="1" stop-color="#ffffff" />
        </linearGradient>
      </defs>

      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <rect x="74" y="70" width="1052" height="760" rx="42" fill="#ffffff" stroke="${palette.secondary}" stroke-width="6" />
      <rect x="118" y="116" width="230" height="80" rx="24" fill="${palette.secondary}" />
      <text x="233" y="166" text-anchor="middle" fill="${palette.primary}" font-family="Cairo, Arial, sans-serif" font-size="34" font-weight="700">${safeCategory}</text>

      <circle cx="600" cy="395" r="148" fill="${palette.secondary}" />
      <path d="M600 278C534.8 278 482 330.8 482 396C482 478.5 600 622 600 622C600 622 718 478.5 718 396C718 330.8 665.2 278 600 278ZM600 448C570.6 448 546 423.4 546 394C546 364.6 570.6 340 600 340C629.4 340 654 364.6 654 394C654 423.4 629.4 448 600 448Z" fill="${palette.primary}" fill-opacity="0.9" />
      <rect x="210" y="632" width="780" height="88" rx="30" fill="${palette.surface}" />
      <text x="600" y="688" text-anchor="middle" fill="#0f3f32" font-family="Cairo, Arial, sans-serif" font-size="46" font-weight="800">${safeTitle}</text>
      <text x="600" y="764" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="32" font-weight="600">Citizen Report Preview</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default buildReportPreviewImage;
