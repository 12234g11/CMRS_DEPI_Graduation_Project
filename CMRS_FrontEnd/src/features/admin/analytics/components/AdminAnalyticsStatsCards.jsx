import {
  FiActivity,
  FiAlertTriangle,
  FiFileText,
  FiHeart,
  FiTool,
  FiTrendingDown,
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

function formatChange(change) {
  const numericChange = Number(change);

  if (!Number.isFinite(numericChange)) return 0;

  return numericChange;
}

function AdminAnalyticsStatsCards({ cards = [] }) {
  if (!cards.length) {
    return (
      <div className="admin-analytics-stats-grid">
        {[1, 2, 3, 4].map((item) => (
          <article
            key={item}
            className="admin-analytics-stat-card admin-analytics-stat-card--placeholder"
          >
            <span />
            <span />
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-analytics-stats-grid">
      {cards.map((card) => {
        const Icon = ICONS[card.icon] || FiActivity;
        const isTextCard = isTextualValue(card.value);
        const change = formatChange(card.change);
        const TrendIcon = change < 0 ? FiTrendingDown : FiTrendingUp;

        return (
          <article
            key={card.id}
            className={`admin-analytics-stat-card admin-analytics-stat-card--${card.tone} ${
              isTextCard ? 'admin-analytics-stat-card--text' : ''
            }`}
          >
            <div className="admin-analytics-stat-card__top">
              <div
                className={`admin-analytics-stat-card__change ${
                  change < 0 ? 'admin-analytics-stat-card__change--down' : ''
                }`}
              >
                <span>{change}%</span>
                <TrendIcon />
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
