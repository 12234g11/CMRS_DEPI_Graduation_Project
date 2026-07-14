const SUPPORTED_TONES = new Set([
  'blue',
  'violet',
  'orange',
  'yellow',
  'green',
  'secondary',
  'dark',
  'black',
  'red',
]);

function getStatusTone(item = {}) {
  const tone = String(item.tone || '').trim().toLowerCase();

  if (SUPPORTED_TONES.has(tone)) {
    return tone;
  }

  const searchableValue = `${item.id || ''} ${item.label || ''}`.toLowerCase();

  if (
    searchableValue.includes('unable') ||
    searchableValue.includes('متعذر')
  ) {
    return 'secondary';
  }

  return 'blue';
}

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
          const value = Number(item.value || 0);
          const percent = total ? Math.round((value / total) * 100) : 0;
          const tone = getStatusTone(item);

          return (
            <article key={item.id} className="company-analytics-status-row">
              <div className="company-analytics-status-row__title">
                <span className={`is-${tone}`} />
                <strong>{item.label}</strong>
              </div>

              <div className="company-analytics-status-row__bar">
                <span
                  className={`is-${tone}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="company-analytics-status-row__value">
                <strong>{value}</strong>
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
