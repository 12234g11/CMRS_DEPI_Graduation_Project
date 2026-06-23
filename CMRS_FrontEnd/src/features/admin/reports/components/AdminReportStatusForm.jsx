import { useState } from 'react';
import AdminReportFilterSelect from './AdminReportFilterSelect';
import { adminReportStatusOptions } from '../mocks/adminReportsMockData';

function AdminReportStatusForm({ report, onSave }) {
  const [selectedStatus, setSelectedStatus] = useState(report.status);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);

    await onSave?.({
      status: selectedStatus,
    });

    setIsSaving(false);
  }

  const currentStatusOption = adminReportStatusOptions.find(
    (option) => option.value === report.status,
  );

  return (
    <form className="admin-report-details-form" onSubmit={handleSubmit}>
      <section className="admin-report-details-card admin-report-action-card">
        <header className="admin-report-card-header">
          <div>
            <h2>تحديث الحالة</h2>
            <p>Status</p>
          </div>
        </header>

        <div className="admin-report-form-group">
          <label>الحالة الحالية</label>

          <span
            className={`admin-report-status admin-report-status--${
              currentStatusOption?.tone || report.statusTone
            }`}
          >
            {report.status}
          </span>
        </div>

        <div className="admin-report-form-group">
          <label>تغيير إلى</label>

          <AdminReportFilterSelect
            value={selectedStatus}
            options={adminReportStatusOptions}
            onChange={setSelectedStatus}
            ariaLabel="تغيير حالة البلاغ"
            placeholder="اختر الحالة..."
            variant="inline"
          />
        </div>

        <button type="submit" className="admin-report-save-btn" disabled={isSaving}>
          {isSaving ? 'جاري حفظ الحالة...' : 'حفظ الحالة'}
        </button>
      </section>
    </form>
  );
}

export default AdminReportStatusForm;