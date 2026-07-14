import { useMemo, useState } from 'react';
import { FiAlertCircle, FiMapPin, FiRefreshCcw } from 'react-icons/fi';
import ReportLocationPicker from './ReportLocationPicker';

const GOVERNORATE_OPTIONS = [
  { value: 'cairo', label: 'القاهرة' },
  { value: 'giza', label: 'الجيزة' },
  { value: 'qalyubia', label: 'القليوبية' },
];

const ALLOWED_GOVERNORATE_LABELS = GOVERNORATE_OPTIONS.map(
  (option) => option.label
);

const DEFAULT_LOCATION = {
  coordinates: { lat: 30.04442, lng: 31.235712 },
  confirmedCoordinates: null,
  isConfirmed: false,
  governorate: '',
  governorateLabel: '',
  addressLine: '',
  previewLabel: '',
  previewGovernorate: '',
};

function normalizeArabicText(value = '') {
  return String(value)
    .trim()
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ');
}

function findGovernorateOptionByValueOrLabel(value = '', label = '') {
  const normalizedValue = String(value || '').trim().toLowerCase();
  const normalizedLabel = normalizeArabicText(label);

  return GOVERNORATE_OPTIONS.find((option) => {
    return (
      option.value === normalizedValue ||
      normalizeArabicText(option.label) === normalizedLabel
    );
  });
}

function getGovernorateDisplayName(location = {}) {
  return (
    location.governorateLabel ||
    location.previewGovernorate ||
    location.governorate ||
    ''
  );
}

function isGovernorateAllowed(location = {}) {
  const matchedOption = findGovernorateOptionByValueOrLabel(
    location.governorate,
    getGovernorateDisplayName(location)
  );

  return Boolean(matchedOption);
}

function getLocationValidationErrors(location = {}) {
  const errors = {};

  const hasConfirmedCoordinates = Boolean(
    location?.confirmedCoordinates?.lat && location?.confirmedCoordinates?.lng
  );

  const governorateDisplayName = getGovernorateDisplayName(location);

  if (!hasConfirmedCoordinates) {
    errors.coordinates = 'برجاء تحديد موقع المشكلة وتثبيته على الخريطة.';
  }

  if (!governorateDisplayName) {
    errors.governorate = 'برجاء اختيار المحافظة.';
  } else if (!isGovernorateAllowed(location)) {
    errors.governorate = `نطاق الخدمة الحالي داخل ${ALLOWED_GOVERNORATE_LABELS.join(
      ' و '
    )} فقط. برجاء اختيار موقع داخل هذه المحافظات.`;
  }

  if (!String(location.addressLine || '').trim()) {
    errors.addressLine = 'برجاء كتابة العنوان الأساسي للمشكلة.';
  } else if (String(location.addressLine || '').trim().length < 8) {
    errors.addressLine = 'العنوان الأساسي قصير جدًا. برجاء كتابة عنوان أوضح.';
  }

  return errors;
}

function LocationStep({
  formData = {},
  setFormData = () => { },
  onNext,
  onBack,
}) {
  const [touchedFields, setTouchedFields] = useState({});

  const location = {
    ...DEFAULT_LOCATION,
    ...(formData?.location ?? {}),
    coordinates: {
      ...DEFAULT_LOCATION.coordinates,
      ...(formData?.location?.coordinates ?? {}),
    },
    confirmedCoordinates: formData?.location?.confirmedCoordinates ?? null,
  };

  const isLocationConfirmed = Boolean(location.isConfirmed);

  const selectedGovernorate = GOVERNORATE_OPTIONS.find(
    (option) => option.value === location.governorate
  );

  const validationErrors = useMemo(
    () => getLocationValidationErrors(location),
    [location]
  );

  const canProceed = Object.keys(validationErrors).length === 0;

  function shouldShowError(fieldName) {
    return Boolean(touchedFields[fieldName] && validationErrors[fieldName]);
  }

  function markFieldAsTouched(fieldName) {
    setTouchedFields((current) => ({
      ...current,
      [fieldName]: true,
    }));
  }

  function handleLocationChange(partialLocation) {
    setFormData((previous = {}) => {
      const currentLocation = previous.location ?? DEFAULT_LOCATION;

      const incomingGovernorateLabel =
        partialLocation?.governorateLabel ||
        partialLocation?.previewGovernorate ||
        currentLocation.governorateLabel ||
        currentLocation.previewGovernorate ||
        '';

      const matchedGovernorate = findGovernorateOptionByValueOrLabel(
        partialLocation?.governorate || currentLocation.governorate,
        incomingGovernorateLabel
      );

      const nextLocation = {
        ...DEFAULT_LOCATION,
        ...currentLocation,
        ...partialLocation,

        coordinates: {
          ...DEFAULT_LOCATION.coordinates,
          ...(currentLocation.coordinates ?? {}),
          ...(partialLocation?.coordinates ?? {}),
        },

        confirmedCoordinates:
          partialLocation?.confirmedCoordinates ??
          currentLocation.confirmedCoordinates ??
          null,

        governorate: matchedGovernorate
          ? matchedGovernorate.value
          : partialLocation?.governorate ?? currentLocation.governorate ?? '',

        governorateLabel: matchedGovernorate
          ? matchedGovernorate.label
          : incomingGovernorateLabel,
      };

      return {
        ...previous,
        location: nextLocation,
        position: nextLocation.confirmedCoordinates || previous.position || null,
        locationText: [
          nextLocation.governorateLabel || nextLocation.previewGovernorate || '',
          nextLocation.addressLine || '',
        ]
          .filter(Boolean)
          .join(' - '),
      };
    });

    if (partialLocation?.confirmedCoordinates || partialLocation?.isConfirmed) {
      setTouchedFields((current) => ({
        ...current,
        coordinates: true,
        governorate: true,
      }));
    }
  }

  function handleGovernorateSelect(option) {
    if (isLocationConfirmed) {
      return;
    }

    markFieldAsTouched('governorate');

    handleLocationChange({
      governorate: option.value,
      governorateLabel: option.label,
      previewGovernorate: option.label,
    });
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    if (isLocationConfirmed) {
      return;
    }

    setFormData((previous = {}) => {
      const currentLocation = previous.location ?? DEFAULT_LOCATION;

      const nextLocation = {
        ...DEFAULT_LOCATION,
        ...currentLocation,
        [name]: value,

        governorateLabel:
          name === 'governorate'
            ? GOVERNORATE_OPTIONS.find((option) => option.value === value)
              ?.label || ''
            : currentLocation.governorateLabel,

        coordinates: {
          ...DEFAULT_LOCATION.coordinates,
          ...(currentLocation.coordinates ?? {}),
        },
      };

      return {
        ...previous,
        location: nextLocation,
        locationText: [
          nextLocation.governorateLabel || nextLocation.previewGovernorate || '',
          nextLocation.addressLine || '',
        ]
          .filter(Boolean)
          .join(' - '),
      };
    });
  }

  function handleFieldBlur(event) {
    markFieldAsTouched(event.target.name);
  }

  function handleClearLocation() {
    setFormData((previous = {}) => ({
      ...previous,
      location: {
        ...DEFAULT_LOCATION,
        coordinates:
          previous.location?.coordinates || DEFAULT_LOCATION.coordinates,
      },
      position: null,
      locationText: '',
    }));

    setTouchedFields({});
  }

  function handleNextClick() {
    setTouchedFields({
      coordinates: true,
      governorate: true,
      addressLine: true,
    });

    if (!canProceed) {
      return;
    }

    onNext();
  }

  const governorateDisplayName = getGovernorateDisplayName(location);
  const isOutsideAllowedGovernorates =
    Boolean(governorateDisplayName) && !isGovernorateAllowed(location);

  return (
    <section className="add-report-step">
      <div className="add-report-step__header add-report-step__header--location">
        <div className="add-report-step__header-icon" aria-hidden="true">
          <FiMapPin />
        </div>

        <div className="add-report-step__heading add-report-step__heading--location">
          <h2>تحديد الموقع</h2>
          <p>حدد المكان على الخريطة ثم أكمل العنوان يدويًا بدقة</p>
        </div>
      </div>

      <div className="add-report-step__grid add-report-step__grid--location">
        <div className="add-report-location-form-card">
          {shouldShowError('coordinates') ? (
            <div className="add-report-location-error">
              <FiAlertCircle />
              <span>{validationErrors.coordinates}</span>
            </div>
          ) : null}

          {isOutsideAllowedGovernorates || shouldShowError('governorate') ? (
            <div className="add-report-location-error">
              <FiAlertCircle />
              <span>{validationErrors.governorate}</span>
            </div>
          ) : null}

          <div className="form-field form-field--governorate">
            <label>المحافظة</label>

            <div className="dropdown governorate-bs-dropdown">
              <button
                type="button"
                className={`btn dropdown-toggle governorate-bs-dropdown__toggle ${selectedGovernorate ? 'is-selected' : ''
                  } ${shouldShowError('governorate') ? 'is-invalid' : ''}`}
                data-bs-toggle="dropdown"
                aria-expanded="false"
                disabled={isLocationConfirmed}
                onBlur={() => markFieldAsTouched('governorate')}
                title={
                  isLocationConfirmed
                    ? 'لتغيير المحافظة اضغط إلغاء تحديد المشكلة أولًا'
                    : undefined
                }
              >
                <span>{selectedGovernorate?.label || 'اختر المحافظة'}</span>
              </button>

              <ul className="dropdown-menu governorate-bs-dropdown__menu">
                {GOVERNORATE_OPTIONS.map((option) => {
                  const isActive = location.governorate === option.value;

                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        className={`dropdown-item governorate-bs-dropdown__item ${isActive ? 'active' : ''
                          }`}
                        onClick={() => handleGovernorateSelect(option)}
                        disabled={isLocationConfirmed}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="addressLine">
              العنوان بالتفصيل <span className="form-field__required">*</span>
            </label>

            <input
              id="addressLine"
              name="addressLine"
              type="text"
              className={`input ${shouldShowError('addressLine') ? 'is-invalid' : ''
                }`}
              placeholder="مثال: شارع التحرير - الدقي - بجوار محطة مترو الدقي"
              value={location.addressLine}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              disabled={isLocationConfirmed}
              title={
                isLocationConfirmed
                  ? 'لتغيير العنوان اضغط إلغاء تحديد المشكلة أولًا'
                  : undefined
              }
            />

            {shouldShowError('addressLine') ? (
              <p className="add-report-form__message add-report-form__message--error">
                {validationErrors.addressLine}
              </p>
            ) : null}
          </div>

          <div
            className={`add-report-location-form-card__notice ${isOutsideAllowedGovernorates ? 'is-error' : ''
              }`}
          >
            {isOutsideAllowedGovernorates
              ? `عذرًا، لا يمكن إرسال بلاغ خارج نطاق ${ALLOWED_GOVERNORATE_LABELS.join(
                ' و '
              )}. برجاء اختيار موقع داخل المحافظات المدعومة.`
              : isLocationConfirmed
                ? 'تم تثبيت موقع المشكلة والعنوان الأساسي. لتغيير الموقع أو العنوان اضغط إلغاء تحديد المشكلة أولًا.'
                : 'حرّك الخريطة حتى يصل المؤشر إلى المكان المطلوب، ثم اضغط زر تأكيد الموقع لحفظه.'}
          </div>

          <button
            type="button"
            className="add-report-btn add-report-btn--ghost add-report-btn--clear-location"
            onClick={handleClearLocation}
            disabled={
              !location.isConfirmed &&
              !location.addressLine &&
              !location.governorate
            }
          >
            <FiRefreshCcw />
            <span>إلغاء تحديد المشكلة</span>
          </button>
        </div>
        <div className="add-report-location-map-card">
          <ReportLocationPicker
            value={location}
            onChange={handleLocationChange}
            height={500}
            isActive
          />
        </div>
      </div>

      <div className="add-report-step__actions add-report-step__actions--location">
        <button
          type="button"
          className="add-report-btn add-report-btn--ghost"
          onClick={onBack}
        >
          السابق
        </button>

        <button
          type="button"
          className="add-report-btn add-report-btn--primary"
          onClick={handleNextClick}
          disabled={!canProceed}
        >
          التالي
        </button>
      </div>
    </section>
  );
}

export default LocationStep;