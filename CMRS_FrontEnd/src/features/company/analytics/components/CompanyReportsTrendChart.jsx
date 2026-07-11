function getYAxisConfig(data = []) {
  const highestValue = Math.max(
    ...data.flatMap((item) => [
      Number(item.assigned || 0),
      Number(item.solved || 0),
    ]),
    1,
  );

  const roundedMaxValue = Math.ceil(highestValue);

  if (roundedMaxValue <= 5) {
    return {
      maxValue: roundedMaxValue,
      ticks: Array.from({ length: roundedMaxValue + 1 }, (_, index) =>
        roundedMaxValue - index,
      ),
    };
  }

  const step = Math.ceil(roundedMaxValue / 4);
  const maxValue = step * 4;

  return {
    maxValue,
    ticks: [maxValue, maxValue - step, maxValue - step * 2, step, 0],
  };
}

function getPointY(value, chartHeight, padding, maxValue) {
  const safeMaxValue = Math.max(Number(maxValue) || 0, 1);
  const safeValue = Number(value || 0);

  return (
    padding.top +
    (1 - safeValue / safeMaxValue) *
      (chartHeight - padding.top - padding.bottom)
  );
}

function getPolylinePoints(data, key, chartWidth, chartHeight, padding, maxValue) {
  return data
    .map((item, index) => {
      const x =
        padding.left +
        (index * (chartWidth - padding.left - padding.right)) /
          Math.max(data.length - 1, 1);

      const y = getPointY(item[key], chartHeight, padding, maxValue);

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

  const { maxValue, ticks } = getYAxisConfig(data);

  const assignedPoints = getPolylinePoints(
    data,
    'assigned',
    chartWidth,
    chartHeight,
    padding,
    maxValue,
  );

  const solvedPoints = getPolylinePoints(
    data,
    'solved',
    chartWidth,
    chartHeight,
    padding,
    maxValue,
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
          {ticks.map((tick) => {
            const y = getPointY(tick, chartHeight, padding, maxValue);

            return (
              <g key={tick}>
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
                  {tick}
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
