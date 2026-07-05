import { useState } from 'react';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import UserDashboardFilterSelect from './UserDashboardFilterSelect';

function UserDashboardFilters({
  totalReports = 0,
  filteredCount = 0,
  searchTerm,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
  statusFilter,
  onStatusFilterChange,
  sourceOptions = [],
  statusOptions = [],
  onReset,
}) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const filtersContent = (
    <>
      <div className="user-dashboard-map-search">
        <FiSearch />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="إبحث برقم البلاغ أو نوع المشكلة أو المنطقة..."
          aria-label="البحث في البلاغات"
        />
      </div>

      <UserDashboardFilterSelect
        value={sourceFilter}
        options={sourceOptions}
        onChange={onSourceFilterChange}
        ariaLabel="فلترة البلاغات حسب المصدر"
      />

      <UserDashboardFilterSelect
        value={statusFilter}
        options={statusOptions}
        onChange={onStatusFilterChange}
        ariaLabel="فلترة البلاغات حسب الحالة"
      />
    </>
  );

  return (
    <section className="user-dashboard-map-toolbar-card">
      <div className="user-dashboard-map-toolbar-header">
        <div>
          <h2>فلترة البلاغات على الخريطة</h2>
          <p>
            يتم عرض {filteredCount} بلاغ من إجمالي {totalReports} بلاغ.
          </p>
        </div>

        <button
          type="button"
          className="user-dashboard-reset-btn"
          onClick={onReset}
        >
          <FiX />
          مسح الفلاتر
        </button>
      </div>

      <div className="user-dashboard-map-toolbar">{filtersContent}</div>

      <button
        type="button"
        className="user-dashboard-mobile-filter-btn"
        onClick={() => setIsMobileFiltersOpen(true)}
      >
        <FiFilter />
        فلترة البلاغات
      </button>

      {isMobileFiltersOpen ? (
        <div
          className="user-dashboard-filter-modal"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="user-dashboard-filter-modal__backdrop"
            onClick={() => setIsMobileFiltersOpen(false)}
            aria-label="إغلاق الفلاتر"
          />

          <div className="user-dashboard-filter-modal__panel">
            <div className="user-dashboard-filter-modal__header">
              <strong>فلترة البلاغات</strong>

              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                aria-label="إغلاق"
              >
                <FiX />
              </button>
            </div>

            <div className="user-dashboard-filter-modal__body">
              {filtersContent}
            </div>

            <button
              type="button"
              className="user-dashboard-filter-modal__apply"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default UserDashboardFilters;