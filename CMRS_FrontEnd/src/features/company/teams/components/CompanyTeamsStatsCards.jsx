import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiTool,
  FiUsers,
} from 'react-icons/fi';
import DashboardStatCard from '../../../../shared/components/dashboard/DashboardStatCard';

const ICONS = {
  total: <FiUsers />,
  active: <FiCheckCircle />,
  available: <FiClock />,
  tasks: <FiTool />,
  completed: <FiFileText />,
};

function CompanyTeamsStatsCards({ stats = [] }) {
  return (
    <div className="dashboard-stats-grid company-teams-stats-grid">
      {stats.map((item) => (
        <DashboardStatCard
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          value={item.value}
          tone={item.tone}
          icon={ICONS[item.id] || <FiUsers />}
        />
      ))}
    </div>
  );
}

export default CompanyTeamsStatsCards;