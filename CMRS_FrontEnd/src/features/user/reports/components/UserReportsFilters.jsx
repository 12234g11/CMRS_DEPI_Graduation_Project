import { useState } from 'react';
import {
  FiFilter,
  FiRefreshCcw,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import UserReportsFilterSelect from './UserReportsFilterSelect';

function UserReportsFilters({
  totalReports = 0,
  filteredCount = 0,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusOptions = [],
  onReset,
  isSearching = false,
}) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  function renderFiltersContent() {
    return (
      <>
        <div className="user-reports-filter-search">
          {isSearching ? (
            <FiRefreshCcw className="user-reports-filter-search__spinner" />
          ) : (
            <FiSearch />
          )}

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="ابحث بعنوان البلاغ أو الوصف أو نوع المشكلة أو المدينة أو العنوان..."
            aria-label="البحث في البلاغات"
          />
        </div>

        <UserReportsFilterSelect
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusFilterChange}
          ariaLabel="فلترة البلاغات حسب الحالة"
        />
      </>
    );
  }

  return (
    <section className="user-reports-filter-card">
      <div className="user-reports-filter-card__header">
        <div>
          <h2>فلترة البلاغات</h2>
          <p>
            يتم عرض {filteredCount} بلاغ من إجمالي {totalReports} بلاغ.
          </p>
        </div>

        <button
          type="button"
          className="user-reports-filter-card__reset"
          onClick={onReset}
        >
          <FiX />
          مسح الفلاتر
        </button>
      </div>

      <div className="user-reports-filter-card__toolbar">
        {renderFiltersContent()}
      </div>

      <button
        type="button"
        className="user-reports-filter-card__mobile-btn"
        onClick={() => setIsMobileFiltersOpen(true)}
      >
        <FiFilter />
        فلترة البلاغات
      </button>

      {isMobileFiltersOpen ? (
        <div
          className="user-reports-filter-modal"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="user-reports-filter-modal__backdrop"
            onClick={() => setIsMobileFiltersOpen(false)}
            aria-label="إغلاق الفلاتر"
          />

          <div className="user-reports-filter-modal__panel">
            <div className="user-reports-filter-modal__header">
              <strong>فلترة البلاغات</strong>

              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                aria-label="إغلاق"
              >
                <FiX />
              </button>
            </div>

            <div className="user-reports-filter-modal__body">
              {renderFiltersContent()}
            </div>

            <button
              type="button"
              className="user-reports-filter-modal__apply"
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

export default UserReportsFilters;