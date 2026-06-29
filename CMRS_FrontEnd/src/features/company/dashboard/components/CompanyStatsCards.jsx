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
  completed: <FiCheckCircle />,
};

function CompanyStatsCards({ stats = [] }) {
  return (
    <div className="dashboard-stats-grid company-dashboard__stats-grid">
      {stats.map((item) => (
        <DashboardStatCard
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          value={item.value}
          tone={item.tone}
          icon={ICONS[item.id] || <FiFileText />}
        />
      ))}
    </div>
  );
}

export default CompanyStatsCards;