import { useEffect, useMemo, useState } from 'react';
import { FiX } from 'react-icons/fi';
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

  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (isEditMode && company) {
      setFormData({
        ...emptyForm,
        ...company,
        specialization: resolveSpecializationValue(
          company.specialization,
          cleanedSpecializationOptions,
        ),
        governorates: company.governorates?.length
          ? company.governorates
          : [company.governorate].filter(Boolean),
        maxCapacity: company.maxCapacity || 10,
      });
    } else {
      setFormData(emptyForm);
    }

    setFormError('');
  }, [cleanedSpecializationOptions, company, emptyForm, isEditMode]);

  function handleChange(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleGovernorateToggle(governorate) {
    const nextGovernorates = toggleArrayValue(formData.governorates, governorate);

    setFormData((current) => ({
      ...current,
      governorates: nextGovernorates,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.governorates.length) {
      setFormError('برجاء اختيار محافظة واحدة على الأقل تعمل بها الشركة.');
      return;
    }

    const payload = {
      ...formData,
      maxCapacity: Number(formData.maxCapacity || 10),
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

    onSubmit(payload);
  }

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

        <form className="admin-company-form" onSubmit={handleSubmit}>
          <div className="admin-company-form__grid">
            <label>
              اسم الشركة
              <input
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="مثال: شركة الطرق السريعة"
                required
              />
            </label>

            <label>
              نوع الخدمة الرئيسي
              <AdminReportFilterSelect
                value={formData.specialization}
                options={cleanedSpecializationOptions}
                onChange={(value) => handleChange('specialization', value)}
                ariaLabel="اختيار نوع الخدمة الرئيسي"
                placeholder="اختر نوع الخدمة..."
                variant="overlay"
              />
            </label>

            <label>
              الحد الأقصى للبلاغات النشطة
              <input
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(event) => handleChange('maxCapacity', event.target.value)}
                placeholder="مثال: 10"
              />
              <small className="admin-company-field-hint">
يتم إرساله عند إنشاء الشركة وتعديلها، ويستخدم كحد أقصى للبلاغات النشطة المسندة للشركة.              </small>
            </label>

            <label>
              اسم مسؤول الشركة
              <input
                value={formData.managerName}
                onChange={(event) => handleChange('managerName', event.target.value)}
                placeholder="اسم المسؤول"
              />
            </label>

            <label>
              هاتف المسؤول
              <input
                value={formData.managerPhone}
                onChange={(event) => handleChange('managerPhone', event.target.value)}
                placeholder="+20 100 000 0000"
              />
            </label>

            <label>
              رقم الشركة
              <input
                value={formData.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                placeholder="+20 100 000 0000"
                required
              />
            </label>

            <label className="admin-company-form__full">
              البريد الإلكتروني للشركة / إيميل الدخول
              <input
                type="email"
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="company@example.com"
                required
              />
              <small className="admin-company-field-hint">
                سيتم استخدام هذا البريد لإرسال دعوة التفعيل، وسيتم استخدامه لاحقًا لتسجيل دخول الشركة.
              </small>
            </label>

            <label className="admin-company-form__full">
              العنوان
              <input
                value={formData.address}
                onChange={(event) => handleChange('address', event.target.value)}
                placeholder="العنوان التفصيلي"
              />
            </label>
          </div>

          <div className="admin-company-form-section">
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
          </div>

          <label className="admin-company-form__textarea">
            وصف الشركة / ملاحظات الدعوة
            <textarea
              value={formData.description}
              onChange={(event) => handleChange('description', event.target.value)}
              placeholder="اكتب نبذة مختصرة عن الشركة أو ملاحظات يتم إرسالها للباك..."
              rows={4}
            />
          </label>

          {!isEditMode ? (
            <div className="admin-company-invite-note">
بعد إضافة الشركة سيتم إنشاء الحساب وإرسال دعوة التفعيل مباشرة إلى البريد الإلكتروني الخاص بها.            </div>
          ) : null}

          {formError ? (
            <p className="admin-company-form-error">{formError}</p>
          ) : null}

          <div className="admin-company-form__actions">
            <button type="button" onClick={onClose}>
              إلغاء
            </button>

            <button type="submit">
              {isEditMode ? 'حفظ التعديلات' : 'إضافة الشركة وإرسال الدعوة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCompanyFormModal;
