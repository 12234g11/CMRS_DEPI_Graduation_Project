import { useCallback, useEffect, useState } from 'react';
import { FiCheck, FiRefreshCcw } from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import {
  deleteCompanyNotification,
  getCompanyNotificationsData,
  markAllCompanyNotificationsAsRead,
  markCompanyNotificationAsRead,
} from '../api/companyNotificationsApi';
import CompanyNotificationsList from '../components/CompanyNotificationsList';
import { COMPANY_NOTIFICATION_READ_FILTERS } from '../constants/companyNotifications';
import '../company-notifications.css';

function CompanyNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeReadFilter, setActiveReadFilter] = useState(
    COMPANY_NOTIFICATION_READ_FILTERS.ALL,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNotifications = useCallback(
    async ({ signal, silent = false } = {}) => {
      try {
        if (!silent) setIsLoading(true);
        setErrorMessage('');

        const data = await getCompanyNotificationsData({
          readStatus: activeReadFilter,
          signal,
        });

        if (signal?.aborted) return;

        setNotifications(data.notifications || []);
        setTotalCount(data.totalCount || 0);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        if (error?.name === 'AbortError' || signal?.aborted) return;

        setNotifications([]);
        setTotalCount(0);
        setUnreadCount(0);
        setErrorMessage(error?.message || 'حدث خطأ أثناء تحميل الإشعارات.');
      } finally {
        if (!signal?.aborted && !silent) setIsLoading(false);
      }
    },
    [activeReadFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadNotifications({ signal: controller.signal });

    return () => controller.abort();
  }, [loadNotifications]);

  function handleReadFilterChange(nextFilter) {
    setActiveReadFilter(nextFilter);
  }

  async function handleMarkAsRead(notificationId) {
    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await markCompanyNotificationAsRead(notificationId);
      await loadNotifications({ silent: true });
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء تحديث حالة الإشعار.');
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleMarkAllAsRead() {
    if (!unreadCount || isActionLoading) return;

    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await markAllCompanyNotificationsAsRead();

      if (activeReadFilter === COMPANY_NOTIFICATION_READ_FILTERS.UNREAD) {
        setActiveReadFilter(COMPANY_NOTIFICATION_READ_FILTERS.ALL);
      } else {
        await loadNotifications({ silent: true });
      }
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

      await deleteCompanyNotification(notificationId);
      await loadNotifications({ silent: true });
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
                activeReadFilter === COMPANY_NOTIFICATION_READ_FILTERS.ALL
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                handleReadFilterChange(COMPANY_NOTIFICATION_READ_FILTERS.ALL)
              }
            >
              <span>كل الإشعارات</span>
              <strong>{totalCount}</strong>
            </button>

            <button
              type="button"
              className={`company-notifications-read-tab ${
                activeReadFilter === COMPANY_NOTIFICATION_READ_FILTERS.UNREAD
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                handleReadFilterChange(COMPANY_NOTIFICATION_READ_FILTERS.UNREAD)
              }
            >
              <span>غير مقروءة</span>
              <strong>{unreadCount}</strong>
            </button>
          </div>

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
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
            isActionLoading={isActionLoading}
            emptyTitle={
              activeReadFilter === COMPANY_NOTIFICATION_READ_FILTERS.UNREAD
                ? 'لا توجد إشعارات غير مقروءة'
                : 'لا توجد إشعارات'
            }
            emptyMessage={
              activeReadFilter === COMPANY_NOTIFICATION_READ_FILTERS.UNREAD
                ? 'لا توجد إشعارات غير مقروءة حاليًا.'
                : 'عند حدوث أي تحديث على البلاغات المسندة للشركة سيظهر هنا مباشرة.'
            }
          />
        )}
      </section>
    </div>
  );
}

export default CompanyNotificationsPage;
