import {
  FiBell,
  FiClock,
  FiFileText,
  FiMessageSquare,
} from 'react-icons/fi';
import DashboardStatCard from '../../../../shared/components/dashboard/DashboardStatCard';

const STAT_ICONS = {
  total: <FiBell />,
  unread: <FiClock />,
  admin: <FiMessageSquare />,
  assigned: <FiFileText />,
};

function CompanyNotificationsStatsCards({ stats = [] }) {
  return (
    <div className="dashboard-stats-grid company-notifications-stats-grid">
      {stats.map((item) => (
        <DashboardStatCard
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          value={item.value}
          tone={item.tone}
          icon={STAT_ICONS[item.id] || <FiBell />}
        />
      ))}
    </div>
  );
}

export default CompanyNotificationsStatsCards;