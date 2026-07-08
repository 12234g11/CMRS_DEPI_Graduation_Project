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

function normalizeChartData(data) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => ({
      id: item?.id,
      label: item?.label,
      value: Number.isFinite(Number(item?.value)) ? Number(item.value) : 0,
      color: item?.color,
    }))
    .filter((item) => item.id && item.label && item.value > 0 && item.color);
}

function AnalyticsReportTypesChart({ data = [] }) {
  const chartData = normalizeChartData(data);
  const hasData = chartData.length > 0;
  const pieStyle = hasData
    ? {
        background: buildConicGradient(chartData),
      }
    : undefined;

  return (
    <section className="admin-analytics-card admin-analytics-pie-card">
      <header className="admin-analytics-card__header">
        <div>
          <h2>أنواع البلاغات</h2>
          <p>Report Types</p>
        </div>
      </header>

      {hasData ? (
        <div className="admin-analytics-pie-layout">
          <ul className="admin-analytics-pie-legend">
            {chartData.map((item) => (
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
      ) : (
        <div className="admin-analytics-empty-state">
          لا توجد بيانات لأنواع البلاغات حاليًا.
        </div>
      )}
    </section>
  );
}

export default AnalyticsReportTypesChart;
