import { FiCheck } from 'react-icons/fi';
import CompanyNotificationsFilterSelect from './CompanyNotificationsFilterSelect';

function CompanyNotificationsFilterCard({
  activeReadFilter,
  onReadFilterChange,
  activeTypeFilter,
  onTypeFilterChange,
  filterOptions,
  totalCount,
  unreadCount,
  onMarkAllRead,
}) {
  return (
    <section className="company-notifications-toolbar-card">
      <button
        type="button"
        className="company-notifications-mark-all-btn"
        onClick={onMarkAllRead}
        disabled={unreadCount === 0}
      >
        <FiCheck />
        تحديد الكل كمقروء
      </button>

      <div className="company-notifications-type-filter">
        <CompanyNotificationsFilterSelect
          value={activeTypeFilter}
          options={filterOptions}
          onChange={onTypeFilterChange}
          ariaLabel="فلترة إشعارات الشركة حسب النوع"
        />
      </div>

      <div className="company-notifications-summary-tabs">
        <button
          type="button"
          className={`company-notifications-summary-tab ${
            activeReadFilter === 'all' ? 'is-active' : ''
          }`}
          onClick={() => onReadFilterChange('all')}
        >
          <span className="company-notifications-summary-tab__count">
            {totalCount}
          </span>
          <span>كل الإشعارات</span>
        </button>

        <button
          type="button"
          className={`company-notifications-summary-tab ${
            activeReadFilter === 'unread' ? 'is-active' : ''
          }`}
          onClick={() => onReadFilterChange('unread')}
        >
          <span className="company-notifications-summary-tab__count">
            {unreadCount}
          </span>
          <span>غير مقروءة</span>
        </button>
      </div>
    </section>
  );
}

export default CompanyNotificationsFilterCard;
