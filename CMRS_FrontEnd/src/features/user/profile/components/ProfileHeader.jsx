import {
  FiCalendar,
  FiEdit3,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiShield,
  FiX,
} from 'react-icons/fi';

function getInitials(name = '') {
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (!words.length) return '؟';

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('');
}

function formatJoinDate(value) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return 'تاريخ غير محدد';
  }

  return date.toLocaleDateString('ar-EG', {
    month: 'long',
    year: 'numeric',
  });
}

function ProfileHeader({
  profile,
  isEditing = false,
  isSaving = false,
  onEdit,
  onSave,
  onCancel,
}) {
  return (
    <section className="user-profile-header">
      <div className="user-profile-header__top">
        <div className="user-profile-header__title">
          <h1>الملف الشخصي</h1>
          <p>إدارة بيانات حسابك داخل النظام</p>
        </div>

        <div className="user-profile-header__actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="user-profile-btn user-profile-btn--ghost"
                onClick={onCancel}
                disabled={isSaving}
              >
                <FiX />
                إلغاء
              </button>

              <button
                type="button"
                className="user-profile-btn user-profile-btn--primary"
                onClick={onSave}
                disabled={isSaving}
              >
                <FiSave />
                {isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديل'}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="user-profile-btn user-profile-btn--primary"
              onClick={onEdit}
            >
              <FiEdit3 />
              تعديل الملف الشخصي
            </button>
          )}
        </div>
      </div>

      <div className="user-profile-header__banner" />

      <div className="user-profile-header__card">
        <div className="user-profile-header__identity">
          <div className="user-profile-avatar" aria-hidden="true">
            {getInitials(profile?.fullName)}
          </div>

          <div>
            <h2>{profile?.fullName || 'مستخدم'}</h2>

            <div className="user-profile-header__status">
              <span className="user-profile-header__status-dot" />
              <span>حساب نشط</span>
            </div>
          </div>
        </div>

        <div className="user-profile-header__meta">
          <span>
            <FiMail />
            {profile?.email || 'لا يوجد بريد إلكتروني'}
          </span>

          <span>
            <FiPhone />
            {profile?.phone || 'لا يوجد رقم هاتف'}
          </span>

          <span>
            <FiMapPin />
            {profile?.city || 'محافظة غير محددة'}
          </span>

          <span>
            <FiCalendar />
            انضم في {formatJoinDate(profile?.joinedAt)}
          </span>

          <span>
            <FiShield />
            درجة الثقة {profile?.trustScore ?? 0}%
          </span>
        </div>
      </div>
    </section>
  );
}

export default ProfileHeader;