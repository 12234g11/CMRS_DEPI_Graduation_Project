function DashboardStatCard({ title, subtitle, value, icon, tone = 'primary' }) {
  return (
    <article className={`dashboard-stat-card dashboard-stat-card--${tone}`}>
      <div className="dashboard-stat-card__content">
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <strong>{value}</strong>
      </div>

      <div className="dashboard-stat-card__icon">{icon}</div>
    </article>
  );
}

export default DashboardStatCard;