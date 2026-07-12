import {
  FiBriefcase,
  FiMapPin,
  FiUser,
} from 'react-icons/fi';

function CompanyProfileInfoCard({ profile }) {
  if (!profile) return null;

  const rows = [
    {
      icon: <FiBriefcase />,
      label: 'الاسم التجاري',
      value: profile.commercialName || 'غير متوفر',
    },
    {
      icon: <FiMapPin />,
      label: 'المحافظة',
      value: profile.governorate || 'غير متوفر',
    },
    {
      icon: <FiUser />,
      label: 'مسؤول التشغيل',
      value: profile.contactPerson?.name || 'غير متوفر',
    },
  ];

  return (
    <section className="company-profile-card">
      <header className="company-profile-card__header">
        <div>
          <h2>بيانات الشركة</h2>
          <p>Company Information</p>
        </div>
      </header>

      <div className="company-profile-details-list">
        {rows.map((row) => (
          <div key={row.label} className="company-profile-detail-row">
            <span className="company-profile-detail-row__label">
              {row.icon}
              {row.label}
            </span>

            <strong className="company-profile-detail-row__value">
              {row.isLtr ? <bdi dir="ltr">{row.value}</bdi> : row.value}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CompanyProfileInfoCard;