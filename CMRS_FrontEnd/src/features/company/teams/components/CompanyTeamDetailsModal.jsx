import {
  FiCheckCircle,
  FiClock,
  FiPhone,
  FiTool,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';

function CompanyTeamDetailsModal({ team, onClose, onEditTeam }) {
  if (!team) return null;

  return (
    <div className="company-team-modal-backdrop">
      <section className="company-team-modal company-team-details-modal">
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
            <h2>{team.name}</h2>
            <p>فريق تشغيل وصيانة تابع للشركة - التوفر محسوب من النظام</p>
          </div>
        </header>

        <div className="company-team-details-status-row">
          <span className={`company-team-status company-team-status--${team.statusTone}`}>
            {team.statusLabel}
          </span>

          <span className={`company-team-availability company-team-availability--${team.availabilityTone}`}>
            {team.availabilityLabel}
          </span>
        </div>

        <div className="company-team-details-grid">
          <div>
            <FiUser />
            <span>قائد الفرقة</span>
            <strong>{team.leadName}</strong>
          </div>

          <div>
            <FiPhone />
            <span>رقم التواصل</span>
            <strong>{team.phone}</strong>
          </div>

          <div>
            <FiUsers />
            <span>عدد الأفراد</span>
            <strong>{team.membersCount} أفراد</strong>
          </div>

          <div>
            <FiTool />
            <span>المهام النشطة المحسوبة</span>
            <strong>{team.activeTasks}</strong>
          </div>

          <div>
            <FiCheckCircle />
            <span>المهام المكتملة</span>
            <strong>{team.completedTasks}</strong>
          </div>

          <div>
            <FiClock />
            <span>آخر تحديث</span>
            <strong>{team.lastActivity}</strong>
          </div>
        </div>

        <div className="company-team-details-notes">
          <h3>ملاحظات</h3>
          <p>{team.notes || 'لا توجد ملاحظات مسجلة لهذه الفرقة.'}</p>
        </div>

        <div className="company-team-modal__actions">
          <button
            type="button"
            className="company-team-cancel-btn"
            onClick={onClose}
          >
            إغلاق
          </button>

          <button
            type="button"
            className="company-team-save-btn"
            onClick={() => onEditTeam(team)}
          >
            تعديل البيانات
          </button>
        </div>
      </section>
    </div>
  );
}

export default CompanyTeamDetailsModal;