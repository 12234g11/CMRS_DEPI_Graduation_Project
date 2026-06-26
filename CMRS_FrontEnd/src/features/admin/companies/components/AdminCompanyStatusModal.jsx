import { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

function AdminCompanyStatusModal({ company, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  if (!company) return null;

  const isActive = company.status === 'active';
  const nextAction = isActive ? 'تعطيل' : 'تفعيل';

  function handleConfirm() {
    onConfirm({
      company,
      reason,
      nextStatus: isActive ? 'disabled' : 'active',
    });
  }

  return (
    <div className="admin-company-modal-backdrop" role="presentation">
      <div className="admin-company-status-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="admin-company-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <div className="admin-company-status-modal__icon">
          <FiAlertTriangle />
        </div>

        <h2>{nextAction} الشركة</h2>

        <p>
          هل أنت متأكد من {nextAction} شركة <strong>{company.name}</strong>؟
        </p>

        <label>
          سبب {nextAction} الشركة
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={
              isActive
                ? 'مثال: عدم الالتزام بزمن الاستجابة أو توقف مؤقت للخدمة...'
                : 'مثال: تم تحديث بيانات الشركة وأصبحت جاهزة لاستقبال المهام...'
            }
            rows={4}
          />
        </label>

        <div className="admin-company-status-modal__actions">
          <button type="button" onClick={onClose}>
            إلغاء
          </button>

          <button type="button" onClick={handleConfirm}>
            تأكيد {nextAction}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminCompanyStatusModal;