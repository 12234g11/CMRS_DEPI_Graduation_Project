function buildConicGradient(data) {
  let current = 0;

  const segments = data.map((item) => {
    const start = current;
    const end = current + item.value;

    current = end;

    return `${item.color} ${start}% ${end}%`;
  });

  return `conic-gradient(${segments.join(', ')})`;
}

function AnalyticsReportTypesChart({ data = [] }) {
  const pieStyle = {
    background: buildConicGradient(data),
  };

  return (
    <section className="admin-analytics-card admin-analytics-pie-card">
      <header className="admin-analytics-card__header">
        <div>
          <h2>أنواع البلاغات</h2>
          <p>Report Types</p>
        </div>
      </header>

      <div className="admin-analytics-pie-layout">
        <ul className="admin-analytics-pie-legend">
          {data.map((item) => (
            <li key={item.id}>
              <span
                className="admin-analytics-pie-legend__dot"
                style={{ backgroundColor: item.color }}
              />
              <strong>%{item.value}</strong>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="admin-analytics-pie" style={pieStyle}>
          <span />
        </div>
      </div>
    </section>
  );
}

export default AnalyticsReportTypesChart;