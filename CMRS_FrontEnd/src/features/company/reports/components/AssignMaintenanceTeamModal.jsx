import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiPhone,
  FiTool,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import {
  assignMaintenanceTeamToReport,
  getCompanyMaintenanceTeams,
} from '../api/companyReportsApi';

function getAvailabilityClass(availability = '') {
  const normalized = String(availability).toLowerCase();
  if (normalized === 'available') return 'is-available';
  if (normalized === 'busy') return 'is-busy';
  return 'is-unavailable';
}

function AssignMaintenanceTeamModal({ report, isOpen, onClose, onAssigned }) {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setError('');
    setSelectedTeamId(report?.assignedTeam?.id || '');

    getCompanyMaintenanceTeams()
      .then((data) => {
        if (!isMounted) return;
        setTeams(data || []);
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setTeams([]);
        setError(requestError.message || 'تعذر تحميل فرق الصيانة التابعة للشركة.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, report?.assignedTeam?.id]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape' && !isSaving) onClose?.();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSaving, onClose]);

  const selectedTeam = useMemo(
    () => teams.find((team) => String(team.id) === String(selectedTeamId)),
    [selectedTeamId, teams],
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedTeamId) {
      setError('اختر فرقة صيانة أولًا قبل تأكيد التعيين.');
      return;
    }

    const isConfirmed = window.confirm(
      `هل تريد تعيين ${selectedTeam?.name || 'فرقة الصيانة المختارة'} لهذا البلاغ؟`,
    );

    if (!isConfirmed) return;

    setIsSaving(true);
    setError('');

    try {
      const updatedReport = await assignMaintenanceTeamToReport(report.id, {
        technicianId: selectedTeamId,
      });
      onAssigned?.(updatedReport);
      onClose?.();
    } catch (requestError) {
      setError(requestError.message || 'تعذر تعيين فرقة الصيانة للبلاغ.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen || !report) return null;

  return (
    <div
      className="company-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose?.();
      }}
    >
      <form
        className="company-modal company-team-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-team-modal-title"
        onSubmit={handleSubmit}
        noValidate
      >
        <button
          type="button"
          className="company-modal__close"
          onClick={onClose}
          disabled={isSaving}
          aria-label="إغلاق نافذة تعيين فرقة الصيانة"
        >
          <FiX />
        </button>

        <header className="company-modal__header">
          <span className="company-modal__icon">
            <FiUsers />
          </span>
          <div>
            <h2 id="company-team-modal-title">تعيين فرقة صيانة</h2>
            <p>اختر الفرقة التي ستتولى تنفيذ البلاغ، ويمكن تغييرها لاحقًا.</p>
          </div>
        </header>

        <div className="company-assign-report-summary">
          <strong>{report.title || report.type}</strong>
          <span className="company-copyable-report-id">
            رقم البلاغ:{' '}
            <b className="company-report-id-value" dir="ltr">{report.id}</b>
          </span>
          <span>{report.location || 'الموقع غير متوفر'}</span>
        </div>

        {error ? (
          <div className="company-modal-error" role="alert">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="company-modal-loading">
            <FiTool />
            جاري تحميل فرق الصيانة...
          </div>
        ) : null}

        {!isLoading && !teams.length ? (
          <div className="company-modal-empty">
            <FiAlertCircle />
            لا توجد فرق صيانة متاحة في حساب الشركة حاليًا.
          </div>
        ) : null}

        {!isLoading && teams.length ? (
          <div className="company-technicians-list" role="radiogroup" aria-label="فرق الصيانة">
            {teams.map((team) => {
              const isSelected = String(team.id) === String(selectedTeamId);
              const isUnavailable = String(team.availability).toLowerCase() === 'unavailable';

              return (
                <button
                  key={team.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`company-technician-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    if (!isUnavailable) {
                      setSelectedTeamId(team.id);
                      setError('');
                    }
                  }}
                  disabled={isUnavailable || isSaving}
                >
                  <span className="company-technician-card__icon">
                    {isSelected ? <FiUserCheck /> : <FiUsers />}
                  </span>

                  <span className="company-technician-card__content">
                    <strong>{team.name}</strong>
                    <p>
                      {team.specialization || 'تخصص عام'}
                      {team.leadName ? ` — المسؤول: ${team.leadName}` : ''}
                    </p>
                    {team.phone ? (
                      <small>
                        <FiPhone />
                        {team.phone}
                      </small>
                    ) : null}
                  </span>

                  <span
                    className={`company-technician-card__badge ${getAvailabilityClass(team.availability)}`}
                  >
                    {team.availabilityLabel || team.availability || 'غير محدد'}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="company-modal__actions">
          <button
            type="button"
            className="company-modal-cancel-btn"
            onClick={onClose}
            disabled={isSaving}
          >
            إلغاء
          </button>

          <button
            type="submit"
            className="company-modal-submit-btn"
            disabled={isSaving || isLoading || !teams.length}
          >
            <FiCheckCircle />
            {isSaving ? 'جاري التعيين...' : 'تأكيد التعيين'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignMaintenanceTeamModal;
