//temp

export const REPORT_LOCATION_PRESETS = [
  {
    id: 'maadi',
    area: 'المعادي',
    address: 'شارع النصر - بالقرب من كارفور المعادي',
    position: { lat: 29.9602, lng: 31.2569 },
  },
  {
    id: 'nasr-city',
    area: 'مدينة نصر',
    address: 'شارع مكرم عبيد - أمام الحديقة الدولية',
    position: { lat: 30.0626, lng: 31.3303 },
  },
  {
    id: 'downtown',
    area: 'وسط البلد',
    address: 'تقاطع طلعت حرب مع قصر النيل',
    position: { lat: 30.0505, lng: 31.2454 },
  },
  {
    id: 'zamalek',
    area: 'الزمالك',
    address: 'شارع محمد مظهر - بجوار نادي الجزيرة',
    position: { lat: 30.0647, lng: 31.2196 },
  },
  {
    id: 'mokattam',
    area: 'المقطم',
    address: 'ميدان النافورة - قرب الهضبة الوسطى',
    position: { lat: 30.0223, lng: 31.3037 },
  },
];

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceInKm(firstPosition, secondPosition) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(secondPosition.lat - firstPosition.lat);
  const dLng = toRadians(secondPosition.lng - firstPosition.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(firstPosition.lat)) *
      Math.cos(toRadians(secondPosition.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function normalizeReportPosition(position = null) {
  const lat = Number(position?.lat);
  const lng = Number(position?.lng);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  return { ...REPORT_LOCATION_PRESETS[0].position };
}

export function getClosestReportArea(position = null) {
  const normalizedPosition = normalizeReportPosition(position);

  return REPORT_LOCATION_PRESETS.reduce((closestPreset, preset) => {
    const currentDistance = getDistanceInKm(normalizedPosition, preset.position);
    const closestDistance = getDistanceInKm(normalizedPosition, closestPreset.position);

    return currentDistance < closestDistance ? preset : closestPreset;
  }, REPORT_LOCATION_PRESETS[0]);
}

export function formatReportCoordinates(position = null) {
  const normalizedPosition = normalizeReportPosition(position);

  return `${normalizedPosition.lat.toFixed(5)}, ${normalizedPosition.lng.toFixed(5)}`;
}

export function buildReportLocationDetails(position = null, customText = '') {
  const normalizedPosition = normalizeReportPosition(position);
  const closestPreset = getClosestReportArea(normalizedPosition);
  const normalizedCustomText = customText?.trim();

  if (normalizedCustomText) {
    return {
      area: closestPreset.area,
      address: normalizedCustomText,
      label: normalizedCustomText,
      coordinatesLabel: formatReportCoordinates(normalizedPosition),
    };
  }

  const label = `${closestPreset.area} - ${closestPreset.address}`;

  return {
    area: closestPreset.area,
    address: closestPreset.address,
    label,
    coordinatesLabel: formatReportCoordinates(normalizedPosition),
  };
}
