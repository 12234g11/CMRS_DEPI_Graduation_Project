import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from 'react-icons/fi';

function ProfileInfoCard({
  values,
  isEditing = false,
  onChange,
}) {
  const handleChange = (event) => {
    const { name, value } = event.target;

    onChange?.({
      ...values,
      [name]: value,
    });
  };

  return (
    <section className="user-profile-card user-profile-info-card">
      <div className="user-profile-card__header">
        <div>
          <h2>البيانات الشخصية</h2>
          <p>معلومات الحساب الأساسية التي تظهر داخل النظام.</p>
        </div>

        <span className="user-profile-card__icon">
          <FiUser />
        </span>
      </div>

      {isEditing ? (
        <div className="user-profile-form">
          <label>
            <span>الاسم الكامل</span>
            <input
              type="text"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              placeholder="اكتب الاسم الكامل"
            />
          </label>

          <label>
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
          </label>

          <label>
            <span>رقم الهاتف</span>
            <input
              type="text"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              placeholder="رقم الهاتف"
            />
          </label>

          <label>
            <span>المدينة</span>
            <input
              type="text"
              name="city"
              value={values.city}
              onChange={handleChange}
              placeholder="المدينة"
            />
          </label>

          <label className="user-profile-form__full">
            <span>نبذة قصيرة</span>
            <textarea
              name="bio"
              value={values.bio}
              onChange={handleChange}
              placeholder="اكتب نبذة قصيرة عن نشاطك داخل النظام"
              rows={4}
            />
          </label>
        </div>
      ) : (
        <div className="user-profile-info-list">
          <article>
            <FiUser />
            <div>
              <span>الاسم الكامل</span>
              <strong>{values.fullName}</strong>
            </div>
          </article>

          <article>
            <FiMail />
            <div>
              <span>البريد الإلكتروني</span>
              <strong>{values.email}</strong>
            </div>
          </article>

          <article>
            <FiPhone />
            <div>
              <span>رقم الهاتف</span>
              <strong>{values.phone}</strong>
            </div>
          </article>

          <article>
            <FiMapPin />
            <div>
              <span>المدينة</span>
              <strong>{values.city}</strong>
            </div>
          </article>

          <article className="user-profile-info-list__bio">
            <div>
              <span>نبذة عن المستخدم</span>
              <p>{values.bio}</p>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

export default ProfileInfoCard;