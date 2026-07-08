import { FiClock, FiMapPin, FiShield, FiUser } from 'react-icons/fi';

function AdminProfileDetailsCard({ profile }) {
  if (!profile) return null;

  return (
    <section className="admin-profile-card">
      <header className="admin-profile-card__header">
        <div>
          <h2>بيانات الحساب</h2>
          <p>Account Information</p>
        </div>
      </header>

      <div className="admin-profile-details-list">
        <div>
          <span>
            <FiUser />
            الاسم
          </span>
          <strong>{profile.name}</strong>
        </div>

        <div>
          <span>
            <FiShield />
            الدور
          </span>
          <strong>{profile.roleLabel}</strong>
        </div>

        <div>
          <span>
            <FiMapPin />
            نطاق العمل
          </span>
          <strong>محافظة {profile.governorate}</strong>
        </div>

        <div>
          <span>
            <FiUser />
            الإدارة
          </span>
          <strong>{profile.department}</strong>
        </div>

        <div>
          <span>
            <FiClock />
            آخر تسجيل دخول
          </span>
          <strong>{profile.lastLogin}</strong>
        </div>
      </div>
    </section>
  );
}

export default AdminProfileDetailsCard;
