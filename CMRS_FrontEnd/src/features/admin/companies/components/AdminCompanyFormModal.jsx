import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import AdminReportFilterSelect from '../../reports/components/AdminReportFilterSelect';
import {
  adminCompanySpecializationOptions,
  COMPANY_GOVERNORATES,
} from '../mocks/adminCompaniesMockData';

const emptyForm = {
  name: '',
  specialization: 'الطرق والرصف',
  governorates: [COMPANY_GOVERNORATES.CAIRO],
  maxCapacity: 10,
  phone: '',
  email: '',
  managerName: '',
  managerPhone: '',
  address: '',
  description: '',
};

const specializationOptions = adminCompanySpecializationOptions.filter(
  (option) => option.value !== 'all',
);

const governorateOptions = Object.values(COMPANY_GOVERNORATES);

function toggleArrayValue(list, value) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function AdminCompanyFormModal({
  mode = 'add',
  company,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (isEditMode && company) {
      setFormData({
        ...emptyForm,
        ...company,
        governorates: company.governorates?.length
          ? company.governorates
          : [company.governorate].filter(Boolean),
        maxCapacity: company.maxCapacity || 10,
      });
    } else {
      setFormData(emptyForm);
    }

    setFormError('');
  }, [company, isEditMode]);

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
              : 'سيتم إنشاء حساب دخول للشركة وإصدار رابط دعوة لتعيين كلمة المرور.'}
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
                options={specializationOptions}
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
                عدد البلاغات التي يمكن للشركة استقبالها في نفس الوقت.
              </small>
            </label>

            <label>
              اسم مسؤول الشركة
              <input
                value={formData.managerName}
                onChange={(event) => handleChange('managerName', event.target.value)}
                placeholder="اسم المسؤول"
                required
              />
            </label>

            <label>
              هاتف المسؤول
              <input
                value={formData.managerPhone}
                onChange={(event) => handleChange('managerPhone', event.target.value)}
                placeholder="+20 100 000 0000"
                required
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
                required
              />
            </label>
          </div>

          <div className="admin-company-form-section">
            <h3>المحافظات التي تغطيها الشركة</h3>
            <p>
              الشركة تعتبر مسؤولة عن جميع المناطق داخل المحافظة أو المحافظات المختارة.
            </p>

            <div className="admin-company-checks admin-company-checks--large">
              {governorateOptions.map((governorate) => (
                <label
                  key={governorate}
                  className={formData.governorates.includes(governorate) ? 'is-checked' : ''}
                >
                  <input
                    type="checkbox"
                    checked={formData.governorates.includes(governorate)}
                    onChange={() => handleGovernorateToggle(governorate)}
                  />
                  {governorate}
                </label>
              ))}
            </div>
          </div>

          <label className="admin-company-form__textarea">
            وصف الشركة
            <textarea
              value={formData.description}
              onChange={(event) => handleChange('description', event.target.value)}
              placeholder="اكتب نبذة مختصرة عن الشركة وخبرتها..."
              rows={4}
            />
          </label>

          {!isEditMode ? (
            <div className="admin-company-invite-note">
              بعد إضافة الشركة سيتم إنشاء رابط دعوة لتفعيل الحساب وتعيين كلمة المرور.
            </div>
          ) : null}

          {formError ? (
            <p className="admin-company-form-error">{formError}</p>
          ) : null}

          <div className="admin-company-form__actions">
            <button type="button" onClick={onClose}>
              إلغاء
            </button>

            <button type="submit">
              {isEditMode ? 'حفظ التعديلات' : 'إضافة الشركة وإنشاء الدعوة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCompanyFormModal;