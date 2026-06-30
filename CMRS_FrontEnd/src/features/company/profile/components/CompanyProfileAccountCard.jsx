import {
  FiClock,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
} from 'react-icons/fi';

function CompanyProfileAccountCard({ profile }) {
  if (!profile) return null;

  const rows = [
    {
      icon: <FiUser />,
      label: 'مسؤول الحساب',
      value: profile.contactPerson.name,
    },
    {
      icon: <FiMail />,
      label: 'بريد مسؤول التشغيل',
      value: profile.contactPerson.email,
      isLtr: true,
    },
    {
      icon: <FiPhone />,
      label: 'رقم مسؤول التشغيل',
      value: profile.contactPerson.phone,
      isLtr: true,
    },
    {
      icon: <FiPhone />,
      label: 'رقم الطوارئ',
      value: profile.officialContact.emergencyPhone,
      isLtr: true,
    },
    {
      icon: <FiShield />,
      label: 'حالة حساب الدخول',
      value: profile.accountStatusLabel,
    },
    {
      icon: <FiClock />,
      label: 'آخر تسجيل دخول',
      value: profile.lastLogin,
      isLtr: true,
    },
  ];

  return (
    <section className="company-profile-card">
      <header className="company-profile-card__header">
        <div>
          <h2>الحساب والتواصل</h2>
          <p>Account & Contact</p>
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

export default CompanyProfileAccountCard;