const OSRM_BASE_URL = 'https://router.project-osrm.org';

function toLonLatSegment(point) {
  return `${point.lng},${point.lat}`;
}

function formatDistanceFromMeters(distanceInMeters) {
  if (typeof distanceInMeters !== 'number' || Number.isNaN(distanceInMeters)) {
    return '';
  }

  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} م`;
  }

  const distanceInKm = distanceInMeters / 1000;
  const roundedDistance = distanceInKm >= 10 ? distanceInKm.toFixed(1) : distanceInKm.toFixed(2);
  return `${roundedDistance.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')} كم`;
}

function formatDurationFromSeconds(durationInSeconds) {
  if (typeof durationInSeconds !== 'number' || Number.isNaN(durationInSeconds)) {
    return '';
  }

  const totalMinutes = Math.max(1, Math.round(durationInSeconds / 60));

  if (totalMinutes < 60) {
    return `${totalMinutes} دقيقة`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!minutes) {
    return `${hours} ساعة`;
  }

  return `${hours} ساعة ${minutes} دقيقة`;
}

export async function getRouteMatrixFromCurrentLocation(origin, destinations = []) {
  if (!origin?.lat || !origin?.lng || !destinations.length) {
    return {};
  }

  const coordinates = [origin, ...destinations.map((item) => item.position)];
  const coordinatesParam = coordinates.map(toLonLatSegment).join(';');
  const destinationsParam = destinations.map((_, index) => index + 1).join(';');

  const response = await fetch(
    `${OSRM_BASE_URL}/table/v1/driving/${coordinatesParam}?annotations=distance&sources=0&destinations=${destinationsParam}`
  );

  if (!response.ok) {
    throw new Error('تعذر حساب المسافات الدقيقة الآن.');
  }

  const data = await response.json();
  const distances = data?.distances?.[0] ?? [];

  return destinations.reduce((accumulator, destination, index) => {
    const distanceInMeters = distances[index];

    if (typeof distanceInMeters === 'number' && Number.isFinite(distanceInMeters)) {
      accumulator[destination.id] = {
        distanceMeters: distanceInMeters,
        distanceLabel: formatDistanceFromMeters(distanceInMeters),
      };
    }

    return accumulator;
  }, {});
}

export async function getRoutePath(origin, destination) {
  if (!origin?.lat || !origin?.lng || !destination?.position?.lat || !destination?.position?.lng) {
    return null;
  }

  const response = await fetch(
    `${OSRM_BASE_URL}/route/v1/driving/${toLonLatSegment(origin)};${toLonLatSegment(destination.position)}?overview=full&geometries=geojson&steps=true`
  );

  if (!response.ok) {
    throw new Error('تعذر جلب أقصر طريق الآن.');
  }

  const data = await response.json();
  const firstRoute = data?.routes?.[0];

  if (!firstRoute?.geometry?.coordinates?.length) {
    return null;
  }

  return {
    coordinates: firstRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: firstRoute.distance,
    distanceLabel: formatDistanceFromMeters(firstRoute.distance),
    durationSeconds: firstRoute.duration,
    durationLabel: formatDurationFromSeconds(firstRoute.duration),
  };
}

export function calculateCrowDistanceMeters(origin, destination) {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    return null;
  }

  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const latitudeDifference = toRadians(destination.lat - origin.lat);
  const longitudeDifference = toRadians(destination.lng - origin.lng);
  const originLatitude = toRadians(origin.lat);
  const destinationLatitude = toRadians(destination.lat);

  const haversineValue =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) *
      Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2);

  const angularDistance = 2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));
  return earthRadius * angularDistance;
}

export { formatDistanceFromMeters, formatDurationFromSeconds };
