import { useEffect, useRef, useState } from 'react';
import {
  FiCheck,
  FiChevronDown,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from 'react-icons/fi';

const GOVERNORATE_OPTIONS = [
  { value: 'القاهرة', label: 'القاهرة' },
  { value: 'الجيزة', label: 'الجيزة' },
  { value: 'القليوبية', label: 'القليوبية' },
];

function ProfileInfoCard({
  values,
  isEditing = false,
  onChange,
  errors = {},
}) {
  const [isGovernorateMenuOpen, setIsGovernorateMenuOpen] = useState(false);
  const governorateDropdownRef = useRef(null);

  function handleChange(event) {
    const { name, value } = event.target;

    onChange?.({
      ...values,
      [name]: value,
    });
  }

  function handleGovernorateSelect(governorate) {
    onChange?.({
      ...values,
      city: governorate,
    });

    setIsGovernorateMenuOpen(false);
  }

  useEffect(() => {
    if (!isGovernorateMenuOpen) return undefined;

    function handleOutsideClick(event) {
      if (
        governorateDropdownRef.current &&
        !governorateDropdownRef.current.contains(event.target)
      ) {
        setIsGovernorateMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsGovernorateMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isGovernorateMenuOpen]);

  useEffect(() => {
    if (!isEditing) {
      setIsGovernorateMenuOpen(false);
    }
  }, [isEditing]);

  return (
    <section className="user-profile-card user-profile-info-card">
      <div className="user-profile-card__header">
        <div>
          <h2>البيانات الشخصية</h2>
          <p>معلومات الحساب الأساسية التي تظهر داخل النظام.</p>
        </div>

        <span className="user-profile-card__icon">
          <FiUser />
        </span>
      </div>

      {isEditing ? (
        <div className="user-profile-form">
          <label>
            <span>الاسم الكامل</span>
            <input
              type="text"
              name="fullName"
              value={values.fullName || ''}
              onChange={handleChange}
              placeholder="اكتب الاسم الكامل"
              className={errors.fullName ? 'is-invalid' : ''}
            />

            {errors.fullName ? (
              <small className="user-profile-form__error">
                {errors.fullName}
              </small>
            ) : null}
          </label>

          <label>
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              name="email"
              value={values.email || ''}
              onChange={handleChange}
              placeholder="example@email.com"
              className={errors.email ? 'is-invalid' : ''}
            />

            {errors.email ? (
              <small className="user-profile-form__error">
                {errors.email}
              </small>
            ) : null}
          </label>

          <label>
            <span>رقم الهاتف</span>
            <input
              type="text"
              name="phone"
              value={values.phone || ''}
              onChange={handleChange}
              placeholder="رقم الهاتف"
              className={errors.phone ? 'is-invalid' : ''}
            />

            {errors.phone ? (
              <small className="user-profile-form__error">
                {errors.phone}
              </small>
            ) : null}
          </label>

          <div className="user-profile-form__field">
            <span>المحافظة</span>

            <div
              ref={governorateDropdownRef}
              className={`user-profile-dropdown ${
                isGovernorateMenuOpen ? 'is-open' : ''
              } ${errors.city ? 'is-invalid' : ''}`}
            >
              <button
                type="button"
                className="user-profile-dropdown__trigger"
                onClick={() =>
                  setIsGovernorateMenuOpen((currentValue) => !currentValue)
                }
                aria-haspopup="listbox"
                aria-expanded={isGovernorateMenuOpen}
                aria-invalid={Boolean(errors.city)}
              >
                <span className={!values.city ? 'is-placeholder' : ''}>
                  {values.city || 'اختر المحافظة'}
                </span>
                <FiChevronDown aria-hidden="true" />
              </button>

              {isGovernorateMenuOpen ? (
                <div
                  className="user-profile-dropdown__menu"
                  role="listbox"
                  aria-label="اختر المحافظة"
                >
                  {GOVERNORATE_OPTIONS.map((governorate) => {
                    const isSelected = values.city === governorate.value;

                    return (
                      <button
                        key={governorate.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`user-profile-dropdown__option ${
                          isSelected ? 'is-selected' : ''
                        }`}
                        onClick={() =>
                          handleGovernorateSelect(governorate.value)
                        }
                      >
                        <span>{governorate.label}</span>
                        <FiCheck aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {errors.city ? (
              <small className="user-profile-form__error">
                {errors.city}
              </small>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="user-profile-info-list">
          <article>
            <FiUser />
            <div>
              <span>الاسم الكامل</span>
              <strong>{values.fullName || '—'}</strong>
            </div>
          </article>

          <article>
            <FiMail />
            <div>
              <span>البريد الإلكتروني</span>
              <strong>{values.email || '—'}</strong>
            </div>
          </article>

          <article>
            <FiPhone />
            <div>
              <span>رقم الهاتف</span>
              <strong>{values.phone || '—'}</strong>
            </div>
          </article>

          <article>
            <FiMapPin />
            <div>
              <span>المحافظة</span>
              <strong>{values.city || '—'}</strong>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

export default ProfileInfoCard;
