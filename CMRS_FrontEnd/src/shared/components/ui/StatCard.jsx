function StatCard({ title, subtitle, value, icon, tone = 'primary' }) {
  return (
    <article className={`dashboard-stat-card dashboard-stat-card--${tone}`}>
      <div className="dashboard-stat-card__content">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
        <strong>{value}</strong>
      </div>

      <div className="dashboard-stat-card__icon">{icon}</div>
    </article>
  );
}

export default StatCard;