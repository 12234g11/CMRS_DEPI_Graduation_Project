import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiTool,
} from 'react-icons/fi';
import DashboardStatCard from '../../../../shared/components/dashboard/DashboardStatCard';

const ICONS = {
  assigned: <FiFileText />,
  'in-progress': <FiTool />,
  'pending-review': <FiClock />,
  solved: <FiCheckCircle />,
};

function CompanyAnalyticsStatsCards({ cards = [] }) {
  return (
    <div className="dashboard-stats-grid company-analytics-stats-grid">
      {cards.map((card) => (
        <DashboardStatCard
          key={card.id}
          title={card.title}
          subtitle={card.subtitle}
          value={card.value}
          tone={card.tone}
          icon={ICONS[card.id] || <FiFileText />}
        />
      ))}
    </div>
  );
}

export default CompanyAnalyticsStatsCards;