import { useEffect, useState } from 'react';
import { FiCheckCircle, FiInfo, FiUsers, FiX } from 'react-icons/fi';
import { COMPANY_TEAM_STATUSES } from '../mocks/companyTeamsMockData';

const initialValues = {
  name: '',
  leadName: '',
  phone: '',
  membersCount: 3,
  maxCapacity: 5,
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
        membersCount: team.membersCount ?? 3,
        maxCapacity: team.maxCapacity ?? 5,
        status: team.status || COMPANY_TEAM_STATUSES.ACTIVE,
        notes: team.notes || '',
      });
    } else {
      setFormData(initialValues);
    }

    setError('');
    setIsSaving(false);
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
    if (!Number.isInteger(Number(formData.maxCapacity)) || Number(formData.maxCapacity) <= 0) {
      return 'السعة القصوى يجب أن تكون رقمًا صحيحًا أكبر من صفر.';
    }
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

    try {
      await onSave?.({
        name: formData.name.trim(),
        leadName: formData.leadName.trim(),
        phone: formData.phone.trim(),
        membersCount: Number(formData.membersCount),
        maxCapacity: Number(formData.maxCapacity),
        status: formData.status,
        notes: formData.notes.trim(),
      });
    } catch (saveError) {
      setError(saveError.message || 'تعذر حفظ بيانات فرقة الصيانة. حاول مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
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
                ? 'تحديث البيانات الأساسية فقط، أما المهام والتوفر فيتم حسابهم تلقائيًا.'
                : 'أضف البيانات الأساسية للفرقة، وسيحسب النظام المهام والتوفر تلقائيًا.'}
            </p>
          </div>
        </header>

        <div className="company-team-system-note" role="note">
          <FiInfo />
          <p>
            المهام النشطة وحالة التوفر لا يتم إدخالهما أو حسابهما من الفرونت. يحدد الباك
            حالة التوفر تلقائيًا بمقارنة المهام النشطة بالسعة القصوى الخاصة بكل فرقة.
          </p>
        </div>

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
            السعة القصوى للمهام النشطة
            <input
              name="maxCapacity"
              type="number"
              min="1"
              step="1"
              required
              value={formData.maxCapacity}
              onChange={handleNumberChange}
              placeholder="مثال: 10"
            />
          </label>
        </div>

        <label className="company-team-form-field company-team-form-field--full">
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
            disabled={isSaving}
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
