import {
  FiActivity,
  FiAlertTriangle,
  FiFileText,
  FiHeart,
  FiTool,
  FiTrendingUp,
} from 'react-icons/fi';

const ICONS = {
  file: FiFileText,
  tool: FiTool,
  alert: FiAlertTriangle,
  heart: FiHeart,
};

function isTextualValue(value) {
  if (typeof value !== 'string') return false;

  return !/^[0-9\s./%-]+$/.test(value.trim());
}

function AdminAnalyticsStatsCards({ cards = [] }) {
  return (
    <div className="admin-analytics-stats-grid">
      {cards.map((card) => {
        const Icon = ICONS[card.icon] || FiActivity;
        const isTextCard = isTextualValue(card.value);

        return (
          <article
            key={card.id}
            className={`admin-analytics-stat-card admin-analytics-stat-card--${card.tone} ${
              isTextCard ? 'admin-analytics-stat-card--text' : ''
            }`}
          >
            <div className="admin-analytics-stat-card__top">
              <div className="admin-analytics-stat-card__change">
                <span>{card.change}%</span>
                <FiTrendingUp />
              </div>

              <span className="admin-analytics-stat-card__icon">
                <Icon />
              </span>
            </div>

            <div className="admin-analytics-stat-card__bottom">
              <strong className="admin-analytics-stat-card__value">
                {card.value}
              </strong>

              <div className="admin-analytics-stat-card__meta">
                <h3>{card.label}</h3>
                <p>{card.subtitle}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default AdminAnalyticsStatsCards;