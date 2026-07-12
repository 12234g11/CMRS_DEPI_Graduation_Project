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

function CompanyProfileStatsCards({ stats = [], isLoading = false }) {
  return (
    <div className="company-profile-stats-grid" aria-busy={isLoading}>
      {stats.map((item) => (
        <article
          key={item.id}
          className={`company-profile-stat-card company-profile-stat-card--${item.tone}`}
        >
          <div className="company-profile-stat-card__icon" aria-hidden="true">
            {ICONS[item.id] || <FiFileText />}
          </div>

          <div className="company-profile-stat-card__content">
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
          </div>

          <strong className="company-profile-stat-card__value">
            {item.value ?? 0}
          </strong>
        </article>
      ))}
    </div>
  );
}

export default CompanyProfileStatsCards;
