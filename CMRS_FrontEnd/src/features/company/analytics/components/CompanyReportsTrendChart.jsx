function getPolylinePoints(data, key, chartWidth, chartHeight, padding) {
  const values = data.map((item) => Number(item[key] || 0));
  const maxValue = Math.max(...values, 1);

  return data
    .map((item, index) => {
      const x =
        padding.left +
        (index * (chartWidth - padding.left - padding.right)) /
          Math.max(data.length - 1, 1);

      const y =
        padding.top +
        (1 - Number(item[key] || 0) / maxValue) *
          (chartHeight - padding.top - padding.bottom);

      return `${x},${y}`;
    })
    .join(' ');
}

function CompanyReportsTrendChart({ data = [] }) {
  const chartWidth = 720;
  const chartHeight = 300;
  const padding = {
    top: 28,
    right: 24,
    bottom: 54,
    left: 38,
  };

  const assignedPoints = getPolylinePoints(
    data,
    'assigned',
    chartWidth,
    chartHeight,
    padding,
  );

  const solvedPoints = getPolylinePoints(
    data,
    'solved',
    chartWidth,
    chartHeight,
    padding,
  );

  const maxValue = Math.max(
    ...data.flatMap((item) => [item.assigned, item.solved]),
    1,
  );

  return (
    <section className="company-analytics-card">
      <header className="company-analytics-card__header">
        <div>
          <h2>تطور البلاغات</h2>
          <p>Assigned vs Solved Reports</p>
        </div>

        <div className="company-analytics-chart-legend">
          <span>
            <i className="is-assigned" />
            المسندة
          </span>

          <span>
            <i className="is-solved" />
            المحلولة
          </span>
        </div>
      </header>

      <div className="company-analytics-line-chart">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="تطور البلاغات المسندة والمحلولة"
        >
          {[0, 1, 2, 3].map((line) => {
            const y =
              padding.top +
              (line * (chartHeight - padding.top - padding.bottom)) / 3;

            return (
              <g key={line}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  className="company-analytics-grid-line"
                />

                <text
                  x={padding.left - 10}
                  y={y + 4}
                  className="company-analytics-axis-text"
                  textAnchor="end"
                >
                  {Math.round(maxValue - (line * maxValue) / 3)}
                </text>
              </g>
            );
          })}

          <polyline
            points={assignedPoints}
            className="company-analytics-line company-analytics-line--assigned"
          />

          <polyline
            points={solvedPoints}
            className="company-analytics-line company-analytics-line--solved"
          />

          {data.map((item, index) => {
            const x =
              padding.left +
              (index * (chartWidth - padding.left - padding.right)) /
                Math.max(data.length - 1, 1);

            return (
              <text
                key={item.month}
                x={x}
                y={chartHeight - 18}
                className="company-analytics-axis-text"
                textAnchor="middle"
              >
                {item.month}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

export default CompanyReportsTrendChart;