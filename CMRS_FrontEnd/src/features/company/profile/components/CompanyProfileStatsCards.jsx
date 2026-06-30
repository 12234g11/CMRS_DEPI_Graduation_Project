import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiTool,
} from 'react-icons/fi';

const ICONS = {
  assigned: <FiFileText />,
  active: <FiTool />,
  pending: <FiClock />,
  solved: <FiCheckCircle />,
};

function CompanyProfileStatsCards({ stats = [] }) {
  return (
    <div className="company-profile-stats-grid">
      {stats.map((item) => (
        <article
          key={item.id}
          className={`company-profile-stat-card company-profile-stat-card--${item.tone}`}
        >
          <div className="company-profile-stat-card__icon">
            {ICONS[item.id] || <FiFileText />}
          </div>

          <div className="company-profile-stat-card__content">
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
            <strong>{item.value}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}

export default CompanyProfileStatsCards;