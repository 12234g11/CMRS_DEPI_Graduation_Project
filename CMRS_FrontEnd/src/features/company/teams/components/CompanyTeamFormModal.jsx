import { useEffect, useState } from 'react';
import { FiCheckCircle, FiUsers, FiX } from 'react-icons/fi';
import CompanyTeamsFilterSelect from './CompanyTeamsFilterSelect';
import {
  COMPANY_TEAM_AVAILABILITY,
  COMPANY_TEAM_STATUSES,
  companyTeamAvailabilityOptions,
} from '../mocks/companyTeamsMockData';

const initialValues = {
  name: '',
  leadName: '',
  phone: '',
  membersCount: 3,
  activeTasks: 0,
  completedTasks: 0,
  availability: COMPANY_TEAM_AVAILABILITY.AVAILABLE,
  status: COMPANY_TEAM_STATUSES.ACTIVE,
  notes: '',
};

function CompanyTeamFormModal({
  isOpen,
  mode = 'create',
  team,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState(initialValues);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && team) {
      setFormData({
        name: team.name || '',
        leadName: team.leadName || '',
        phone: team.phone || '',
        membersCount: team.membersCount || 3,
        activeTasks: team.activeTasks || 0,
        completedTasks: team.completedTasks || 0,
        availability: team.availability || COMPANY_TEAM_AVAILABILITY.AVAILABLE,
        status: team.status || COMPANY_TEAM_STATUSES.ACTIVE,
        notes: team.notes || '',
      });
    } else {
      setFormData(initialValues);
    }

    setError('');
  }, [isEditMode, isOpen, team]);

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (error) setError('');
  }

  function handleNumberChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: Number(value),
    }));

    if (error) setError('');
  }

  function validateForm() {
    if (!formData.name.trim()) return 'من فضلك اكتب اسم فرقة الصيانة.';
    if (!formData.leadName.trim()) return 'من فضلك اكتب اسم قائد الفرقة.';
    if (!formData.phone.trim()) return 'من فضلك اكتب رقم التواصل.';
    if (Number(formData.membersCount) <= 0) return 'عدد الأفراد يجب أن يكون أكبر من صفر.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    await onSave?.({
      ...formData,
      name: formData.name.trim(),
      leadName: formData.leadName.trim(),
      phone: formData.phone.trim(),
      notes: formData.notes.trim(),
    });

    setIsSaving(false);
  }

  return (
    <div className="company-team-modal-backdrop">
      <form className="company-team-modal" onSubmit={handleSubmit}>
        <button
          type="button"
          className="company-team-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="company-team-modal__header">
          <span>
            <FiUsers />
          </span>

          <div>
            <h2>{isEditMode ? 'تعديل فرقة صيانة' : 'إضافة فرقة صيانة'}</h2>
            <p>
              {isEditMode
                ? 'تحديث بيانات فرقة الصيانة الحالية.'
                : 'أضف فرقة صيانة جديدة للشركة.'}
            </p>
          </div>
        </header>

        <div className="company-team-form-grid">
          <label className="company-team-form-field">
            اسم الفرقة
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: فرقة الصيانة 3"
            />
          </label>

          <label className="company-team-form-field">
            قائد الفرقة
            <input
              name="leadName"
              type="text"
              value={formData.leadName}
              onChange={handleChange}
              placeholder="مثال: م. محمد أحمد"
            />
          </label>

          <label className="company-team-form-field">
            رقم التواصل
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+20 100 000 0000"
            />
          </label>

          <label className="company-team-form-field">
            عدد الأفراد
            <input
              name="membersCount"
              type="number"
              min="1"
              value={formData.membersCount}
              onChange={handleNumberChange}
            />
          </label>

          <label className="company-team-form-field">
            المهام النشطة
            <input
              name="activeTasks"
              type="number"
              min="0"
              value={formData.activeTasks}
              onChange={handleNumberChange}
            />
          </label>

          <label className="company-team-form-field">
            المهام المكتملة
            <input
              name="completedTasks"
              type="number"
              min="0"
              value={formData.completedTasks}
              onChange={handleNumberChange}
            />
          </label>

          <div className="company-team-form-field">
            <span>حالة التوفر</span>

            <CompanyTeamsFilterSelect
              value={formData.availability}
              options={companyTeamAvailabilityOptions.filter(
                (option) => option.value !== 'all',
              )}
              onChange={(value) =>
                setFormData((currentData) => ({
                  ...currentData,
                  availability: value,
                }))
              }
              ariaLabel="اختيار حالة توفر الفرقة"
            />
          </div>
        </div>

        <label className="company-team-form-field">
          ملاحظات
          <textarea
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            placeholder="اكتب أي ملاحظات مهمة عن الفرقة..."
          />
        </label>

        {error ? <p className="company-team-form-error">{error}</p> : null}

        <div className="company-team-modal__actions">
          <button
            type="button"
            className="company-team-cancel-btn"
            onClick={onClose}
          >
            إلغاء
          </button>

          <button
            type="submit"
            className="company-team-save-btn"
            disabled={isSaving}
          >
            <FiCheckCircle />
            {isSaving
              ? 'جاري الحفظ...'
              : isEditMode
                ? 'حفظ التعديلات'
                : 'إضافة الفرقة'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanyTeamFormModal;