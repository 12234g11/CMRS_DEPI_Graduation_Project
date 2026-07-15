import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import { divIcon, latLngBounds } from 'leaflet';
import { FiMinus, FiPlus } from 'react-icons/fi';
import CurrentLocationButton from './CurrentLocationButton';
import useCurrentLocation from '../hooks/useCurrentLocation';
import { getRoutePath } from '../api/mapRoutingApi';

const FALLBACK_CENTER = [30.04442, 31.235712];
const DEFAULT_ZOOM = 12;
const ACTIVE_MARKER_ZOOM = 16;
const CURRENT_LOCATION_ZOOM = 17;

const LIGHT_TILE = {
  key: 'light',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

function buildMarkerIcon(tone = 'info', isActive = false) {
  return divIcon({
    className: 'reports-map__marker-wrapper',
    html: `
      <span class="reports-map__marker reports-map__marker--${tone} ${isActive ? 'is-active' : ''}">
        <span class="reports-map__marker-core"></span>
      </span>
    `,
    iconSize: isActive ? [34, 34] : [26, 26],
    iconAnchor: isActive ? [17, 34] : [13, 26],
    popupAnchor: [0, -24],
  });
}

function buildCurrentLocationIcon() {
  return divIcon({
    className: 'reports-map__user-marker-wrapper',
    html: `
      <span class="reports-map__user-marker">
        <span class="reports-map__user-marker-core"></span>
      </span>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
  });
}

function dedupeMarkers(markers = [], activeMarkerId = null) {
  const grouped = new Map();

  markers.forEach((marker) => {
    const lat = Number(marker?.position?.lat);
    const lng = Number(marker?.position?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    const locationKey = `${lat.toFixed(6)}|${lng.toFixed(6)}`;
    const existingMarker = grouped.get(locationKey);

    if (!existingMarker) {
      grouped.set(locationKey, marker);
      return;
    }

    const currentIsActive = marker?.id === activeMarkerId;
    const existingIsActive = existingMarker?.id === activeMarkerId;

    if (currentIsActive && !existingIsActive) {
      grouped.set(locationKey, marker);
      return;
    }

    if (!existingIsActive) {
      const currentPriority = marker?.id?.startsWith('nearby-') ? 2 : 1;
      const existingPriority = existingMarker?.id?.startsWith('nearby-') ? 2 : 1;

      if (currentPriority > existingPriority) {
        grouped.set(locationKey, marker);
      }
    }
  });

  return Array.from(grouped.values());
}

function FlyToView({ view }) {
  const map = useMap();

  useEffect(() => {
    if (!view?.center?.length) return;

    map.flyTo(
      view.center,
      typeof view.zoom === 'number' ? view.zoom : map.getZoom(),
      {
        animate: true,
        duration: 1.2,
      },
    );
  }, [map, view]);

  return null;
}

function FocusOnMarker({ markers, activeMarkerId, zoom = ACTIVE_MARKER_ZOOM }) {
  const map = useMap();

  useEffect(() => {
    if (!activeMarkerId) return;

    const targetMarker = markers.find((marker) => marker.id === activeMarkerId);
    if (!targetMarker?.position?.lat || !targetMarker?.position?.lng) return;

    map.flyTo([targetMarker.position.lat, targetMarker.position.lng], zoom, {
      animate: true,
      duration: 1.2,
    });
  }, [activeMarkerId, map, markers, zoom]);

  return null;
}

function FitRouteBounds({ routeCoordinates = [] }) {
  const map = useMap();

  useEffect(() => {
    if (!routeCoordinates.length) return;

    map.fitBounds(latLngBounds(routeCoordinates), {
      animate: true,
      duration: 1.2,
      padding: [56, 56],
    });
  }, [map, routeCoordinates]);

  return null;
}

function ReportsMapControls({
  onLocateMe,
  isLocating,
  showCurrentLocationControl = true,
}) {
  const map = useMap();

  function handleZoomIn(event) {
    event.preventDefault();
    event.stopPropagation();
    map.zoomIn();
  }

  function handleZoomOut(event) {
    event.preventDefault();
    event.stopPropagation();
    map.zoomOut();
  }

  return (
    <div className="reports-map__controls">
      <div
        className="reports-map__zoom-group"
        aria-label="عناصر التحكم في تكبير الخريطة"
      >
        <button
          type="button"
          className="reports-map__zoom-btn"
          onClick={handleZoomIn}
          aria-label="تكبير الخريطة"
          title="تكبير"
        >
          <FiPlus />
        </button>

        <button
          type="button"
          className="reports-map__zoom-btn"
          onClick={handleZoomOut}
          aria-label="تصغير الخريطة"
          title="تصغير"
        >
          <FiMinus />
        </button>
      </div>

      {showCurrentLocationControl ? (
        <div className="reports-map__utility-group">
          <CurrentLocationButton onClick={onLocateMe} isLoading={isLocating} />
        </div>
      ) : null}
    </div>
  );
}

function DefaultPopupContent({ marker }) {
  return (
    <div className="reports-map__popup">
      <strong>{marker.title}</strong>
      <span>{marker.area || marker.subtitle}</span>
      <small>{marker.statusLabel}</small>

      {marker.distanceLabel || marker.distance ? (
        <small>
          يبعد عنك: {marker.distanceLabel || marker.distance}
        </small>
      ) : null}

      {marker.address ? <small>{marker.address}</small> : null}
    </div>
  );
}

function ReportsMap({
  markers = [],
  userLocation = null,
  height = 360,
  activeMarkerId = null,
  onMarkerSelect,
  onCurrentLocationChange,
  routeDestination = null,
  showCurrentLocationControl = true,
  showMarkerPopups = true,
  renderPopupContent,
}) {
  const markerRefs = useRef({});
  const lastReportedLocationKeyRef = useRef(null);
  const dedupedMarkers = useMemo(
    () => dedupeMarkers(markers, activeMarkerId),
    [markers, activeMarkerId],
  );

  const initialCenter = useMemo(() => {
    if (userLocation?.lat && userLocation?.lng) {
      return [userLocation.lat, userLocation.lng];
    }

    const firstMarker = dedupedMarkers[0]?.position;

    if (firstMarker?.lat && firstMarker?.lng) {
      return [firstMarker.lat, firstMarker.lng];
    }

    return FALLBACK_CENTER;
  }, [dedupedMarkers, userLocation]);

  const [mapView, setMapView] = useState({
    center: initialCenter,
    zoom: DEFAULT_ZOOM,
  });

  const [showCurrentLocationMarker, setShowCurrentLocationMarker] = useState(false);
  const [routePath, setRoutePath] = useState(null);
  const [routeError, setRouteError] = useState('');

  const { location, isLoading, error, requestLocation } = useCurrentLocation();

  useEffect(() => {
    if (showCurrentLocationMarker || activeMarkerId || routeDestination) {
      return;
    }

    setMapView({
      center: initialCenter,
      zoom: DEFAULT_ZOOM,
    });
  }, [initialCenter, showCurrentLocationMarker, activeMarkerId, routeDestination]);

  useEffect(() => {
    if (!showCurrentLocationMarker) return;
    if (!location?.lat || !location?.lng) return;

    setMapView({
      center: [location.lat, location.lng],
      zoom: CURRENT_LOCATION_ZOOM,
    });
  }, [location, showCurrentLocationMarker]);

  useEffect(() => {
    if (!activeMarkerId) {
      Object.values(markerRefs.current).forEach((markerInstance) => {
        markerInstance?.closePopup?.();
      });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const markerInstance = markerRefs.current[activeMarkerId];

      if (markerInstance?.openPopup) {
        markerInstance.openPopup();
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [activeMarkerId]);

  useEffect(() => {
    if (typeof onCurrentLocationChange !== 'function') return;

    const latitude = Number(location?.lat);
    const longitude = Number(location?.lng);
    const hasValidLocation =
      showCurrentLocationMarker &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude);

    const locationKey = hasValidLocation
      ? `${latitude.toFixed(7)}|${longitude.toFixed(7)}`
      : 'no-current-location';

    if (lastReportedLocationKeyRef.current === locationKey) {
      return;
    }

    lastReportedLocationKeyRef.current = locationKey;
    onCurrentLocationChange(
      hasValidLocation ? { lat: latitude, lng: longitude } : null
    );
  }, [
    location?.lat,
    location?.lng,
    onCurrentLocationChange,
    showCurrentLocationMarker,
  ]);

  useEffect(() => {
    let isCancelled = false;

    if (
      !showCurrentLocationMarker ||
      !location?.lat ||
      !location?.lng ||
      !routeDestination?.position
    ) {
      setRoutePath(null);
      setRouteError('');
      return undefined;
    }

    setRouteError('');

    getRoutePath(location, routeDestination)
      .then((nextRoutePath) => {
        if (!isCancelled) {
          setRoutePath(nextRoutePath);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setRoutePath(null);
          setRouteError('تعذر عرض أقصر طريق الآن. حاول مرة أخرى بعد قليل.');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [location, routeDestination, showCurrentLocationMarker]);

  function handleLocateMe() {
    setShowCurrentLocationMarker(true);
    requestLocation();
  }

  return (
    <div className="reports-map">
      <MapContainer
        center={mapView.center}
        zoom={mapView.zoom}
        zoomControl={false}
        scrollWheelZoom
        className="reports-map__canvas"
        style={{ height: `${height}px` }}
      >
        <TileLayer
          key={LIGHT_TILE.key}
          attribution={LIGHT_TILE.attribution}
          url={LIGHT_TILE.url}
        />

        <FlyToView view={mapView} />

        <FocusOnMarker
          markers={dedupedMarkers}
          activeMarkerId={activeMarkerId}
        />

        {routePath?.coordinates?.length ? (
          <FitRouteBounds routeCoordinates={routePath.coordinates} />
        ) : null}

        <ReportsMapControls
          onLocateMe={handleLocateMe}
          isLocating={isLoading}
          showCurrentLocationControl={showCurrentLocationControl}
        />

        {dedupedMarkers.map((marker) => {
          const isActive = marker.id === activeMarkerId;

          return (
            <Marker
              key={marker.id}
              ref={(instance) => {
                if (instance) {
                  markerRefs.current[marker.id] = instance;
                }
              }}
              position={[marker.position.lat, marker.position.lng]}
              icon={buildMarkerIcon(marker.tone, isActive)}
              eventHandlers={{
                click: () => {
                  onMarkerSelect?.(marker);
                },
              }}
            >
              {showMarkerPopups ? (
                <Popup>
                  {typeof renderPopupContent === 'function'
                    ? renderPopupContent(marker) || (
                        <DefaultPopupContent marker={marker} />
                      )
                    : <DefaultPopupContent marker={marker} />}
                </Popup>
              ) : null}
            </Marker>
          );
        })}

        {showCurrentLocationMarker && location?.lat && location?.lng ? (
          <Marker
            position={[location.lat, location.lng]}
            icon={buildCurrentLocationIcon()}
          >
            <Popup>
              <div className="reports-map__popup">
                <strong>موقعك الحالي</strong>
                <span>تم تحديد موقعك بدقة على الخريطة</span>
              </div>
            </Popup>
          </Marker>
        ) : null}

        {routePath?.coordinates?.length ? (
          <Polyline
            positions={routePath.coordinates}
            pathOptions={{
              color: '#10b981',
              weight: 5,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        ) : null}
      </MapContainer>

      <div className="reports-map__surface-glow" aria-hidden="true" />

      {routePath?.coordinates?.length ? (
        <div className="reports-map__route-summary">
          <strong>أقصر طريق جاهز</strong>

          <div className="reports-map__route-summary-row">
            <span>المسافة</span>
            <b>{routePath.distanceLabel || '—'}</b>
          </div>

          <div className="reports-map__route-summary-row">
            <span>الوقت التقريبي</span>
            <b>{routePath.durationLabel || '—'}</b>
          </div>
        </div>
      ) : null}

      {error ? <p className="reports-map__helper-text">{error}</p> : null}
      {routeError ? <p className="reports-map__helper-text">{routeError}</p> : null}
    </div>
  );
}

export default ReportsMap;