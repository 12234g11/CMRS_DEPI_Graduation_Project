import { useState } from 'react';
import { FiFilter, FiRefreshCcw, FiSearch, FiX } from 'react-icons/fi';
import AdminReportFilterSelect from './AdminReportFilterSelect';

function ReportsFilterControls({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  issueCategoryFilter,
  onIssueCategoryChange,
  companyReviewStatusFilter,
  onCompanyReviewStatusChange,
  sortFilter,
  onSortChange,
  statusOptions = [],
  priorityOptions = [],
  issueCategoryOptions = [],
  companyReviewStatusOptions = [],
  sortOptions = [],
}) {
  return (
    <div className="admin-reports-filter-controls">
      <AdminReportFilterSelect
        value={statusFilter}
        options={statusOptions}
        onChange={onStatusChange}
        ariaLabel="فلترة البلاغات حسب الحالة"
      />

      <AdminReportFilterSelect
        value={priorityFilter}
        options={priorityOptions}
        onChange={onPriorityChange}
        ariaLabel="فلترة البلاغات حسب الأولوية"
      />

      <AdminReportFilterSelect
        value={issueCategoryFilter}
        options={issueCategoryOptions}
        onChange={onIssueCategoryChange}
        ariaLabel="فلترة البلاغات حسب التصنيف"
      />

      {companyReviewStatusOptions.length ? (
        <AdminReportFilterSelect
          value={companyReviewStatusFilter}
          options={companyReviewStatusOptions}
          onChange={onCompanyReviewStatusChange}
          ariaLabel="فلترة حسب مراجعة رد الشركة"
        />
      ) : null}

      <AdminReportFilterSelect
        value={sortFilter}
        options={sortOptions}
        onChange={onSortChange}
        ariaLabel="ترتيب البلاغات"
      />
    </div>
  );
}

function AdminReportsToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  issueCategoryFilter,
  onIssueCategoryChange,
  companyReviewStatusFilter,
  onCompanyReviewStatusChange,
  sortFilter,
  onSortChange,
  statusOptions = [],
  priorityOptions = [],
  issueCategoryOptions = [],
  companyReviewStatusOptions = [],
  sortOptions = [],
  totalCount = 0,
  activeFiltersCount = 0,
  onClearFilters,
  title = 'فلترة البلاغات',
  mobileTitle = 'فلاتر البلاغات',
  mobileDescription = 'اختار الفلاتر المناسبة ثم ارجع للجدول.',
  searchPlaceholder = 'ابحث في العنوان أو الوصف أو الشركة...',
  ariaLabel = 'فلاتر البلاغات',
}) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  function closeMobileFilters() {
    setIsMobileFiltersOpen(false);
  }

  function handleClearFilters() {
    onClearFilters?.();
    closeMobileFilters();
  }

  const controlsProps = {
    statusFilter,
    onStatusChange,
    priorityFilter,
    onPriorityChange,
    issueCategoryFilter,
    onIssueCategoryChange,
    companyReviewStatusFilter,
    onCompanyReviewStatusChange,
    sortFilter,
    onSortChange,
    statusOptions,
    priorityOptions,
    issueCategoryOptions,
    companyReviewStatusOptions,
    sortOptions,
  };

  return (
    <section className="admin-reports-filter-box" aria-label={ariaLabel}>
      <div className="admin-reports-filter-box__header">
        <div>
          <h2>{title}</h2>
          <p>
            يتم عرض {totalCount} بلاغ طبقاً للفلاتر الحالية
            {activeFiltersCount ? `، مع تطبيق ${activeFiltersCount} فلتر.` : '.'}
          </p>
        </div>

        <button
          type="button"
          className="admin-reports-clear-filters-btn"
          onClick={handleClearFilters}
          disabled={!activeFiltersCount}
        >
          <FiRefreshCcw />
          مسح الفلاتر
        </button>
      </div>

      <div className="admin-reports-filter-box__body">
        <div className="admin-reports-search admin-manage-reports-search">
          <FiSearch />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="البحث في البلاغات"
          />
        </div>

        <div className="admin-reports-filter-box__desktop-controls">
          <ReportsFilterControls {...controlsProps} />
        </div>

        <button
          type="button"
          className="admin-reports-mobile-filter-btn"
          onClick={() => setIsMobileFiltersOpen(true)}
        >
          <FiFilter />
          فلاتر
          {activeFiltersCount ? <span>{activeFiltersCount}</span> : null}
        </button>
      </div>

      {isMobileFiltersOpen ? (
        <div className="admin-reports-mobile-filters" role="presentation">
          <button
            type="button"
            className="admin-reports-mobile-filters__backdrop"
            onClick={closeMobileFilters}
            aria-label="إغلاق الفلاتر"
          />

          <div
            className="admin-reports-mobile-filters__sheet"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
          >
            <header className="admin-reports-mobile-filters__header">
              <div>
                <h3>{mobileTitle}</h3>
                <p>{mobileDescription}</p>
              </div>

              <button type="button" onClick={closeMobileFilters} aria-label="إغلاق">
                <FiX />
              </button>
            </header>

            <ReportsFilterControls {...controlsProps} />

            <footer className="admin-reports-mobile-filters__actions">
              <button type="button" onClick={handleClearFilters}>
                مسح الفلاتر
              </button>

              <button type="button" onClick={closeMobileFilters}>
                تطبيق الفلاتر
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminReportsToolbar;
