import {
  FiCalendar,
  FiCheckCircle,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
} from 'react-icons/fi';

function AdminProfileHeader({ profile }) {
  if (!profile) return null;

  return (
    <section className="admin-profile-header-card">
      <div className="admin-profile-header-card__avatar">
        <FiShield />
      </div>

      <div className="admin-profile-header-card__content">
        <div className="admin-profile-header-card__title-row">
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.roleLabel}</p>
          </div>

          <span className="admin-profile-status">
            <FiCheckCircle />
            {profile.status || 'نشط'}
          </span>
        </div>

        <div className="admin-profile-header-card__info">
          <span>
            <FiMail />
            {profile.email || 'غير متاح'}
          </span>

          <span>
            <FiPhone />
            {profile.phone || 'غير متاح'}
          </span>

          <span>
            <FiMapPin />
            محافظة {profile.governorate || 'غير محددة'}
          </span>

          <span>
            <FiCalendar />
            منذ {profile.joinedAt || 'غير متاح'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default AdminProfileHeader;
