import { useEffect, useMemo, useRef, useState } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import AdminReportFilterSelect from '../../reports/components/AdminReportFilterSelect';

const FALLBACK_SPECIALIZATIONS = [
  { value: '1', label: 'الطرق والرصف' },
  { value: '2', label: 'الإنارة والكهرباء' },
  { value: '3', label: 'النظافة والمخلفات' },
  { value: '4', label: 'المياه والصرف' },
  { value: '5', label: 'الإشارات والمرور' },
  { value: '6', label: 'الأشجار والحدائق' },
  { value: '7', label: 'السلامة العامة' },
  { value: '8', label: 'الغاز' },
  { value: '9', label: 'الشبكات' },
  { value: '10', label: 'صيانة عامة' },
];

const SPECIALIZATION_VALUE_ALIASES = {
  'الطرق والرصف': '1',
  'الإضاءة والكهرباء': '2',
  'الإنارة والكهرباء': '2',
  'النظافة والمخلفات': '3',
  'المياه والصرف': '4',
  'الإشارات والمرور': '5',
  'الأشجار والحدائق': '6',
  'السلامة العامة': '7',
  الغاز: '8',
  الشبكات: '9',
  'صيانة عامة': '10',
};

const FALLBACK_GOVERNORATES = [
  { value: 'القاهرة', label: 'القاهرة' },
  { value: 'الجيزة', label: 'الجيزة' },
  { value: 'القليوبية', label: 'القليوبية' },
];

const COMPANY_NAME_MAX_LENGTH = 150;
const EMAIL_MAX_LENGTH = 255;
const PHONE_MIN_LENGTH = 7;
const PHONE_MAX_LENGTH = 15;
const MANAGER_NAME_MAX_LENGTH = 150;
const ADDRESS_MAX_LENGTH = 300;
const DESCRIPTION_MAX_LENGTH = 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d+$/;

function createEmptyForm({ defaultGovernorate, firstSpecialization }) {
  return {
    name: '',
    specialization: firstSpecialization || '1',
    governorates: defaultGovernorate ? [defaultGovernorate] : [],
    maxCapacity: 10,
    phone: '',
    email: '',
    managerName: '',
    managerPhone: '',
    address: '',
    description: '',
  };
}

function toggleArrayValue(list, value) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function resolveSpecializationValue(specialization, options) {
  const value = String(specialization || '').trim();
  const matchedOption = options.find(
    (option) => option.value === value || option.label === value,
  );

  return matchedOption?.value || SPECIALIZATION_VALUE_ALIASES[value] || value;
}

function normalizeArabicDigits(value = '') {
  return String(value)
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
}

function sanitizePhone(value = '') {
  return normalizeArabicDigits(value)
    .replace(/\D/g, '')
    .slice(0, PHONE_MAX_LENGTH);
}

function sanitizePositiveInteger(value = '') {
  return normalizeArabicDigits(value)
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '');
}

function validatePhone(value, { required = false, label = 'رقم الهاتف' } = {}) {
  const phone = String(value || '').trim();

  if (!phone) {
    return required ? `${label} مطلوب.` : '';
  }

  if (!PHONE_PATTERN.test(phone)) {
    return `${label} يجب أن يحتوي على أرقام فقط.`;
  }

  if (phone.length < PHONE_MIN_LENGTH || phone.length > PHONE_MAX_LENGTH) {
    return `${label} يجب أن يتكون من ${PHONE_MIN_LENGTH} إلى ${PHONE_MAX_LENGTH} رقمًا.`;
  }

  return '';
}

function validateForm(formData) {
  const errors = {};
  const name = String(formData.name || '').trim();
  const email = String(formData.email || '').trim();
  const managerName = String(formData.managerName || '').trim();
  const address = String(formData.address || '').trim();
  const description = String(formData.description || '').trim();
  const maxCapacity = Number(formData.maxCapacity);

  if (!name) {
    errors.name = 'اسم الشركة مطلوب.';
  } else if (name.length > COMPANY_NAME_MAX_LENGTH) {
    errors.name = `اسم الشركة يجب ألا يتجاوز ${COMPANY_NAME_MAX_LENGTH} حرفًا.`;
  }

  if (!String(formData.specialization || '').trim()) {
    errors.specialization = 'برجاء اختيار نوع الخدمة الرئيسي.';
  }

  if (
    formData.maxCapacity === '' ||
    !Number.isInteger(maxCapacity) ||
    maxCapacity < 1
  ) {
    errors.maxCapacity = 'الحد الأقصى للبلاغات يجب أن يكون رقمًا صحيحًا أكبر من صفر.';
  }

  const phoneError = validatePhone(formData.phone, {
    required: true,
    label: 'رقم الشركة',
  });
  if (phoneError) errors.phone = phoneError;

  const managerPhoneError = validatePhone(formData.managerPhone, {
    label: 'هاتف المسؤول',
  });
  if (managerPhoneError) errors.managerPhone = managerPhoneError;

  if (managerName.length > MANAGER_NAME_MAX_LENGTH) {
    errors.managerName = `اسم مسؤول الشركة يجب ألا يتجاوز ${MANAGER_NAME_MAX_LENGTH} حرفًا.`;
  }

  if (!email) {
    errors.email = 'البريد الإلكتروني للشركة مطلوب.';
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email = `البريد الإلكتروني يجب ألا يتجاوز ${EMAIL_MAX_LENGTH} حرفًا.`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'برجاء إدخال بريد إلكتروني صحيح، مثل company@example.com.';
  }

  if (!formData.governorates.length) {
    errors.governorates = 'برجاء اختيار محافظة واحدة على الأقل تعمل بها الشركة.';
  }

  if (address.length > ADDRESS_MAX_LENGTH) {
    errors.address = `العنوان يجب ألا يتجاوز ${ADDRESS_MAX_LENGTH} حرفًا.`;
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `الوصف والملاحظات يجب ألا تتجاوز ${DESCRIPTION_MAX_LENGTH} حرفًا.`;
  }

  return errors;
}

function extractApiErrorMessage(error) {
  const responseData = error?.response?.data;
  const message =
    responseData?.message ||
    responseData?.error?.message ||
    error?.data?.message ||
    error?.message;

  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  const validationErrors = responseData?.errors;

  if (validationErrors && typeof validationErrors === 'object') {
    const firstValidationMessage = Object.values(validationErrors)
      .flat()
      .find((item) => typeof item === 'string' && item.trim());

    if (firstValidationMessage) {
      return firstValidationMessage.trim();
    }
  }

  return 'تعذر حفظ بيانات الشركة. برجاء مراجعة البيانات والمحاولة مرة أخرى.';
}

function isEmailRelatedError(error, message) {
  const status = error?.response?.status;
  const normalizedMessage = String(message || '').toLowerCase();

  return (
    normalizedMessage.includes('البريد') ||
    normalizedMessage.includes('الإيميل') ||
    normalizedMessage.includes('email') ||
    status === 409
  );
}

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <small id={id} className="admin-company-field-error" role="alert">
      <FiAlertCircle aria-hidden="true" />
      {message}
    </small>
  );
}

function AdminCompanyFormModal({
  mode = 'add',
  company,
  governorateOptions = FALLBACK_GOVERNORATES,
  specializationOptions = FALLBACK_SPECIALIZATIONS,
  defaultGovernorate = '',
  onClose,
  onSubmit,
}) {
  const cleanedSpecializationOptions = useMemo(
    () => (specializationOptions.length ? specializationOptions : FALLBACK_SPECIALIZATIONS),
    [specializationOptions],
  );

  const cleanedGovernorateOptions = useMemo(
    () => (governorateOptions.length ? governorateOptions : FALLBACK_GOVERNORATES),
    [governorateOptions],
  );

  const emptyForm = useMemo(
    () =>
      createEmptyForm({
        defaultGovernorate,
        firstSpecialization: cleanedSpecializationOptions[0]?.value,
      }),
    [cleanedSpecializationOptions, defaultGovernorate],
  );

  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fieldRefs = useRef({});

  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (isEditMode && company) {
      setFormData({
        ...emptyForm,
        ...company,
        name: company.name === '-' ? '' : company.name || '',
        description: company.description || '',
        specialization: resolveSpecializationValue(
          company.specialization,
          cleanedSpecializationOptions,
        ),
        governorates: company.governorates?.length
          ? company.governorates
          : [company.governorate].filter(Boolean),
        maxCapacity: company.maxCapacity || 10,
        phone: sanitizePhone(company.phone === '-' ? '' : company.phone),
        managerPhone: sanitizePhone(company.managerPhone === '-' ? '' : company.managerPhone),
        email: company.email === '-' ? '' : company.email || '',
        managerName: company.managerName === '-' ? '' : company.managerName || '',
        address: company.address === '-' ? '' : company.address || '',
      });
    } else {
      setFormData(emptyForm);
    }

    setFormError('');
    setFieldErrors({});
    setIsSubmitting(false);
  }, [cleanedSpecializationOptions, company, emptyForm, isEditMode]);

  function setFieldRef(field, node) {
    fieldRefs.current[field] = node;
  }

  function clearFieldError(field) {
    setFieldErrors((current) => {
      if (!current[field]) return current;

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleChange(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    clearFieldError(field);

    if (formError) {
      setFormError('');
    }
  }

  function handlePhoneChange(field, value) {
    handleChange(field, sanitizePhone(value));
  }

  function handleGovernorateToggle(governorate) {
    const nextGovernorates = toggleArrayValue(formData.governorates, governorate);

    setFormData((current) => ({
      ...current,
      governorates: nextGovernorates,
    }));

    clearFieldError('governorates');

    if (formError) {
      setFormError('');
    }
  }

  function focusField(field) {
    const wrapper = fieldRefs.current[field];
    const focusableElement = wrapper?.matches?.('input, textarea, button, select')
      ? wrapper
      : wrapper?.querySelector?.('input, textarea, button, select');

    wrapper?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'center',
    });

    window.setTimeout(() => {
      focusableElement?.focus?.();
    }, 150);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setFormError('');

    const clientErrors = validateForm(formData);

    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors);
      setFormError('برجاء مراجعة الحقول الموضحة باللون الأحمر قبل حفظ بيانات الشركة.');
      focusField(Object.keys(clientErrors)[0]);
      return;
    }

    setFieldErrors({});

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      managerName: formData.managerName.trim(),
      managerPhone: formData.managerPhone.trim(),
      address: formData.address.trim(),
      description: formData.description.trim(),
      maxCapacity: Number(formData.maxCapacity),
      governorate: formData.governorates[0],
      coverageAreas: formData.governorates,
      currentTasks: company?.currentTasks || 0,
      activeTasks: company?.activeTasks || 0,
      completedTasks: company?.completedTasks || 0,
      completedReports: company?.completedReports || 0,
      rating: company?.rating ?? null,
      performance: company?.performance ?? null,
      successRate: company?.successRate ?? null,
      avgResponseHours: company?.avgResponseHours ?? null,
      avgResponseTime: company?.avgResponseTime ?? null,
      accountStatus: company?.accountStatus || 'invited',
      inviteUrl: company?.inviteUrl || '',
      invitationExpiresAt: company?.invitationExpiresAt || '',
      status: company?.status || 'active',
      lastStatusReason: company?.lastStatusReason || '',
    };

    setIsSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (error) {
      const message = extractApiErrorMessage(error);
      const emailError = isEmailRelatedError(error, message);

      setFormError(message);
      setFieldErrors(emailError ? { email: message } : {});

      if (emailError) {
        focusField('email');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClassName = (field, extraClass = '') =>
    `${extraClass}${fieldErrors[field] ? `${extraClass ? ' ' : ''}has-error` : ''}`;

  return (
    <div className="admin-company-modal-backdrop" role="presentation">
      <div className="admin-company-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="admin-company-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="admin-company-modal__header">
          <h2>{isEditMode ? 'تعديل بيانات الشركة' : 'إضافة شركة جديدة'}</h2>
          <p>
            {isEditMode
              ? 'تعديل بيانات شركة الصيانة ونطاق عملها.'
              : 'سيتم إنشاء حساب دخول للشركة وإرسال دعوة التفعيل إلى البريد الإلكتروني.'}
          </p>
        </header>

        <form className="admin-company-form" onSubmit={handleSubmit} noValidate>
          {formError ? (
            <div className="admin-company-form-alert" role="alert" aria-live="assertive">
              <FiAlertCircle aria-hidden="true" />
              <div>
                <strong>تعذر حفظ الشركة</strong>
                <span>{formError}</span>
              </div>
            </div>
          ) : null}

          <div className="admin-company-form__grid">
            <label
              ref={(node) => setFieldRef('name', node)}
              className={fieldClassName('name')}
            >
              اسم الشركة
              <input
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="مثال: شركة الطرق السريعة"
                maxLength={COMPANY_NAME_MAX_LENGTH}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'admin-company-name-error' : undefined}
                autoComplete="organization"
              />
              <FieldError id="admin-company-name-error" message={fieldErrors.name} />
            </label>

            <label
              ref={(node) => setFieldRef('specialization', node)}
              className={fieldClassName('specialization')}
            >
              نوع الخدمة الرئيسي
              <AdminReportFilterSelect
                value={formData.specialization}
                options={cleanedSpecializationOptions}
                onChange={(value) => handleChange('specialization', value)}
                ariaLabel="اختيار نوع الخدمة الرئيسي"
                placeholder="اختر نوع الخدمة..."
                variant="overlay"
              />
              <FieldError
                id="admin-company-specialization-error"
                message={fieldErrors.specialization}
              />
            </label>

            <label
              ref={(node) => setFieldRef('maxCapacity', node)}
              className={fieldClassName('maxCapacity')}
            >
              الحد الأقصى للبلاغات النشطة
              <input
                type="text"
                inputMode="numeric"
                value={formData.maxCapacity}
                onChange={(event) =>
                  handleChange('maxCapacity', sanitizePositiveInteger(event.target.value))
                }
                placeholder="مثال: 10"
                aria-invalid={Boolean(fieldErrors.maxCapacity)}
                aria-describedby={
                  fieldErrors.maxCapacity
                    ? 'admin-company-capacity-error'
                    : 'admin-company-capacity-hint'
                }
              />
              <FieldError
                id="admin-company-capacity-error"
                message={fieldErrors.maxCapacity}
              />
              {!fieldErrors.maxCapacity ? (
                <small id="admin-company-capacity-hint" className="admin-company-field-hint">
                  يتم إرساله عند إنشاء الشركة وتعديلها، ويستخدم كحد أقصى للبلاغات النشطة المسندة للشركة.
                </small>
              ) : null}
            </label>

            <label
              ref={(node) => setFieldRef('managerName', node)}
              className={fieldClassName('managerName')}
            >
              اسم مسؤول الشركة
              <input
                value={formData.managerName}
                onChange={(event) => handleChange('managerName', event.target.value)}
                placeholder="اسم المسؤول"
                maxLength={MANAGER_NAME_MAX_LENGTH}
                aria-invalid={Boolean(fieldErrors.managerName)}
                aria-describedby={
                  fieldErrors.managerName ? 'admin-company-manager-name-error' : undefined
                }
                autoComplete="name"
              />
              <FieldError
                id="admin-company-manager-name-error"
                message={fieldErrors.managerName}
              />
            </label>

            <label
              ref={(node) => setFieldRef('managerPhone', node)}
              className={fieldClassName('managerPhone')}
            >
              هاتف المسؤول
              <input
                type="tel"
                inputMode="numeric"
                value={formData.managerPhone}
                onChange={(event) => handlePhoneChange('managerPhone', event.target.value)}
                placeholder="مثال: 01000000000"
                maxLength={PHONE_MAX_LENGTH}
                pattern="[0-9]*"
                aria-invalid={Boolean(fieldErrors.managerPhone)}
                aria-describedby={
                  fieldErrors.managerPhone
                    ? 'admin-company-manager-phone-error'
                    : 'admin-company-manager-phone-hint'
                }
                autoComplete="tel"
              />
              <FieldError
                id="admin-company-manager-phone-error"
                message={fieldErrors.managerPhone}
              />
              {!fieldErrors.managerPhone ? (
                <small id="admin-company-manager-phone-hint" className="admin-company-field-hint">
                  أرقام فقط، من {PHONE_MIN_LENGTH} إلى {PHONE_MAX_LENGTH} رقمًا.
                </small>
              ) : null}
            </label>

            <label
              ref={(node) => setFieldRef('phone', node)}
              className={fieldClassName('phone')}
            >
              رقم الشركة
              <input
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={(event) => handlePhoneChange('phone', event.target.value)}
                placeholder="مثال: 01000000000"
                maxLength={PHONE_MAX_LENGTH}
                pattern="[0-9]*"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={
                  fieldErrors.phone
                    ? 'admin-company-phone-error'
                    : 'admin-company-phone-hint'
                }
                autoComplete="tel"
              />
              <FieldError id="admin-company-phone-error" message={fieldErrors.phone} />
              {!fieldErrors.phone ? (
                <small id="admin-company-phone-hint" className="admin-company-field-hint">
                  مطلوب، ويقبل أرقامًا فقط من {PHONE_MIN_LENGTH} إلى {PHONE_MAX_LENGTH} رقمًا.
                </small>
              ) : null}
            </label>

            <label
              ref={(node) => setFieldRef('email', node)}
              className={fieldClassName('email', 'admin-company-form__full')}
            >
              البريد الإلكتروني للشركة / إيميل الدخول
              <input
                type="email"
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="company@example.com"
                maxLength={EMAIL_MAX_LENGTH}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email ? 'admin-company-email-error' : 'admin-company-email-hint'
                }
                autoComplete="email"
              />
              <FieldError id="admin-company-email-error" message={fieldErrors.email} />
              {!fieldErrors.email ? (
                <small id="admin-company-email-hint" className="admin-company-field-hint">
                  سيتم استخدام هذا البريد لإرسال دعوة التفعيل، وسيتم استخدامه لاحقًا لتسجيل دخول الشركة.
                </small>
              ) : null}
            </label>

            <label
              ref={(node) => setFieldRef('address', node)}
              className={fieldClassName('address', 'admin-company-form__full')}
            >
              العنوان
              <input
                value={formData.address}
                onChange={(event) => handleChange('address', event.target.value)}
                placeholder="العنوان التفصيلي"
                maxLength={ADDRESS_MAX_LENGTH}
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={fieldErrors.address ? 'admin-company-address-error' : undefined}
                autoComplete="street-address"
              />
              <FieldError id="admin-company-address-error" message={fieldErrors.address} />
            </label>
          </div>

          <div
            ref={(node) => setFieldRef('governorates', node)}
            className={`admin-company-form-section${fieldErrors.governorates ? ' has-error' : ''}`}
          >
            <h3>المحافظات التي تغطيها الشركة</h3>
            <p>
              تستخدم في تعديل بيانات الشركة، وتساعد الأدمن في تحديد نطاق العمل داخل النظام.
            </p>

            <div className="admin-company-checks admin-company-checks--large">
              {cleanedGovernorateOptions.map((governorate) => (
                <label
                  key={governorate.value}
                  className={formData.governorates.includes(governorate.value) ? 'is-checked' : ''}
                >
                  <input
                    type="checkbox"
                    checked={formData.governorates.includes(governorate.value)}
                    onChange={() => handleGovernorateToggle(governorate.value)}
                  />
                  {governorate.label}
                </label>
              ))}
            </div>
            <FieldError
              id="admin-company-governorates-error"
              message={fieldErrors.governorates}
            />
          </div>

          <label
            ref={(node) => setFieldRef('description', node)}
            className={fieldClassName('description', 'admin-company-form__textarea')}
          >
            وصف الشركة / ملاحظات الدعوة
            <textarea
              value={formData.description}
              onChange={(event) => handleChange('description', event.target.value)}
              placeholder="اكتب نبذة مختصرة عن الشركة أو ملاحظات يتم إرسالها للباك..."
              rows={4}
              maxLength={DESCRIPTION_MAX_LENGTH}
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={
                fieldErrors.description
                  ? 'admin-company-description-error'
                  : 'admin-company-description-counter'
              }
            />
            <FieldError
              id="admin-company-description-error"
              message={fieldErrors.description}
            />
            {!fieldErrors.description ? (
              <small id="admin-company-description-counter" className="admin-company-field-counter">
                {formData.description.length}/{DESCRIPTION_MAX_LENGTH}
              </small>
            ) : null}
          </label>

          {!isEditMode ? (
            <div className="admin-company-invite-note">
              بعد إضافة الشركة سيتم إنشاء الحساب وإرسال دعوة التفعيل مباشرة إلى البريد الإلكتروني الخاص بها.
            </div>
          ) : null}

          <div className="admin-company-form__actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </button>

            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting
                ? 'جاري الحفظ...'
                : isEditMode
                  ? 'حفظ التعديلات'
                  : 'إضافة الشركة وإرسال الدعوة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCompanyFormModal;
