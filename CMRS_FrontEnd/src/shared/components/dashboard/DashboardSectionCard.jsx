function DashboardSectionCard({
  title,
  subtitle,
  action = null,
  className = '',
  children,
}) {
  return (
    <section className={`dashboard-section-card ${className}`.trim()}>
      <header className="dashboard-section-card__header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {action && <div className="dashboard-section-card__action">{action}</div>}
      </header>

      <div className="dashboard-section-card__body">{children}</div>
    </section>
  );
}

export default DashboardSectionCard;