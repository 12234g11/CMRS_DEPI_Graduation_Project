import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiPhone,
  FiShield,
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
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setIsConfirming(false);
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
      if (event.key !== 'Escape' || isSaving) return;

      if (isConfirming) {
        setIsConfirming(false);
        return;
      }

      onClose?.();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isConfirming, isOpen, isSaving, onClose]);

  const selectedTeam = useMemo(
    () => teams.find((team) => String(team.id) === String(selectedTeamId)),
    [selectedTeamId, teams],
  );

  const availableTeamsCount = useMemo(
    () => teams.filter((team) => team.canAssign !== false).length,
    [teams],
  );

  function validateSelectedTeam() {
    if (!selectedTeamId || !selectedTeam) {
      setError('اختر فرقة صيانة أولًا قبل تأكيد التعيين.');
      return false;
    }

    if (selectedTeam.canAssign === false || selectedTeam.isEnabled === false) {
      setError(
        selectedTeam.unavailableReason ||
          'لا يمكن تعيين البلاغ إلى فريق غير مفعّل أو غير متاح حاليًا.',
      );
      return false;
    }

    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateSelectedTeam()) return;

    setError('');
    setIsConfirming(true);
  }

  async function handleConfirmAssignment() {
    if (!validateSelectedTeam()) {
      setIsConfirming(false);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const updatedReport = await assignMaintenanceTeamToReport(report.id, {
        teamId: selectedTeamId,
      });
      onAssigned?.({
        ...report,
        ...updatedReport,
        assignedTeam:
          updatedReport?.assignedTeam || selectedTeam || report.assignedTeam || null,
      });
      setIsConfirming(false);
      onClose?.();
    } catch (requestError) {
      setIsConfirming(false);
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
        if (event.target === event.currentTarget && !isSaving && !isConfirming) onClose?.();
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
            <p>اختر فرقة مفعّلة ومتاحة لتتولى تنفيذ البلاغ.</p>
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
            لا توجد فرق صيانة مسجلة في حساب الشركة حاليًا.
          </div>
        ) : null}

        {!isLoading && teams.length && !availableTeamsCount ? (
          <div className="company-modal-empty company-modal-empty--warning">
            <FiAlertCircle />
            لا توجد فرق مفعّلة ومتاحة للتعيين حاليًا. فعّل فريقًا أو انتظر حتى تتوفر سعته.
          </div>
        ) : null}

        {!isLoading && teams.length ? (
          <div className="company-technicians-list" role="radiogroup" aria-label="فرق الصيانة">
            {teams.map((team) => {
              const isSelected = String(team.id) === String(selectedTeamId);
              const isUnavailable = team.canAssign === false || team.isEnabled === false;

              return (
                <button
                  key={team.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={isUnavailable}
                  className={`company-technician-card ${isSelected ? 'is-selected' : ''} ${isUnavailable ? 'is-disabled' : ''}`}
                  onClick={() => {
                    if (isUnavailable) {
                      setError(
                        team.unavailableReason ||
                          'لا يمكن اختيار هذا الفريق لأنه غير مفعّل أو غير متاح حاليًا.',
                      );
                      return;
                    }

                    setSelectedTeamId(team.id);
                    setIsConfirming(false);
                    setError('');
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
                    <span className="company-technician-card__meta">
                      {team.phone ? (
                        <small>
                          <FiPhone />
                          {team.phone}
                        </small>
                      ) : null}
                      {Number.isFinite(Number(team.activeTasks)) ? (
                        <small>
                          <FiTool />
                          المهام النشطة: {team.activeTasks}/{team.maxCapacity || 5}
                        </small>
                      ) : null}
                    </span>
                    {isUnavailable && team.unavailableReason ? (
                      <small className="company-technician-card__reason">
                        <FiAlertCircle />
                        {team.unavailableReason}
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
            disabled={
              isSaving ||
              isLoading ||
              !teams.length ||
              !selectedTeam ||
              selectedTeam.canAssign === false
            }
          >
            <FiCheckCircle />
            مراجعة التعيين
          </button>
        </div>
      </form>

      {isConfirming && selectedTeam ? (
        <div
          className="company-team-confirmation-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) setIsConfirming(false);
          }}
        >
          <section
            className="company-team-confirmation"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="company-team-confirmation-title"
            aria-describedby="company-team-confirmation-description"
          >
            <span className="company-team-confirmation__icon">
              <FiShield />
            </span>

            <h3 id="company-team-confirmation-title">تأكيد تعيين فرقة الصيانة</h3>
            <p id="company-team-confirmation-description">
              راجع بيانات الفرقة قبل إرسال التعيين. بعد التأكيد سيظهر البلاغ ضمن مهام الفرقة المختارة.
            </p>

            <div className="company-team-confirmation__summary">
              <div>
                <small>البلاغ</small>
                <strong>{report.title || report.type}</strong>
                <span dir="ltr">{report.id}</span>
              </div>

              <span className="company-team-confirmation__arrow" aria-hidden="true">
                <FiCheckCircle />
              </span>

              <div>
                <small>الفرقة المختارة</small>
                <strong>{selectedTeam.name}</strong>
                <span>{selectedTeam.leadName || selectedTeam.specialization || 'فرقة صيانة'}</span>
              </div>
            </div>

            <div className="company-team-confirmation__status">
              <FiCheckCircle />
              الفريق مفعّل ومتاح للتعيين حاليًا.
            </div>

            <div className="company-team-confirmation__actions">
              <button
                type="button"
                className="company-team-confirmation__back"
                onClick={() => setIsConfirming(false)}
                disabled={isSaving}
              >
                الرجوع للاختيار
              </button>
              <button
                type="button"
                className="company-team-confirmation__confirm"
                onClick={handleConfirmAssignment}
                disabled={isSaving}
              >
                <FiCheckCircle />
                {isSaving ? 'جاري التعيين...' : 'نعم، تعيين الفريق'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default AssignMaintenanceTeamModal;
