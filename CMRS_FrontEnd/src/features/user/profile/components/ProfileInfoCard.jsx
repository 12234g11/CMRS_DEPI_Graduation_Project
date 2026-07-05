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
  errors = {},
}) {
  function handleChange(event) {
    const { name, value } = event.target;

    onChange?.({
      ...values,
      [name]: value,
    });
  }

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
              value={values.fullName || ''}
              onChange={handleChange}
              placeholder="اكتب الاسم الكامل"
              className={errors.fullName ? 'is-invalid' : ''}
            />

            {errors.fullName ? (
              <small className="user-profile-form__error">
                {errors.fullName}
              </small>
            ) : null}
          </label>

          <label>
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              name="email"
              value={values.email || ''}
              onChange={handleChange}
              placeholder="example@email.com"
              className={errors.email ? 'is-invalid' : ''}
            />

            {errors.email ? (
              <small className="user-profile-form__error">
                {errors.email}
              </small>
            ) : null}
          </label>

          <label>
            <span>رقم الهاتف</span>
            <input
              type="text"
              name="phone"
              value={values.phone || ''}
              onChange={handleChange}
              placeholder="رقم الهاتف"
              className={errors.phone ? 'is-invalid' : ''}
            />

            {errors.phone ? (
              <small className="user-profile-form__error">
                {errors.phone}
              </small>
            ) : null}
          </label>

          <label>
            <span>المدينة</span>
            <input
              type="text"
              name="city"
              value={values.city || ''}
              onChange={handleChange}
              placeholder="المدينة"
              className={errors.city ? 'is-invalid' : ''}
            />

            {errors.city ? (
              <small className="user-profile-form__error">
                {errors.city}
              </small>
            ) : null}
          </label>
        </div>
      ) : (
        <div className="user-profile-info-list">
          <article>
            <FiUser />
            <div>
              <span>الاسم الكامل</span>
              <strong>{values.fullName || '—'}</strong>
            </div>
          </article>

          <article>
            <FiMail />
            <div>
              <span>البريد الإلكتروني</span>
              <strong>{values.email || '—'}</strong>
            </div>
          </article>

          <article>
            <FiPhone />
            <div>
              <span>رقم الهاتف</span>
              <strong>{values.phone || '—'}</strong>
            </div>
          </article>

          <article>
            <FiMapPin />
            <div>
              <span>المدينة</span>
              <strong>{values.city || '—'}</strong>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

export default ProfileInfoCard;