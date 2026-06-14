import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  FiCheck,
  FiCrosshair,
  FiMinus,
  FiNavigation,
  FiPlus,
} from 'react-icons/fi';

if (!L.DomEvent.__cancelablePreventDefaultPatched) {
  const originalPreventDefault = L.DomEvent.preventDefault;

  L.DomEvent.preventDefault = function patchedPreventDefault(event) {
    const nativeEvent = event?.originalEvent || event;

    if (nativeEvent && nativeEvent.cancelable === false) {
      return this;
    }

    return originalPreventDefault.call(this, event);
  };

  L.DomEvent.__cancelablePreventDefaultPatched = true;
}

const DEFAULT_CENTER = { lat: 30.04442, lng: 31.235712 };
const DEFAULT_ZOOM = 16;
const CURRENT_LOCATION_ZOOM = 18;
const REVERSE_GEOCODE_DELAY_MS = 1000;
const REVERSE_GEOCODE_TIMEOUT_MS = 6000;
const COORDINATES_MATCH_TOLERANCE = 0.000001;

const TILE_PROVIDERS = [
  {
    key: 'openstreetmap',
    attribution: '&copy; OpenStreetMap contributors',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
    },
  },
  {
    key: 'carto-voyager',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    options: {
      subdomains: 'abcd',
      maxZoom: 20,
    },
  },
];

function areCoordinatesMatching(firstCenter, secondCenter) {
  if (
    typeof firstCenter?.lat !== 'number' ||
    typeof firstCenter?.lng !== 'number' ||
    typeof secondCenter?.lat !== 'number' ||
    typeof secondCenter?.lng !== 'number'
  ) {
    return false;
  }

  return (
    Math.abs(firstCenter.lat - secondCenter.lat) <= COORDINATES_MATCH_TOLERANCE &&
    Math.abs(firstCenter.lng - secondCenter.lng) <= COORDINATES_MATCH_TOLERANCE
  );
}

function normalizeGovernorate(rawGovernorate = '') {
  const value = rawGovernorate.trim();

  if (value.includes('القاهرة')) {
    return { value: 'cairo', label: 'القاهرة' };
  }

  if (value.includes('الجيزة')) {
    return { value: 'giza', label: 'الجيزة' };
  }

  if (value.includes('القليوبية')) {
    return { value: 'qalyubia', label: 'القليوبية' };
  }

  return { value: '', label: value };
}

function extractPreviewFromReverseGeocode(payload) {
  const address = payload?.address ?? {};
  const governorateText =
    address.state ||
    address.city ||
    address.county ||
    address.region ||
    '';

  const mainText =
    [
      address.road,
      address.suburb,
      address.neighbourhood,
      address.city_district,
      address.city,
      address.town,
      address.village,
    ]
      .filter(Boolean)
      .slice(0, 3)
      .join(' - ') ||
    payload?.display_name?.split(',').slice(0, 3).join(' - ') ||
    '';

  const normalizedGovernorate = normalizeGovernorate(governorateText);

  return {
    mainText,
    governorateText: normalizedGovernorate.label || governorateText,
    governorateValue: normalizedGovernorate.value,
    raw: payload,
  };
}

function MapInstanceBridge({ mapRef }) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
}

function MapEventsBridge({
  disabled = false,
  onCenterChange,
  onMoveStart,
  onMoveEnd,
}) {
  const rafRef = useRef(null);

  const updateCenter = (map) => {
    if (disabled) {
      return;
    }

    const center = map.getCenter();

    onCenterChange?.({
      lat: center.lat,
      lng: center.lng,
    });
  };

  useMapEvents({
    movestart() {
      if (disabled) {
        return;
      }

      onMoveStart?.();
    },

    zoomstart() {
      if (disabled) {
        return;
      }

      onMoveStart?.();
    },

    move(event) {
      if (disabled) {
        return;
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        updateCenter(event.target);
      });
    },

    zoom(event) {
      if (disabled) {
        return;
      }

      updateCenter(event.target);
    },

    moveend(event) {
      if (disabled) {
        return;
      }

      updateCenter(event.target);
      onMoveEnd?.();
    },

    zoomend(event) {
      if (disabled) {
        return;
      }

      updateCenter(event.target);
      onMoveEnd?.();
    },
  });

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return null;
}

function ResizeMapOnReady() {
  const map = useMap();

  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);
    const timer3 = setTimeout(() => map.invalidateSize(), 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [map]);

  return null;
}

function MapLockBridge({ isLocked, center }) {
  const map = useMap();

  useEffect(() => {
    const interactionHandlers = [
      map.dragging,
      map.touchZoom,
      map.doubleClickZoom,
      map.scrollWheelZoom,
      map.boxZoom,
      map.keyboard,
      map.tap,
    ].filter(Boolean);

    if (isLocked) {
      interactionHandlers.forEach((handler) => {
        handler.disable?.();
      });

      if (
        typeof center?.lat === 'number' &&
        typeof center?.lng === 'number'
      ) {
        map.setView([center.lat, center.lng], map.getZoom(), {
          animate: false,
        });
      }

      return;
    }

    interactionHandlers.forEach((handler) => {
      handler.enable?.();
    });
  }, [isLocked, center?.lat, center?.lng, map]);

  return null;
}

function ReportLocationPicker({
  value,
  onChange,
  height = 440,
  isActive = true,
}) {
  const mapRef = useRef(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [draftCenter, setDraftCenter] = useState(() => value?.coordinates || DEFAULT_CENTER);
  const [preview, setPreview] = useState({
    mainText: value?.previewLabel || '',
    governorateText: value?.previewGovernorate || '',
    governorateValue: value?.governorate || '',
    raw: null,
  });
  const [previewCenter, setPreviewCenter] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [tileProviderIndex, setTileProviderIndex] = useState(0);

  const hasSavedAddress = Boolean(
    (value?.addressLine || value?.previewLabel || '').trim()
  );

  const isLocationLocked = Boolean(
    value?.isConfirmed &&
    hasSavedAddress &&
    typeof value?.confirmedCoordinates?.lat === 'number' &&
    typeof value?.confirmedCoordinates?.lng === 'number'
  );

  const activeTileProvider = TILE_PROVIDERS[tileProviderIndex] || TILE_PROVIDERS[0];

  const savedCenter = useMemo(() => {
    if (
      typeof value?.confirmedCoordinates?.lat === 'number' &&
      typeof value?.confirmedCoordinates?.lng === 'number'
    ) {
      return value.confirmedCoordinates;
    }

    if (
      typeof value?.coordinates?.lat === 'number' &&
      typeof value?.coordinates?.lng === 'number'
    ) {
      return value.coordinates;
    }

    return DEFAULT_CENTER;
  }, [value]);

  const previewAddress = preview.mainText.trim();
  const hasPreviewForCurrentCenter = areCoordinatesMatching(draftCenter, previewCenter);

  const canConfirmLocation =
    !isLocationLocked &&
    !isMapMoving &&
    !isPreviewLoading &&
    Boolean(previewAddress) &&
    hasPreviewForCurrentCenter;

  useEffect(() => {
    setDraftCenter(savedCenter);

    if (mapRef.current) {
      mapRef.current.setView([savedCenter.lat, savedCenter.lng], mapRef.current.getZoom(), {
        animate: false,
      });
    }
  }, [savedCenter]);

  useEffect(() => {
    if (!isActive || !mapRef.current) return;

    const timer = setTimeout(() => {
      mapRef.current.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, [isActive]);

  useEffect(() => {
    if (isLocationLocked) {
      setIsMapMoving(false);
      setIsPreviewLoading(false);
      setPreview({
        mainText: value?.addressLine || value?.previewLabel || '',
        governorateText: value?.governorateLabel || value?.previewGovernorate || '',
        governorateValue: value?.governorate || '',
        raw: null,
      });
      setPreviewCenter(savedCenter);

      return;
    }

    if (
      !value?.previewLabel &&
      !value?.previewGovernorate &&
      !value?.addressLine &&
      !value?.governorate
    ) {
      setPreview({
        mainText: '',
        governorateText: '',
        governorateValue: '',
        raw: null,
      });
      setPreviewCenter(null);
    }
  }, [
    isLocationLocked,
    savedCenter,
    value?.addressLine,
    value?.previewLabel,
    value?.previewGovernorate,
    value?.governorate,
    value?.governorateLabel,
  ]);

  useEffect(() => {
    if (isLocationLocked || !draftCenter?.lat || !draftCenter?.lng || isMapMoving) {
      return undefined;
    }

    const requestedCenter = {
      lat: draftCenter.lat,
      lng: draftCenter.lng,
    };

    const controller = new AbortController();
    let isEffectActive = true;
    let requestTimeout = null;

    setIsPreviewLoading(true);
    setPreviewCenter(null);

    const timer = setTimeout(async () => {
      try {
        requestTimeout = setTimeout(() => {
          controller.abort();
        }, REVERSE_GEOCODE_TIMEOUT_MS);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${requestedCenter.lat}&lon=${requestedCenter.lng}&accept-language=ar`,
          {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error('reverse-geocode-failed');
        }

        const data = await response.json();
        const nextPreview = extractPreviewFromReverseGeocode(data);

        if (isEffectActive) {
          setPreview(nextPreview);
          setPreviewCenter(nextPreview.mainText ? requestedCenter : null);
        }
      } catch {
        if (isEffectActive) {
          setPreview((current) => current);
          setPreviewCenter(null);
        }
      } finally {
        if (requestTimeout) {
          clearTimeout(requestTimeout);
        }

        if (isEffectActive) {
          setIsPreviewLoading(false);
        }
      }
    }, REVERSE_GEOCODE_DELAY_MS);

    return () => {
      isEffectActive = false;
      controller.abort();
      clearTimeout(timer);

      if (requestTimeout) {
        clearTimeout(requestTimeout);
      }
    };
  }, [draftCenter, isMapMoving, isLocationLocked]);

  const handleTileError = () => {
    setTileProviderIndex((currentIndex) => {
      if (currentIndex >= TILE_PROVIDERS.length - 1) {
        return currentIndex;
      }

      return currentIndex + 1;
    });
  };

  const handleZoomIn = () => {
    if (isLocationLocked) {
      return;
    }

    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    if (isLocationLocked) {
      return;
    }

    mapRef.current?.zoomOut();
  };

  const handleUseCurrentLocation = () => {
    if (isLocationLocked || !navigator.geolocation || !mapRef.current) return;

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setIsMapMoving(true);
        setDraftCenter(nextCenter);
        setPreviewCenter(null);

        mapRef.current.flyTo([nextCenter.lat, nextCenter.lng], CURRENT_LOCATION_ZOOM, {
          animate: true,
          duration: 1.8,
          easeLinearity: 0.2,
        });

        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleConfirmLocation = () => {
    if (!canConfirmLocation) {
      return;
    }

    onChange?.({
      coordinates: draftCenter,
      confirmedCoordinates: draftCenter,
      isConfirmed: true,
      previewLabel: preview.mainText || value?.previewLabel || '',
      previewGovernorate: preview.governorateText || value?.previewGovernorate || '',
      governorate: value?.governorate || preview.governorateValue || '',
      governorateLabel:
        value?.governorateLabel || preview.governorateText || value?.previewGovernorate || '',
      addressLine: preview.mainText || value?.addressLine || '',
    });
  };

  const isConfirmed =
    isLocationLocked &&
    draftCenter?.lat === value?.confirmedCoordinates?.lat &&
    draftCenter?.lng === value?.confirmedCoordinates?.lng;

  return (
    <div className={`add-report-location-picker ${isLocationLocked ? 'is-locked' : ''}`.trim()}>
      <div
        className={`add-report-location-picker__canvas ${isLocationLocked ? 'is-locked' : ''}`.trim()}
        style={{
          height,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <MapContainer
          center={[draftCenter.lat, draftCenter.lng]}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={!isLocationLocked}
          zoomControl={false}
          dragging={!isLocationLocked}
          touchZoom={!isLocationLocked}
          doubleClickZoom={!isLocationLocked}
          boxZoom={!isLocationLocked}
          keyboard={!isLocationLocked}
          tap={false}
          style={{
            height: '100%',
            width: '100%',
          }}
        >
          <TileLayer
            key={activeTileProvider.key}
            attribution={activeTileProvider.attribution}
            url={activeTileProvider.url}
            eventHandlers={{
              tileerror: handleTileError,
            }}
            {...activeTileProvider.options}
          />

          <MapInstanceBridge mapRef={mapRef} />
          <ResizeMapOnReady />
          <MapLockBridge isLocked={isLocationLocked} center={savedCenter} />
          <MapEventsBridge
            disabled={isLocationLocked}
            onCenterChange={(nextCenter) => {
              setDraftCenter(nextCenter);
              setPreviewCenter(null);
            }}
            onMoveStart={() => {
              setIsMapMoving(true);
              setPreviewCenter(null);
            }}
            onMoveEnd={() => setIsMapMoving(false)}
          />
        </MapContainer>

        {isLocationLocked ? (
          <div
            className="add-report-location-picker__map-dim-layer"
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 800,
              background:
                'linear-gradient(0deg, rgba(2, 8, 23, 0.52), rgba(2, 8, 23, 0.52))',
              pointerEvents: 'none',
            }}
          />
        ) : null}

        <div
          className="add-report-location-picker__zoom-controls"
          style={{ zIndex: 1200 }}
        >
          <button
            type="button"
            className="add-report-location-picker__zoom-btn"
            onClick={handleZoomIn}
            aria-label="تكبير الخريطة"
            title={isLocationLocked ? 'لتكبير الخريطة اضغط إلغاء تحديد المشكلة أولًا' : 'تكبير'}
            disabled={isLocationLocked}
          >
            <FiPlus />
          </button>

          <button
            type="button"
            className="add-report-location-picker__zoom-btn"
            onClick={handleZoomOut}
            aria-label="تصغير الخريطة"
            title={isLocationLocked ? 'لتصغير الخريطة اضغط إلغاء تحديد المشكلة أولًا' : 'تصغير'}
            disabled={isLocationLocked}
          >
            <FiMinus />
          </button>
        </div>

        <button
          type="button"
          className="add-report-location-picker__current-location-btn"
          onClick={handleUseCurrentLocation}
          disabled={isLocating || isLocationLocked}
          title={
            isLocationLocked
              ? 'لتغيير الموقع اضغط إلغاء تحديد المشكلة أولًا'
              : undefined
          }
          style={{ zIndex: 1200 }}
        >
          <span aria-hidden="true">
            <FiNavigation />
          </span>
          <span>{isLocating ? 'جارٍ تحديد موقعك...' : 'موقعي الحالي'}</span>
        </button>

        <button
          type="button"
          className={`add-report-location-picker__confirm-btn ${isConfirmed ? 'is-confirmed' : ''}`.trim()}
          onClick={handleConfirmLocation}
          disabled={!canConfirmLocation}
          title={
            isLocationLocked
              ? 'تم حفظ الموقع بالفعل. للتعديل اضغط إلغاء تحديد المشكلة أولًا'
              : !previewAddress
                ? 'انتظر حتى يظهر العنوان أولًا'
                : !hasPreviewForCurrentCenter
                  ? 'انتظر حتى يتم تحديث العنوان للمكان الحالي'
                  : undefined
          }
          style={{ zIndex: 1200 }}
        >
          <FiCheck />
          <span>
            {isConfirmed
              ? 'تم حفظ الموقع'
              : isPreviewLoading || !hasPreviewForCurrentCenter
                ? 'جارٍ تحديد العنوان...'
                : 'تأكيد الموقع'}
          </span>
        </button>

        <div
          className="add-report-location-picker__fixed-pin"
          aria-hidden="true"
          style={{ zIndex: 1400 }}
        >
          {!isMapMoving && (
            <span className="add-report-location-picker__fixed-pin-card">
              <span className="add-report-location-picker__fixed-pin-card-content">
                <span className="add-report-location-picker__fixed-pin-card-top">
                  <span className="add-report-location-picker__fixed-pin-badge">
                    {isPreviewLoading && !isLocationLocked
                      ? 'جارٍ التحديد...'
                      : preview.governorateText || 'الموقع المحدد'}
                  </span>

                  <span className="add-report-location-picker__fixed-pin-status">
                    {isLocationLocked ? 'تم تثبيت الموقع' : 'مركز الاختيار'}
                  </span>
                </span>

                <strong>
                  {isLocationLocked
                    ? value?.addressLine || preview.mainText || 'تم حفظ الموقع المحدد'
                    : preview.mainText || 'جارٍ قراءة العنوان من الخريطة...'}
                </strong>

                <small>
                  {isLocationLocked
                    ? 'لتغيير الموقع أو العنوان اضغط زر إلغاء تحديد المشكلة أولًا'
                    : preview.mainText
                      ? 'راجع العنوان الظاهر ثم اضغط تأكيد الموقع'
                      : 'انتظر لحظة حتى يظهر العنوان قبل التأكيد'}
                </small>
              </span>
            </span>
          )}

          <span className="add-report-location-picker__fixed-pin-marker">
            <span className="add-report-location-picker__fixed-pin-marker-shadow" />
            <span className="add-report-location-picker__fixed-pin-ring" />
            <span className="add-report-location-picker__fixed-pin-core" />
          </span>
        </div>

        <div
          className="add-report-location-picker__hint"
          style={{ zIndex: 1300 }}
        >
          <FiCrosshair />
          <div>
            <strong>
              {isLocationLocked
                ? 'تم تثبيت موقع المشكلة'
                : 'حرّك الخريطة فقط واترك المؤشر ثابتًا في المنتصف'}
            </strong>
            <span>
              {isLocationLocked
                ? 'لا يمكن تحريك الخريطة أو تعديل العنوان إلا بعد الضغط على إلغاء تحديد المشكلة.'
                : preview.mainText
                  ? 'بعد ظهور العنوان يمكنك الضغط على تأكيد الموقع'
                  : 'انتظر حتى يظهر العنوان داخل البوكس ثم اضغط تأكيد الموقع'}
            </span>
          </div>
        </div>

        {isLocationLocked ? (
          <div
            className="add-report-location-picker__locked-overlay"
            style={{
              position: 'absolute',
              top: '14px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(520px, calc(100% - 160px))',
              minWidth: '300px',
              zIndex: 99999,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '999px',
                background: 'rgba(17, 24, 39, 0.96)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 800,
                lineHeight: 1.7,
                textAlign: 'center',
                boxShadow: '0 14px 38px rgba(0, 0, 0, 0.32)',
                backdropFilter: 'blur(8px)',
              }}
            >
              تم تثبيت موقع المشكلة. لتغييره اضغط إلغاء تحديد المشكلة أولًا.
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ReportLocationPicker;