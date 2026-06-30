function CompanyStatusDistributionChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <section className="company-analytics-card">
      <header className="company-analytics-card__header">
        <div>
          <h2>توزيع حالات البلاغات</h2>
          <p>Reports Status Distribution</p>
        </div>
      </header>

      <div className="company-analytics-status-list">
        {data.map((item) => {
          const percent = total ? Math.round((item.value / total) * 100) : 0;

          return (
            <article key={item.id} className="company-analytics-status-row">
              <div className="company-analytics-status-row__title">
                <span className={`is-${item.tone}`} />
                <strong>{item.label}</strong>
              </div>

              <div className="company-analytics-status-row__bar">
                <span
                  className={`is-${item.tone}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="company-analytics-status-row__value">
                <strong>{item.value}</strong>
                <span>{percent}%</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default CompanyStatusDistributionChart;