import { FiMapPin, FiRefreshCcw } from 'react-icons/fi';
import ReportLocationPicker from './ReportLocationPicker';

const GOVERNORATE_OPTIONS = [
  { value: 'cairo', label: 'القاهرة' },
  { value: 'giza', label: 'الجيزة' },
  { value: 'qalyubia', label: 'القليوبية' },
];

const DEFAULT_LOCATION = {
  coordinates: { lat: 30.04442, lng: 31.235712 },
  confirmedCoordinates: null,
  isConfirmed: false,
  governorate: '',
  governorateLabel: '',
  addressLine: '',
  addressDetails: '',
  previewLabel: '',
  previewGovernorate: '',
};

function LocationStep({
  formData = {},
  setFormData = () => { },
  onNext,
  onBack,
}) {
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

  const handleLocationChange = (partialLocation) => {
    setFormData((previous = {}) => {
      const nextLocation = {
        ...DEFAULT_LOCATION,
        ...(previous.location ?? {}),
        ...partialLocation,
        coordinates: {
          ...DEFAULT_LOCATION.coordinates,
          ...(previous.location?.coordinates ?? {}),
          ...(partialLocation?.coordinates ?? {}),
        },
        confirmedCoordinates:
          partialLocation?.confirmedCoordinates ??
          previous.location?.confirmedCoordinates ??
          null,
      };

      return {
        ...previous,
        location: nextLocation,
        position: nextLocation.confirmedCoordinates || previous.position || null,
        locationText: [
          nextLocation.governorateLabel || nextLocation.previewGovernorate || '',
          nextLocation.addressLine || '',
          nextLocation.addressDetails || '',
        ]
          .filter(Boolean)
          .join(' - '),
      };
    });
  };

  const selectedGovernorate = GOVERNORATE_OPTIONS.find(
    (option) => option.value === location.governorate
  );

  const handleGovernorateSelect = (option) => {
    if (isLocationConfirmed) {
      return;
    }

    handleLocationChange({
      governorate: option.value,
      governorateLabel: option.label,
    });
  };

  const handleFieldChange = (event) => {
    if (isLocationConfirmed) {
      return;
    }

    const { name, value } = event.target;

    setFormData((previous = {}) => {
      const currentLocation = previous.location ?? DEFAULT_LOCATION;

      const nextLocation = {
        ...DEFAULT_LOCATION,
        ...currentLocation,
        [name]: value,
        governorateLabel:
          name === 'governorate'
            ? GOVERNORATE_OPTIONS.find((option) => option.value === value)?.label || ''
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
          nextLocation.addressDetails || '',
        ]
          .filter(Boolean)
          .join(' - '),
      };
    });
  };

  const handleClearLocation = () => {
    setFormData((previous = {}) => ({
      ...previous,
      location: {
        ...DEFAULT_LOCATION,
        coordinates: previous.location?.coordinates || DEFAULT_LOCATION.coordinates,
      },
      position: null,
      locationText: '',
    }));
  };

  const canProceed =
    Boolean(location?.confirmedCoordinates?.lat) &&
    Boolean(location?.confirmedCoordinates?.lng) &&
    Boolean(location.governorate) &&
    Boolean(location.addressLine.trim());

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
          <div className="form-field form-field--governorate">
            <label>المحافظة</label>

            <div className="dropdown governorate-bs-dropdown">
              <button
                type="button"
                className={`btn dropdown-toggle governorate-bs-dropdown__toggle ${selectedGovernorate ? 'is-selected' : ''
                  }`}
                data-bs-toggle="dropdown"
                aria-expanded="false"
                disabled={isLocationConfirmed}
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
            <label htmlFor="addressLine">العنوان بالتفصيل</label>
            <input
              id="addressLine"
              name="addressLine"
              type="text"
              className="input"
              placeholder="مثال: شارع التحرير - الدقي - بجوار محطة مترو الدقي"
              value={location.addressLine}
              onChange={handleFieldChange}
              disabled={isLocationConfirmed}
              title={
                isLocationConfirmed
                  ? 'لتغيير العنوان اضغط إلغاء تحديد المشكلة أولًا'
                  : undefined
              }
            />
          </div>

          <div className="form-field">
            <label htmlFor="addressDetails">تفاصيل إضافية للعنوان</label>
            <input
              id="addressDetails"
              name="addressDetails"
              type="text"
              className="input"
              placeholder="مثال: أمام الصيدلية - بجوار الكوبري - الدور الأرضي"
              value={location.addressDetails}
              onChange={handleFieldChange}
              disabled={isLocationConfirmed}
              title={
                isLocationConfirmed
                  ? 'لتغيير تفاصيل العنوان اضغط إلغاء تحديد المشكلة أولًا'
                  : undefined
              }
            />
          </div>

          <div className="add-report-location-form-card__notice">
            {isLocationConfirmed
              ? 'تم تثبيت موقع المشكلة والعنوان. لتغيير الموقع أو العنوان اضغط إلغاء تحديد المشكلة أولًا.'
              : 'حرّك الخريطة حتى يصل المؤشر إلى المكان المطلوب، ثم اضغط زر تأكيد الموقع لحفظه.'}
          </div>

          <button
            type="button"
            className="add-report-btn add-report-btn--ghost add-report-btn--clear-location"
            onClick={handleClearLocation}
            disabled={!location.isConfirmed && !location.addressLine && !location.addressDetails && !location.governorate}
          >
            <FiRefreshCcw />
            <span>إلغاء تحديد المشكلة</span>
          </button>
        </div>

        <ReportLocationPicker
          value={location}
          onChange={handleLocationChange}
          height={500}
          isActive
        />
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
          onClick={onNext}
          disabled={!canProceed}
        >
          التالي
        </button>
      </div>
    </section>
  );
}

export default LocationStep;