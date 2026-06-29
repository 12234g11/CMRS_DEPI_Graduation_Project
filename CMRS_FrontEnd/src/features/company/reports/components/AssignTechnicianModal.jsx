import { useEffect, useState } from 'react';
import { FiCheckCircle, FiPhone, FiUserCheck, FiUsers, FiX } from 'react-icons/fi';
import {
  assignTechnicianToReport,
  getCompanyTechnicians,
} from '../api/companyReportsApi';

function AssignTechnicianModal({
  report,
  isOpen,
  onClose,
  onAssigned,
}) {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    getCompanyTechnicians().then((data) => {
      setTechnicians(data);

      const currentTeamId = report?.assignedTeam?.id;
      setSelectedTechnicianId(currentTeamId || data[0]?.id || '');
    });
  }, [isOpen, report]);

  if (!isOpen || !report) return null;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedTechnicianId) return;

    setIsSaving(true);

    const updatedReport = await assignTechnicianToReport(report.id, {
      technicianId: selectedTechnicianId,
    });

    onAssigned?.(updatedReport);
    setIsSaving(false);
    onClose();
  }

  return (
    <div className="company-modal-backdrop">
      <form
        className="company-modal company-assign-modal"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="company-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="company-modal__header">
          <span className="company-modal__icon">
            <FiUsers />
          </span>

          <div>
            <h2>تعيين فرقة صيانة</h2>
            <p>
              #{report.id} - {report.type}
            </p>
          </div>
        </header>

        <div className="company-assign-report-summary">
          <strong>{report.title}</strong>
          <span>{report.location}</span>
        </div>

        <div className="company-technicians-list">
          {technicians.map((technician) => {
            const isSelected = selectedTechnicianId === technician.id;

            return (
              <button
                key={technician.id}
                type="button"
                className={`company-technician-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedTechnicianId(technician.id)}
              >
                <span className="company-technician-card__icon">
                  <FiUserCheck />
                </span>

                <div>
                  <strong>{technician.name}</strong>
                  <p>{technician.specialization}</p>

                  <small>
                    <FiPhone />
                    {technician.leadName} - {technician.phone}
                  </small>
                </div>

                <span className={`company-technician-card__badge is-${technician.availability}`}>
                  {technician.availabilityLabel}
                </span>
              </button>
            );
          })}
        </div>

        <div className="company-modal__actions">
          <button
            type="button"
            className="company-modal-cancel-btn"
            onClick={onClose}
          >
            إلغاء
          </button>

          <button
            type="submit"
            className="company-modal-submit-btn"
            disabled={isSaving}
          >
            <FiCheckCircle />
            {isSaving ? 'جاري التعيين...' : 'تأكيد التعيين'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignTechnicianModal;