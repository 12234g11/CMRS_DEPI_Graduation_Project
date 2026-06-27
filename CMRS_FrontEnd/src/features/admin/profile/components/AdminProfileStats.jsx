import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiFileText,
} from 'react-icons/fi';

const statsConfig = [
  {
    key: 'managedReports',
    label: 'إجمالي البلاغات',
    subtitle: 'Total Reports',
    icon: FiFileText,
  },
  {
    key: 'pendingReports',
    label: 'قيد المتابعة',
    subtitle: 'In Progress',
    icon: FiClock,
  },
  {
    key: 'activeCompanies',
    label: 'الشركات النشطة',
    subtitle: 'Active Companies',
    icon: FiBriefcase,
  },
  {
    key: 'completedReports',
    label: 'البلاغات المكتملة',
    subtitle: 'Completed Reports',
    icon: FiCheckCircle,
  },
];

function AdminProfileStats({ scope }) {
  return (
    <div className="admin-profile-stats-grid">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.key} className="admin-profile-stat-card">
            <div>
              <h3>{stat.label}</h3>
              <p>{stat.subtitle}</p>
            </div>

            <strong>{scope?.[stat.key] ?? 0}</strong>

            <span>
              <Icon />
            </span>
          </article>
        );
      })}
    </div>
  );
}

export default AdminProfileStats;