const DEFAULT_ITEMS = [
  { key: 'solved', label: 'تم الحل', tone: 'success' },
  { key: 'in-progress', label: 'جاري الحل', tone: 'info' },
  { key: 'under-review', label: 'قيد المراجعة', tone: 'warning' },
];

function MapLegend({ items = DEFAULT_ITEMS, compact = false, className = '' }) {
  return (
    <div className={`map-legend ${compact ? 'is-compact' : ''} ${className}`.trim()}>
      {items.map((item) => (
        <span key={item.key} className="map-legend__item">
          <span className={`map-legend__dot map-legend__dot--${item.tone}`} />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}

export default MapLegend;