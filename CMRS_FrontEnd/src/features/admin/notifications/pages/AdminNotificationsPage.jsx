import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiRefreshCcw } from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { useAuth } from '../../../auth/hooks/useAuth';
import AdminNotificationsList from '../components/AdminNotificationsList';
import {
  ADMIN_NOTIFICATION_READ_STATUS,
  deleteAdminNotification,
  getAdminNotifications,
  getUnreadAdminNotificationsCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from '../api/adminNotificationsApi';
import '../../../user/notifications/user-notifications.css';
import '../admin-notifications.css';

const PAGE_SIZE = 10;

function resolveAdminId(user) {
  return user?.id || user?.adminId || user?.userId || user?.UserId || user?.sub || '';
}

function AdminNotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminId = resolveAdminId(user);

  const [notifications, setNotifications] = useState([]);
  const [activeReadFilter, setActiveReadFilter] = useState(
    ADMIN_NOTIFICATION_READ_STATUS.ALL
  );

  const [pageNumber, setPageNumber] = useState(1);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: PAGE_SIZE,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentPageUnreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const allTabCount = pagination.totalCount;

  const unreadTabCount = useMemo(() => {
    if (activeReadFilter === ADMIN_NOTIFICATION_READ_STATUS.UNREAD) {
      return pagination.totalCount || currentPageUnreadCount;
    }

    return unreadCount || currentPageUnreadCount;
  }, [activeReadFilter, currentPageUnreadCount, pagination.totalCount, unreadCount]);

  const loadNotifications = useCallback(
    async ({ showLoading = true } = {}) => {
      if (!adminId) {
        setNotifications([]);
        setUnreadCount(0);
        setPagination({
          pageNumber: 1,
          pageSize: PAGE_SIZE,
          totalCount: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        setIsLoading(false);
        setErrorMessage('تعذر تحديد حساب الأدمن الحالي.');
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }

        setErrorMessage('');

        const [notificationsResponse, nextUnreadCount] = await Promise.all([
          getAdminNotifications({
            adminId,
            readStatus: activeReadFilter,
            pageNumber,
            pageSize: PAGE_SIZE,
          }),
          getUnreadAdminNotificationsCount(adminId),
        ]);

        const nextNotifications = notificationsResponse.items || [];

        setNotifications(
          activeReadFilter === ADMIN_NOTIFICATION_READ_STATUS.UNREAD
            ? nextNotifications.filter((notification) => !notification.isRead)
            : nextNotifications
        );
        setUnreadCount(notificationsResponse.unreadCount || nextUnreadCount || 0);

        setPagination({
          pageNumber: notificationsResponse.pageNumber || pageNumber,
          pageSize: notificationsResponse.pageSize || PAGE_SIZE,
          totalCount: notificationsResponse.totalCount || 0,
          totalPages: Math.max(1, notificationsResponse.totalPages || 1),
          hasNextPage: Boolean(notificationsResponse.hasNextPage),
          hasPreviousPage: Boolean(notificationsResponse.hasPreviousPage),
        });
      } catch (error) {
        setErrorMessage(error?.message || 'حدث خطأ أثناء تحميل إشعارات الأدمن.');
        setNotifications([]);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [activeReadFilter, adminId, pageNumber]
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await markAdminNotificationAsRead(notificationId);
      await refreshAfterAction();
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء تحديث حالة الإشعار.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadCount || !adminId) return;

    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await markAllAdminNotificationsAsRead(adminId);
      setActiveReadFilter(ADMIN_NOTIFICATION_READ_STATUS.ALL);
      setPageNumber(1);
      await refreshAfterAction();
    } catch (error) {
      setErrorMessage(
        error?.message || 'حدث خطأ أثناء تحديد إشعارات الأدمن كمقروءة.'
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await deleteAdminNotification(notificationId);
      await refreshAfterAction();
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء حذف الإشعار.');
    } finally {
      setIsActionLoading(false);
    }
  };

  function handleViewReport(notification) {
    const reportId = String(notification?.reportId || '').trim();

    if (!reportId) {
      return;
    }

    const encodedReportId = encodeURIComponent(reportId);

    navigate(
      `/admin/reports/review?highlightReportId=${encodedReportId}&source=notification#selected-report-card`,
      {
        state: {
          highlightReportId: reportId,
          selectedReportId: reportId,
          selectedReportSource: 'notification',
          scrollToReportsTable: true,
        },
      }
    );
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
    <div className="dashboard-page user-notifications-page admin-notifications-page">
      <PageHeader
        title="إشعارات الأدمن"
        subtitle="تابع البلاغات الجديدة وتحديثات الشركات من مكان واحد"
      />

      <section className="user-notifications-panel">
        <div className="user-notifications-toolbar">
          <div className="user-notifications-read-tabs">
            <button
              type="button"
              className={`user-notifications-read-tab ${
                activeReadFilter === ADMIN_NOTIFICATION_READ_STATUS.ALL
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                handleReadFilterChange(ADMIN_NOTIFICATION_READ_STATUS.ALL)
              }
            >
              <span>كل الإشعارات</span>
              <strong>{allTabCount}</strong>
            </button>

            <button
              type="button"
              className={`user-notifications-read-tab ${
                activeReadFilter === ADMIN_NOTIFICATION_READ_STATUS.UNREAD
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                handleReadFilterChange(ADMIN_NOTIFICATION_READ_STATUS.UNREAD)
              }
            >
              <span>غير مقروءة</span>
              <strong>{unreadTabCount}</strong>
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
            <span>جارٍ تحميل إشعارات الأدمن...</span>
          </div>
        ) : (
          <>
            <AdminNotificationsList
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
              onViewReport={handleViewReport}
              emptyTitle={
                activeReadFilter === ADMIN_NOTIFICATION_READ_STATUS.UNREAD
                  ? 'لا توجد إشعارات غير مقروءة'
                  : 'لا توجد إشعارات'
              }
              emptyMessage={
                activeReadFilter === ADMIN_NOTIFICATION_READ_STATUS.UNREAD
                  ? 'كل إشعارات الأدمن الحالية مقروءة.'
                  : 'عند وصول بلاغات أو تحديثات جديدة ستظهر هنا مباشرة.'
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

export default AdminNotificationsPage;
