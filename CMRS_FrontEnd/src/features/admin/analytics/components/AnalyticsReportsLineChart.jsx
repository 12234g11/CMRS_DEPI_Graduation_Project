function buildLinePath(points) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

function buildAreaPath(points, baselineY) {
  if (!points.length) return '';

  const linePath = buildLinePath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;
}

function normalizeChartData(data) {
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => ({
    label: item?.label || `${index + 1}`,
    value: Number.isFinite(Number(item?.value)) ? Number(item.value) : 0,
  }));
}

function getNiceMax(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(numericValue));
  const normalizedValue = numericValue / magnitude;

  if (normalizedValue <= 1) return 1 * magnitude;
  if (normalizedValue <= 2) return 2 * magnitude;
  if (normalizedValue <= 5) return 5 * magnitude;

  return 10 * magnitude;
}

function getVisibleChartData(chartData) {
  if (!chartData.length) {
    return {
      data: [],
      hiddenLeadingDays: 0,
    };
  }

  const firstActiveIndex = chartData.findIndex((item) => item.value > 0);

  if (firstActiveIndex <= 0) {
    return {
      data: chartData,
      hiddenLeadingDays: 0,
    };
  }

  const startIndex = Math.max(firstActiveIndex - 2, 0);

  return {
    data: chartData.slice(startIndex),
    hiddenLeadingDays: startIndex,
  };
}

function getXAxisTickIndexes(itemsCount) {
  if (itemsCount <= 1) return [0];
  if (itemsCount <= 6) return Array.from({ length: itemsCount }, (_, index) => index);

  const lastIndex = itemsCount - 1;
  const tickCount = 6;
  const step = lastIndex / (tickCount - 1);
  const indexes = new Set();

  for (let index = 0; index < tickCount; index += 1) {
    indexes.add(Math.round(index * step));
  }

  indexes.add(0);
  indexes.add(lastIndex);

  return Array.from(indexes).sort((a, b) => a - b);
}

function AnalyticsReportsLineChart({ data = [] }) {
  const chartData = normalizeChartData(data);
  const { data: visibleChartData, hiddenLeadingDays } = getVisibleChartData(chartData);

  const width = 760;
  const height = 300;
  const paddingTop = 24;
  const paddingRight = 22;
  const paddingBottom = 54;
  const paddingLeft = 52;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const baselineY = height - paddingBottom;

  const values = visibleChartData.map((item) => item.value);
  const maxValue = Math.max(...values, 0);
  const yAxisMax = getNiceMax(maxValue);
  const xAxisTickIndexes = getXAxisTickIndexes(visibleChartData.length);

  const getX = (index) =>
    paddingLeft + (index * chartWidth) / Math.max(visibleChartData.length - 1, 1);

  const getY = (value) => baselineY - (value * chartHeight) / yAxisMax;

  const points = visibleChartData.map((item, index) => ({
    x: getX(index),
    y: getY(item.value),
    value: item.value,
    label: item.label,
  }));

  const linePath = buildLinePath(points);
  const areaPath = buildAreaPath(points, baselineY);
  const yAxisTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = Math.round(yAxisMax * ratio);

    return {
      value,
      y: getY(value),
    };
  });

  return (
    <section className="admin-analytics-card admin-analytics-line-card">
      <header className="admin-analytics-card__header admin-analytics-card__header--with-note">
        <div>
          <h2>البلاغات عبر الزمن</h2>
          <p>Reports Over Time</p>
        </div>
      </header>

      {visibleChartData.length ? (
        <div className="admin-analytics-line-chart">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Reports over time chart"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="reportsAreaGradient"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#98d7ee" stopOpacity="0.58" />
                <stop offset="100%" stopColor="#98d7ee" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {yAxisTicks.map((tick) => (
              <g key={tick.value}>
                <line
                  x1={paddingLeft}
                  x2={width - paddingRight}
                  y1={tick.y}
                  y2={tick.y}
                  className="admin-analytics-line-chart__grid"
                />
                <text
                  x={paddingLeft - 12}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="admin-analytics-line-chart__y-label"
                >
                  {tick.value}
                </text>
              </g>
            ))}

            <line
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={baselineY}
              y2={baselineY}
              className="admin-analytics-line-chart__axis"
            />

            {xAxisTickIndexes.map((index) => {
              const point = points[index];

              if (!point) return null;

              return (
                <g key={`${point.label}-${index}`}>
                  <line
                    x1={point.x}
                    x2={point.x}
                    y1={baselineY}
                    y2={baselineY + 5}
                    className="admin-analytics-line-chart__axis-tick"
                  />
                  <text
                    x={point.x}
                    y={baselineY + 24}
                    textAnchor="middle"
                    className="admin-analytics-line-chart__x-label"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}

            <path d={areaPath} className="admin-analytics-line-chart__area" />

            <path d={linePath} className="admin-analytics-line-chart__line" />

            {points.map((point, index) => (
              <g key={`${point.label}-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  className="admin-analytics-line-chart__point"
                >
                  <title>{`${point.label}: ${point.value} بلاغ`}</title>
                </circle>

                {point.value > 0 ? (
                  <text
                    x={point.x}
                    y={Math.max(point.y - 12, paddingTop + 10)}
                    textAnchor="middle"
                    className="admin-analytics-line-chart__value-label"
                  >
                    {point.value}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>
        </div>
      ) : (
        <div className="admin-analytics-empty-state">
          لا توجد بيانات كافية لعرض البلاغات عبر الزمن.
        </div>
      )}
    </section>
  );
}

export default AnalyticsReportsLineChart;
