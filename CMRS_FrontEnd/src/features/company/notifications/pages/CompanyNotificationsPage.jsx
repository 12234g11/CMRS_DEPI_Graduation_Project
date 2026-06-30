import { useEffect, useMemo, useState } from 'react';
import {
  FiFilter,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import {
  deleteCompanyNotification,
  getCompanyNotificationsData,
  markAllCompanyNotificationsAsRead,
  toggleCompanyNotificationRead,
} from '../api/companyNotificationsApi';
import CompanyNotificationsFilterCard from '../components/CompanyNotificationsFilterCard';
import CompanyNotificationsFilterSelect from '../components/CompanyNotificationsFilterSelect';
import CompanyNotificationsList from '../components/CompanyNotificationsList';
import CompanyNotificationsStatsCards from '../components/CompanyNotificationsStatsCards';
import {
  companyNotificationFilterOptions,
  companyNotifications,
  getCompanyNotificationsStats,
} from '../mocks/companyNotificationsMockData';
import '../company-notifications.css';

function CompanyNotificationsPage() {
  const [notifications, setNotifications] = useState(companyNotifications);
  const [stats, setStats] = useState(
    getCompanyNotificationsStats(companyNotifications),
  );

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCompanyNotificationsData().then((data) => {
      if (!isMounted) return;

      setNotifications(data.notifications);
      setStats(data.stats);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (searchTerm.trim()) count += 1;
    if (activeFilter !== 'all') count += 1;

    return count;
  }, [activeFilter, searchTerm]);

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'unread' && !notification.isRead) ||
        notification.type === activeFilter;

      const matchesSearch = normalizedSearch
        ? [
            notification.title,
            notification.message,
            notification.reportId,
            notification.reportTitle,
            notification.location,
            notification.typeLabel,
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, notifications, searchTerm]);

  function syncNotificationsData(data) {
    setNotifications(data.notifications);
    setStats(data.stats);
  }

  async function handleToggleRead(notificationId) {
    const data = await toggleCompanyNotificationRead(notificationId);
    syncNotificationsData(data);
  }

  async function handleMarkAllRead() {
    const data = await markAllCompanyNotificationsAsRead();
    syncNotificationsData(data);
  }

  async function handleDeleteNotification(notificationId) {
    const data = await deleteCompanyNotification(notificationId);
    syncNotificationsData(data);
  }

  function handleResetFilters() {
    setSearchTerm('');
    setActiveFilter('all');
  }

  function handleApplyFilters() {
    setIsFiltersOpen(false);
  }

  return (
    <div className="dashboard-page company-notifications-page">
      <PageHeader
        title="الإشعارات"
        subtitle="Company Notifications - متابعة إشعارات البلاغات وردود الأدمن"
      />

      <CompanyNotificationsStatsCards stats={stats} />

      <CompanyNotificationsFilterCard
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filterOptions={companyNotificationFilterOptions}
        filteredCount={filteredNotifications.length}
        totalCount={notifications.length}
        activeFiltersCount={activeFiltersCount}
        onOpenFilters={() => setIsFiltersOpen(true)}
        onResetFilters={handleResetFilters}
        onMarkAllRead={handleMarkAllRead}
      />

      <CompanyNotificationsList
        notifications={filteredNotifications}
        onToggleRead={handleToggleRead}
        onDelete={handleDeleteNotification}
      />

      {isFiltersOpen ? (
        <div className="company-notifications-filters-backdrop">
          <section
            className="company-notifications-filters-panel"
            role="dialog"
            aria-modal="true"
          >
            <header className="company-notifications-filters-panel__header">
              <button
                type="button"
                className="company-notifications-filters-panel__close"
                onClick={() => setIsFiltersOpen(false)}
                aria-label="إغلاق الفلاتر"
              >
                <FiX />
              </button>

              <div>
                <h2>فلترة الإشعارات</h2>
                <p>ابحث أو فلتر حسب نوع الإشعار أو حالة القراءة.</p>
              </div>
            </header>

            <div className="company-notifications-filters-panel__body">
              <div className="company-notifications-search company-notifications-search--panel">
                <FiSearch />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ابحث باسم البلاغ أو الإشعار..."
                  aria-label="البحث في إشعارات الشركة"
                />
              </div>

              <CompanyNotificationsFilterSelect
                value={activeFilter}
                options={companyNotificationFilterOptions}
                onChange={setActiveFilter}
                ariaLabel="فلترة الإشعارات"
              />
            </div>

            <footer className="company-notifications-filters-panel__actions">
              <button
                type="button"
                className="company-notifications-filter-apply-btn"
                onClick={handleApplyFilters}
              >
                <FiFilter />
                تطبيق الفلاتر
              </button>

              <button
                type="button"
                className="company-notifications-filter-reset-btn"
                onClick={handleResetFilters}
              >
                <FiX />
                مسح الفلاتر
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default CompanyNotificationsPage;