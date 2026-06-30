import { FiAlertTriangle, FiCheckCircle, FiPower, FiX } from 'react-icons/fi';
import { COMPANY_TEAM_STATUSES } from '../mocks/companyTeamsMockData';

function CompanyTeamStatusModal({
  team,
  onClose,
  onConfirm,
}) {
  if (!team) return null;

  const isActive = team.status === COMPANY_TEAM_STATUSES.ACTIVE;

  return (
    <div className="company-team-modal-backdrop">
      <section className="company-team-modal company-team-status-modal">
        <button
          type="button"
          className="company-team-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="company-team-modal__header">
          <span className={isActive ? 'is-danger' : 'is-success'}>
            {isActive ? <FiPower /> : <FiCheckCircle />}
          </span>

          <div>
            <h2>{isActive ? 'إيقاف فرقة الصيانة' : 'تفعيل فرقة الصيانة'}</h2>
            <p>{team.name}</p>
          </div>
        </header>

        <div className="company-team-status-warning">
          <FiAlertTriangle />

          <p>
            {isActive
              ? 'عند إيقاف الفرقة لن يتم استخدامها في تعيينات جديدة حتى يتم تفعيلها مرة أخرى.'
              : 'عند تفعيل الفرقة ستصبح متاحة للاستخدام في تعيين البلاغات الجديدة.'}
          </p>
        </div>

        <div className="company-team-modal__actions">
          <button
            type="button"
            className="company-team-cancel-btn"
            onClick={onClose}
          >
            إلغاء
          </button>

          <button
            type="button"
            className={isActive ? 'company-team-danger-btn' : 'company-team-save-btn'}
            onClick={() =>
              onConfirm(
                team,
                isActive
                  ? COMPANY_TEAM_STATUSES.DISABLED
                  : COMPANY_TEAM_STATUSES.ACTIVE,
              )
            }
          >
            {isActive ? 'تأكيد الإيقاف' : 'تأكيد التفعيل'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default CompanyTeamStatusModal;