function buildLinePath(points) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

function buildAreaPath(points, height) {
  if (!points.length) return '';

  const linePath = buildLinePath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
}

function AnalyticsReportsLineChart({ data = [] }) {
  const width = 720;
  const height = 260;
  const padding = 28;

  const values = data.map((item) => item.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = Math.max(maxValue - minValue, 1);

  const points = data.map((item, index) => {
    const x =
      padding +
      (index * (width - padding * 2)) / Math.max(data.length - 1, 1);

    const y =
      height -
      padding -
      ((item.value - minValue) * (height - padding * 2)) / range;

    return {
      x,
      y,
      value: item.value,
      label: item.label,
    };
  });

  const linePath = buildLinePath(points);
  const areaPath = buildAreaPath(points, height - padding);

  return (
    <section className="admin-analytics-card admin-analytics-line-card">
      <header className="admin-analytics-card__header">
        <div>
          <h2>البلاغات عبر الزمن</h2>
          <p>Reports Over Time</p>
        </div>
      </header>

      <div className="admin-analytics-line-chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Reports over time chart"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="reportsAreaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#98d7ee" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#98d7ee" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((line) => {
            const y = padding + (line * (height - padding * 2)) / 3;

            return (
              <line
                key={line}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                className="admin-analytics-line-chart__grid"
              />
            );
          })}

          <path
            d={areaPath}
            className="admin-analytics-line-chart__area"
          />

          <path
            d={linePath}
            className="admin-analytics-line-chart__line"
          />

          {points.map((point, index) => (
            <circle
              key={`${point.label}-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              className="admin-analytics-line-chart__point"
            />
          ))}
        </svg>
      </div>
    </section>
  );
}

export default AnalyticsReportsLineChart;