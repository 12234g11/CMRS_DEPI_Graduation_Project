import {
  FiCheckCircle,
  FiMail,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi';

function CompanyProfileHeader({ profile }) {
  if (!profile) return null;

  return (
    <section className="company-profile-header-card">
      <div className="company-profile-header-card__avatar">
        {profile.companyName?.slice(0, 1) || 'ش'}
      </div>

      <div className="company-profile-header-card__content">
        <div className="company-profile-header-card__title-row">
          <div className="company-profile-header-card__identity">
            <span className="company-profile-header-card__eyebrow">
              {profile.accountType || 'حساب شركة'}
            </span>

            <h1>{profile.companyName || 'شركة'}</h1>

            <p>{profile.commercialName || 'غير متوفر'}</p>
          </div>

          <span className="company-profile-status">
            <FiCheckCircle />
            {profile.statusLabel || 'غير متوفر'}
          </span>
        </div>

        <div className="company-profile-header-card__meta">
          <span>
            <FiMail />
            <bdi dir="ltr">{profile.loginEmail || 'غير متوفر'}</bdi>
          </span>

          <span>
            <FiPhone />
            <bdi dir="ltr">{profile.officialContact?.phone || 'غير متوفر'}</bdi>
          </span>

          <span>
            <FiMapPin />
            {profile.governorate || 'غير متوفر'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default CompanyProfileHeader;