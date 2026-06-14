import { FiCheckCircle, FiClock, FiFileText, FiTool } from 'react-icons/fi';
import DashboardStatCard from '../../../../shared/components/dashboard/DashboardStatCard';

const ICONS = {
  total: <FiFileText />,
  pending: <FiClock />,
  'in-progress': <FiTool />,
  solved: <FiCheckCircle />,
};

function UserDashboardStats({ stats = [] }) {
  return (
    <div className="dashboard-stats-grid">
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

export default UserDashboardStats;