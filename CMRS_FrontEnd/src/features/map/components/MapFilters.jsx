function MapFilters({ options = [], value = 'all', onChange }) {
  if (!options.length) return null;

  return (
    <div className="map-filters" role="tablist" aria-label="فلترة البلاغات على الخريطة">
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={`map-filters__chip ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default MapFilters;
