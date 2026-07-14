import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiRefreshCcw } from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { useAuth } from '../../../auth/hooks/useAuth';
import NotificationsList from '../components/NotificationsList';
import {
  deleteUserNotification,
  getUserNotifications,
  markAllUserNotificationsAsRead,
  markUserNotificationAsRead,
  resolveNotificationReportDestination,
} from '../api/userNotificationsApi';
import '../user-notifications.css';

const READ_FILTERS = {
  ALL: 'all',
  UNREAD: 'unread',
};

const PAGE_SIZE = 10;

function resolveUserId(user) {
  return user?.id || user?.userId || user?.UserId || user?.sub || '';
}

function UserNotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [notifications, setNotifications] = useState([]);
  const [activeReadFilter, setActiveReadFilter] = useState(READ_FILTERS.ALL);
  const [pageNumber, setPageNumber] = useState(1);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: PAGE_SIZE,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [typeCounts, setTypeCounts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const visibleNotifications = notifications;

  const readFilterAllCount = useMemo(() => {
    const allCount = typeCounts.find(
      (item) => String(item.type || '').toLowerCase() === 'all'
    );

    return allCount ? allCount.count : pagination.totalCount;
  }, [pagination.totalCount, typeCounts]);

  const loadNotifications = useCallback(
    async ({ showLoading = true } = {}) => {
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        setTypeCounts([]);
        setPagination({
          pageNumber: 1,
          pageSize: PAGE_SIZE,
          totalCount: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        setIsLoading(false);
        setErrorMessage('تعذر تحديد المستخدم الحالي.');
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }

        setErrorMessage('');

        const notificationsResponse = await getUserNotifications({
          userId,
          isRead: activeReadFilter === READ_FILTERS.UNREAD ? false : undefined,
          pageNumber,
          pageSize: PAGE_SIZE,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        });

        setNotifications(notificationsResponse.items || []);
        setUnreadCount(notificationsResponse.unreadCount || 0);
        setTypeCounts(notificationsResponse.typeCounts || []);
        setPagination({
          pageNumber: notificationsResponse.pageNumber || pageNumber,
          pageSize: notificationsResponse.pageSize || PAGE_SIZE,
          totalCount: notificationsResponse.totalCount || 0,
          totalPages: Math.max(1, notificationsResponse.totalPages || 1),
          hasNextPage: Boolean(notificationsResponse.hasNextPage),
          hasPreviousPage: Boolean(notificationsResponse.hasPreviousPage),
        });
      } catch (error) {
        setErrorMessage(error?.message || 'حدث خطأ أثناء تحميل الإشعارات.');
        setNotifications([]);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [activeReadFilter, pageNumber, userId]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  function handleReadFilterChange(nextFilter) {
    setActiveReadFilter(nextFilter);
    setPageNumber(1);
  }

  async function refreshAfterAction() {
    await loadNotifications({ showLoading: false });
  }

  function markNotificationAsReadLocally(notificationId) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );

    setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await markUserNotificationAsRead(notificationId);
      await refreshAfterAction();
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء تحديث حالة الإشعار.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadCount || !userId) return;

    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await markAllUserNotificationsAsRead(userId);
      setActiveReadFilter(READ_FILTERS.ALL);
      await refreshAfterAction();
    } catch (error) {
      setErrorMessage(
        error?.message || 'حدث خطأ أثناء تحديد الإشعارات كمقروءة.'
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await deleteUserNotification(notificationId);
      await refreshAfterAction();
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء حذف الإشعار.');
    } finally {
      setIsActionLoading(false);
    }
  };

  async function handleViewNotificationReport(notification) {
    const reportId = String(notification?.reportId || '').trim();

    if (!reportId) {
      setErrorMessage('هذا الإشعار غير مرتبط برقم بلاغ صالح.');
      return;
    }

    setErrorMessage('');

    if (!notification.isRead && notification.id) {
      markNotificationAsReadLocally(notification.id);
      markUserNotificationAsRead(notification.id).catch(() => {
        // الانتقال إلى البلاغ لا يتوقف على نجاح تحديث حالة قراءة الإشعار.
      });
    }

    const destination = await resolveNotificationReportDestination(notification);
    const targetPath =
      destination === 'followed-reports'
        ? '/followed-reports'
        : '/my-reports';

    const searchParams = new URLSearchParams({
      reportId,
      source: 'notification',
      target: destination,
      highlight: 'true',
    });

    navigate(`${targetPath}?${searchParams.toString()}#reports-table`, {
      state: {
        reportId,
        notificationReportId: reportId,
        selectedReportId: reportId,
        highlightReportId: reportId,
        source: 'notification',
        targetPage: destination,
        fromNotification: true,
        fromNotifications: true,
        scrollToReport: true,
        scrollTarget: 'reports-table',
      },
    });
  }

  function goToPreviousPage() {
    if (pageNumber <= 1 || isLoading) return;

    setPageNumber((currentPage) => Math.max(1, currentPage - 1));
  }

  function goToNextPage() {
    if (pageNumber >= pagination.totalPages || isLoading) return;

    setPageNumber((currentPage) =>
      Math.min(pagination.totalPages, currentPage + 1)
    );
  }

  return (
    <div className="dashboard-page user-notifications-page">
      <PageHeader
        title="الإشعارات"
        subtitle="تابع تحديثات بلاغاتك والبلاغات التي تتابعها أولًا بأول"
      />

      <section className="user-notifications-panel">
        <div className="user-notifications-toolbar">
          <div className="user-notifications-read-tabs">
            <button
              type="button"
              className={`user-notifications-read-tab ${
                activeReadFilter === READ_FILTERS.ALL ? 'is-active' : ''
              }`}
              onClick={() => handleReadFilterChange(READ_FILTERS.ALL)}
            >
              <span>كل الإشعارات</span>
              <strong>{readFilterAllCount}</strong>
            </button>

            <button
              type="button"
              className={`user-notifications-read-tab ${
                activeReadFilter === READ_FILTERS.UNREAD ? 'is-active' : ''
              }`}
              onClick={() => handleReadFilterChange(READ_FILTERS.UNREAD)}
            >
              <span>غير مقروءة</span>
              <strong>{unreadCount}</strong>
            </button>
          </div>

          <div className="user-notifications-toolbar__actions">
            <button
              type="button"
              className="user-notifications-btn user-notifications-btn--ghost"
              onClick={handleMarkAllAsRead}
              disabled={!unreadCount || isActionLoading}
            >
              <FiCheck />
              تحديد الكل كمقروء
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="user-notifications-loading" role="alert">
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="user-notifications-loading">
            <FiRefreshCcw />
            <span>جارٍ تحميل الإشعارات...</span>
          </div>
        ) : (
          <>
            <NotificationsList
              notifications={visibleNotifications}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
              onViewReport={handleViewNotificationReport}
              emptyTitle={
                activeReadFilter === READ_FILTERS.UNREAD
                  ? 'لا توجد إشعارات غير مقروءة'
                  : 'لا توجد إشعارات'
              }
              emptyMessage={
                activeReadFilter === READ_FILTERS.UNREAD
                  ? 'لا توجد إشعارات غير مقروءة حاليًا.'
                  : 'عند حدوث أي تحديث على بلاغاتك أو البلاغات التي تتابعها سيظهر هنا مباشرة.'
              }
            />

            {pagination.totalPages > 1 ? (
              <div className="user-notifications-pagination">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={pageNumber <= 1 || isLoading}
                >
                  السابق
                </button>

                <span>
                  صفحة {pageNumber} من {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={pageNumber >= pagination.totalPages || isLoading}
                >
                  التالي
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}

export default UserNotificationsPage;
