import { FiCheck, FiSearch, FiSliders, FiX } from 'react-icons/fi';
import CompanyNotificationsFilterSelect from './CompanyNotificationsFilterSelect';

function CompanyNotificationsFilterCard({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filterOptions,
  filteredCount,
  totalCount,
  activeFiltersCount,
  onOpenFilters,
  onResetFilters,
  onMarkAllRead,
}) {
  return (
    <section className="company-notifications-filter-card">
      <div className="company-notifications-filter-card__header">
        <div>
          <h2>فلترة الإشعارات</h2>
          <p>
            يتم عرض {filteredCount} إشعار من إجمالي {totalCount} إشعار.
          </p>
        </div>

        <div className="company-notifications-filter-card__actions">
          <button
            type="button"
            className="company-notifications-mark-all-btn"
            onClick={onMarkAllRead}
          >
            <FiCheck />
            تعليم الكل كمقروء
          </button>

          <button
            type="button"
            className="company-notifications-reset-btn"
            onClick={onResetFilters}
          >
            <FiX />
            مسح الفلاتر
          </button>
        </div>
      </div>

      <div className="company-notifications-filter-card__body">
        <div className="company-notifications-toolbar company-notifications-toolbar--desktop">
          <div className="company-notifications-search">
            <FiSearch />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث باسم البلاغ أو نوع الإشعار..."
              aria-label="البحث في إشعارات الشركة"
            />
          </div>

          <CompanyNotificationsFilterSelect
            value={activeFilter}
            options={filterOptions}
            onChange={onFilterChange}
            ariaLabel="فلترة الإشعارات"
          />
        </div>

        <div className="company-notifications-filter-card__mobile-actions">
          <button
            type="button"
            className="company-notifications-open-filters-btn"
            onClick={onOpenFilters}
          >
            <FiSliders />
            الفلاتر
            {activeFiltersCount ? <span>{activeFiltersCount}</span> : null}
          </button>

          <button
            type="button"
            className="company-notifications-mark-all-btn"
            onClick={onMarkAllRead}
          >
            <FiCheck />
            تعليم الكل كمقروء
          </button>
        </div>
      </div>
    </section>
  );
}

export default CompanyNotificationsFilterCard;