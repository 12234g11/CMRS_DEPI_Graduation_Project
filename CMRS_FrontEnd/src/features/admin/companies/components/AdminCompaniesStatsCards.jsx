import { FiCheckCircle, FiClipboard, FiTrendingUp, FiUsers } from 'react-icons/fi';

function AdminCompaniesStatsCards({ companies = [] }) {
  const totalCompanies = companies.length;

  const activeCompanies = companies.filter(
    (company) => company.status === 'active',
  ).length;

  const activeTasks = companies.reduce(
    (total, company) => total + Number(company.activeTasks || 0),
    0,
  );

  const completedTasks = companies.reduce(
    (total, company) => total + Number(company.completedTasks || 0),
    0,
  );

  const stats = [
    {
      label: 'إجمالي الشركات',
      subtitle: 'Total Companies',
      value: totalCompanies,
      icon: <FiUsers />,
    },
    {
      label: 'الشركات النشطة',
      subtitle: 'Active Companies',
      value: activeCompanies,
      icon: <FiCheckCircle />,
    },
    {
      label: 'المهام النشطة',
      subtitle: 'Active Tasks',
      value: activeTasks,
      icon: <FiClipboard />,
    },
    {
      label: 'المهام المكتملة',
      subtitle: 'Completed Tasks',
      value: completedTasks,
      icon: <FiTrendingUp />,
    },
  ];

  return (
    <div className="admin-companies-stats-grid">
      {stats.map((stat) => (
        <article key={stat.label} className="admin-companies-stat-card">
          <div className="admin-companies-stat-card__title">
            <p>{stat.label}</p>
            <small>{stat.subtitle}</small>
          </div>

          <strong className="admin-companies-stat-card__value">
            {stat.value}
          </strong>

          <span className="admin-companies-stat-card__icon">
            {stat.icon}
          </span>
        </article>
      ))}
    </div>
  );
}

export default AdminCompaniesStatsCards;