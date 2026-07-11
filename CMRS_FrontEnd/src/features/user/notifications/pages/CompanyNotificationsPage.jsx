import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiRefreshCcw,
  FiX,
} from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import {
  deleteCompanyNotification,
  getCompanyNotificationsData,
  markAllCompanyNotificationsAsRead,
  markCompanyNotificationAsRead,
} from '../api/companyNotificationsApi';
import CompanyNotificationsList from '../components/CompanyNotificationsList';
import {
  companyNotificationFilterOptions,
  companyNotifications,
} from '../mocks/companyNotificationsMockData';
import '../company-notifications.css';

const READ_FILTERS = {
  ALL: 'all',
  UNREAD: 'unread',
};

function CompanyNotificationsPage() {
  const [notifications, setNotifications] = useState(companyNotifications);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [activeReadFilter, setActiveReadFilter] = useState(READ_FILTERS.ALL);
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await getCompanyNotificationsData();
        if (!isMounted) return;

        setNotifications(data?.notifications || []);
      } catch (error) {
        if (!isMounted) return;

        setNotifications([]);
        setErrorMessage(error?.message || 'حدث خطأ أثناء تحميل الإشعارات.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setIsDesktopFilterOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsDesktopFilterOpen(false);
        setIsMobileFilterOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const selectedTypeFilter = useMemo(
    () =>
      companyNotificationFilterOptions.find(
        (filter) => filter.value === activeTypeFilter,
      ) || companyNotificationFilterOptions[0],
    [activeTypeFilter],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const typeCounts = useMemo(() => {
    return companyNotificationFilterOptions.reduce((counts, filter) => {
      if (filter.value === 'all') {
        counts[filter.value] = notifications.length;
      } else {
        counts[filter.value] = notifications.filter(
          (notification) => notification.type === filter.value,
        ).length;
      }

      return counts;
    }, {});
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesReadFilter =
        activeReadFilter === READ_FILTERS.ALL || !notification.isRead;

      const matchesTypeFilter =
        activeTypeFilter === 'all' ||
        notification.type === activeTypeFilter;

      return matchesReadFilter && matchesTypeFilter;
    });
  }, [activeReadFilter, activeTypeFilter, notifications]);

  const activeTypeTotalCount = useMemo(() => {
    if (activeTypeFilter === 'all') return notifications.length;
    return typeCounts[activeTypeFilter] || 0;
  }, [activeTypeFilter, notifications.length, typeCounts]);

  function syncNotificationsData(data) {
    setNotifications(data?.notifications || []);
  }

  function handleTypeFilterChange(nextFilter) {
    setActiveTypeFilter(nextFilter);
    setIsDesktopFilterOpen(false);
    setIsMobileFilterOpen(false);
  }

  function handleReadFilterChange(nextFilter) {
    setActiveReadFilter(nextFilter);
  }

  async function handleMarkAsRead(notificationId) {
    try {
      setIsActionLoading(true);
      setErrorMessage('');

      const data = await markCompanyNotificationAsRead(notificationId);
      syncNotificationsData(data);
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء تحديث حالة الإشعار.');
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleMarkAllAsRead() {
    if (!unreadCount) return;

    try {
      setIsActionLoading(true);
      setErrorMessage('');

      const data = await markAllCompanyNotificationsAsRead();
      syncNotificationsData(data);
      setActiveReadFilter(READ_FILTERS.ALL);
    } catch (error) {
      setErrorMessage(
        error?.message || 'حدث خطأ أثناء تحديد الإشعارات كمقروءة.',
      );
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleDeleteNotification(notificationId) {
    try {
      setIsActionLoading(true);
      setErrorMessage('');

      const data = await deleteCompanyNotification(notificationId);
      syncNotificationsData(data);
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء حذف الإشعار.');
    } finally {
      setIsActionLoading(false);
    }
  }

  return (
    <div className="dashboard-page company-notifications-page">
      <PageHeader
        title="الإشعارات"
        subtitle="تابع تحديثات البلاغات المسندة للشركة وردود الأدمن أولًا بأول"
      />

      <section className="company-notifications-panel">
        <div className="company-notifications-toolbar">
          <div className="company-notifications-read-tabs">
            <button
              type="button"
              className={`company-notifications-read-tab ${
                activeReadFilter === READ_FILTERS.ALL ? 'is-active' : ''
              }`}
              onClick={() => handleReadFilterChange(READ_FILTERS.ALL)}
            >
              <span>كل الإشعارات</span>
              <strong>{activeTypeTotalCount}</strong>
            </button>

            <button
              type="button"
              className={`company-notifications-read-tab ${
                activeReadFilter === READ_FILTERS.UNREAD ? 'is-active' : ''
              }`}
              onClick={() => handleReadFilterChange(READ_FILTERS.UNREAD)}
            >
              <span>غير مقروءة</span>
              <strong>{unreadCount}</strong>
            </button>
          </div>

          <div
            className="company-notifications-filter-dropdown"
            ref={filterDropdownRef}
          >
            <button
              type="button"
              className="company-notifications-filter-dropdown__button"
              onClick={() => setIsDesktopFilterOpen((current) => !current)}
              aria-expanded={isDesktopFilterOpen}
              aria-label="فلترة إشعارات الشركة حسب النوع"
            >
              <span className="company-notifications-filter-dropdown__icon">
                <FiFilter />
              </span>

              <span className="company-notifications-filter-dropdown__text">
                <small>فلترة حسب النوع</small>
                <strong>{selectedTypeFilter.label}</strong>
              </span>

              <FiChevronDown className="company-notifications-filter-dropdown__arrow" />
            </button>

            {isDesktopFilterOpen ? (
              <div className="company-notifications-filter-dropdown__menu">
                {companyNotificationFilterOptions.map((filter) => {
                  const isActive = activeTypeFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      className={`company-notifications-filter-dropdown__item ${
                        isActive ? 'is-active' : ''
                      }`}
                      onClick={() => handleTypeFilterChange(filter.value)}
                    >
                      <span>
                        <strong>{filter.label}</strong>
                        <small>{filter.description}</small>
                      </span>

                      <em>{typeCounts[filter.value] || 0}</em>
                      {isActive ? <FiCheck /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="company-notifications-mobile-filter-btn"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <FiFilter />
            <span>فلترة الإشعارات</span>
          </button>

          <div className="company-notifications-toolbar__actions">
            <button
              type="button"
              className="company-notifications-btn company-notifications-btn--ghost"
              onClick={handleMarkAllAsRead}
              disabled={!unreadCount || isActionLoading}
            >
              <FiCheck />
              تحديد الكل كمقروء
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="company-notifications-loading" role="alert">
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="company-notifications-loading">
            <FiRefreshCcw />
            <span>جارٍ تحميل الإشعارات...</span>
          </div>
        ) : (
          <CompanyNotificationsList
            notifications={visibleNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
            emptyTitle={
              activeReadFilter === READ_FILTERS.UNREAD
                ? 'لا توجد إشعارات غير مقروءة'
                : activeTypeFilter !== 'all'
                  ? 'لا توجد إشعارات من هذا النوع'
                  : 'لا توجد إشعارات'
            }
            emptyMessage={
              activeReadFilter === READ_FILTERS.UNREAD
                ? 'لا توجد إشعارات غير مقروءة حسب الفلتر الحالي.'
                : activeTypeFilter !== 'all'
                  ? 'جرّب اختيار نوع إشعار آخر.'
                  : 'عند حدوث أي تحديث على البلاغات المسندة للشركة سيظهر هنا مباشرة.'
            }
          />
        )}
      </section>

      {isMobileFilterOpen ? (
        <div
          className="company-notifications-filter-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="فلترة إشعارات الشركة"
        >
          <button
            type="button"
            className="company-notifications-filter-sheet__backdrop"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-label="إغلاق الفلترة"
          />

          <div className="company-notifications-filter-sheet__content">
            <div className="company-notifications-filter-sheet__handle" />

            <div className="company-notifications-filter-sheet__header">
              <div>
                <h3>فلترة الإشعارات</h3>
                <p>اختر حالة القراءة ونوع إشعار الشركة</p>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="إغلاق"
              >
                <FiX />
              </button>
            </div>

            <div className="company-notifications-filter-sheet__group">
              <h4>حالة القراءة</h4>

              <div className="company-notifications-filter-sheet__read-options">
                <button
                  type="button"
                  className={`company-notifications-read-tab ${
                    activeReadFilter === READ_FILTERS.ALL ? 'is-active' : ''
                  }`}
                  onClick={() => {
                    handleReadFilterChange(READ_FILTERS.ALL);
                    setIsMobileFilterOpen(false);
                  }}
                >
                  <span>كل الإشعارات</span>
                  <strong>{activeTypeTotalCount}</strong>
                </button>

                <button
                  type="button"
                  className={`company-notifications-read-tab ${
                    activeReadFilter === READ_FILTERS.UNREAD ? 'is-active' : ''
                  }`}
                  onClick={() => {
                    handleReadFilterChange(READ_FILTERS.UNREAD);
                    setIsMobileFilterOpen(false);
                  }}
                >
                  <span>غير مقروءة</span>
                  <strong>{unreadCount}</strong>
                </button>
              </div>
            </div>

            <div className="company-notifications-filter-sheet__group">
              <h4>نوع الإشعار</h4>

              <div className="company-notifications-filter-sheet__options">
                {companyNotificationFilterOptions.map((filter) => {
                  const isActive = activeTypeFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      className={`company-notifications-filter-sheet__option ${
                        isActive ? 'is-active' : ''
                      }`}
                      onClick={() => handleTypeFilterChange(filter.value)}
                    >
                      <span>
                        <strong>{filter.label}</strong>
                        <small>{filter.description}</small>
                      </span>

                      <em>{typeCounts[filter.value] || 0}</em>
                      {isActive ? <FiCheck /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CompanyNotificationsPage;
