import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiRefreshCcw,
  FiX,
} from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { useAuth } from '../../../auth/hooks/useAuth';
import AdminNotificationsList from '../components/AdminNotificationsList';
import {
  ADMIN_NOTIFICATION_READ_STATUS,
  ADMIN_NOTIFICATION_TYPE,
  deleteAdminNotification,
  getAdminNotifications,
  getUnreadAdminNotificationsCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from '../api/adminNotificationsApi';
import '../../../user/notifications/user-notifications.css';
import '../admin-notifications.css';

const ADMIN_NOTIFICATION_TYPE_FILTERS = [
  {
    value: ADMIN_NOTIFICATION_TYPE.ALL,
    label: 'كل الأنواع',
    description: 'عرض جميع إشعارات الأدمن',
  },
  {
    value: ADMIN_NOTIFICATION_TYPE.NEW_REPORT_IN_GOVERNORATE,
    label: 'بلاغ جديد داخل المحافظة',
    description: 'عند إرسال بلاغ داخل محافظة الأدمن',
  },
  {
    value: ADMIN_NOTIFICATION_TYPE.COMPANY_STARTED_EXECUTION,
    label: 'بدأ التنفيذ',
    description: 'عند بدء الشركة العمل على البلاغ',
  },
  {
    value: ADMIN_NOTIFICATION_TYPE.COMPANY_REQUESTED_CLOSURE,
    label: 'طلب إغلاق البلاغ',
    description: 'عند طلب الشركة اعتماد الحل النهائي',
  },
  {
    value: ADMIN_NOTIFICATION_TYPE.COMPANY_EXECUTION_FAILED,
    label: 'تعذر التنفيذ',
    description: 'عند إبلاغ الشركة بتعذر تنفيذ البلاغ',
  },
];

const READ_FILTERS = [
  {
    value: ADMIN_NOTIFICATION_READ_STATUS.ALL,
    label: 'كل الإشعارات',
  },
  {
    value: ADMIN_NOTIFICATION_READ_STATUS.UNREAD,
    label: 'غير مقروءة',
  },
];

const PAGE_SIZE = 10;

function resolveAdminId(user) {
  return user?.id || user?.adminId || user?.userId || user?.UserId || user?.sub || '';
}

function getTypeCount({
  typeCounts = [],
  type,
  activeTypeFilter,
  totalCount = 0,
  notificationsCount = 0,
}) {
  const normalizedType = String(type || '').toLowerCase();
  const normalizedActiveType = String(activeTypeFilter || '').toLowerCase();

  if (normalizedType === String(ADMIN_NOTIFICATION_TYPE.ALL).toLowerCase()) {
    const allCount = typeCounts.find(
      (item) => String(item.type || '').toLowerCase() === 'all'
    );

    return allCount ? allCount.count : totalCount;
  }

  const foundType = typeCounts.find(
    (item) => String(item.type || '').toLowerCase() === normalizedType
  );

  if (foundType) {
    return foundType.count;
  }

  if (normalizedType === normalizedActiveType) {
    return totalCount || notificationsCount;
  }

  return 0;
}

function AdminNotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminId = resolveAdminId(user);

  const [notifications, setNotifications] = useState([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState(
    ADMIN_NOTIFICATION_TYPE.ALL
  );
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

  const [typeCounts, setTypeCounts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedTypeFilter = useMemo(
    () =>
      ADMIN_NOTIFICATION_TYPE_FILTERS.find(
        (filter) => filter.value === activeTypeFilter
      ) || ADMIN_NOTIFICATION_TYPE_FILTERS[0],
    [activeTypeFilter]
  );

  const currentPageUnreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const allTabCount = useMemo(() => {
    const activeTypeCount = getTypeCount({
      typeCounts,
      type: activeTypeFilter,
      activeTypeFilter,
      totalCount: pagination.totalCount,
      notificationsCount: notifications.length,
    });

    return activeReadFilter === ADMIN_NOTIFICATION_READ_STATUS.UNREAD
      ? activeTypeCount || pagination.totalCount
      : pagination.totalCount;
  }, [activeReadFilter, activeTypeFilter, notifications.length, pagination.totalCount, typeCounts]);

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
            type: activeTypeFilter,
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
        setErrorMessage(error?.message || 'حدث خطأ أثناء تحميل إشعارات الأدمن.');
        setNotifications([]);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [activeReadFilter, activeTypeFilter, adminId, pageNumber]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  function handleTypeFilterChange(nextFilter) {
    setActiveTypeFilter(nextFilter);
    setPageNumber(1);
    setIsDesktopFilterOpen(false);
    setIsMobileFilterOpen(false);
  }

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

          <div className="user-notifications-filter-dropdown">
            <button
              type="button"
              className="user-notifications-filter-dropdown__button"
              onClick={() => setIsDesktopFilterOpen((current) => !current)}
              aria-expanded={isDesktopFilterOpen}
              aria-label="فلترة إشعارات الأدمن حسب النوع"
            >
              <span className="user-notifications-filter-dropdown__icon">
                <FiFilter />
              </span>

              <span className="user-notifications-filter-dropdown__text">
                <small>فلترة حسب النوع</small>
                <strong>{selectedTypeFilter.label}</strong>
              </span>

              <FiChevronDown className="user-notifications-filter-dropdown__arrow" />
            </button>

            {isDesktopFilterOpen ? (
              <div className="user-notifications-filter-dropdown__menu">
                {ADMIN_NOTIFICATION_TYPE_FILTERS.map((filter) => {
                  const isActive = activeTypeFilter === filter.value;
                  const count = getTypeCount({
                    typeCounts,
                    type: filter.value,
                    activeTypeFilter,
                    totalCount: pagination.totalCount,
                    notificationsCount: notifications.length,
                  });

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      className={`user-notifications-filter-dropdown__item ${
                        isActive ? 'is-active' : ''
                      }`}
                      onClick={() => handleTypeFilterChange(filter.value)}
                    >
                      <span>
                        <strong>{filter.label}</strong>
                        <small>{filter.description}</small>
                      </span>

                      <em>{count}</em>

                      {isActive ? <FiCheck /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="user-notifications-mobile-filter-btn"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <FiFilter />
            <span>فلترة الإشعارات</span>
          </button>

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
                  : activeTypeFilter !== ADMIN_NOTIFICATION_TYPE.ALL
                    ? 'لا توجد إشعارات من هذا النوع'
                    : 'لا توجد إشعارات'
              }
              emptyMessage={
                activeReadFilter === ADMIN_NOTIFICATION_READ_STATUS.UNREAD
                  ? 'كل إشعارات الأدمن الحالية مقروءة.'
                  : activeTypeFilter !== ADMIN_NOTIFICATION_TYPE.ALL
                    ? 'جرّب اختيار نوع إشعار آخر.'
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

      {isMobileFilterOpen ? (
        <div
          className="user-notifications-filter-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="فلترة إشعارات الأدمن"
        >
          <button
            type="button"
            className="user-notifications-filter-sheet__backdrop"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-label="إغلاق الفلترة"
          />

          <div className="user-notifications-filter-sheet__content">
            <div className="user-notifications-filter-sheet__handle" />

            <div className="user-notifications-filter-sheet__header">
              <div>
                <h3>فلترة إشعارات الأدمن</h3>
                <p>اختر حالة القراءة ونوع الإشعار</p>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="إغلاق"
              >
                <FiX />
              </button>
            </div>

            <div className="user-notifications-filter-sheet__group">
              <h4>حالة القراءة</h4>

              <div className="user-notifications-filter-sheet__read-options">
                {READ_FILTERS.map((filter) => {
                  const isActive = activeReadFilter === filter.value;
                  const count =
                    filter.value === ADMIN_NOTIFICATION_READ_STATUS.UNREAD
                      ? unreadTabCount
                      : allTabCount;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      className={`user-notifications-read-tab ${
                        isActive ? 'is-active' : ''
                      }`}
                      onClick={() => handleReadFilterChange(filter.value)}
                    >
                      <span>{filter.label}</span>
                      <strong>{count}</strong>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="user-notifications-filter-sheet__group">
              <h4>نوع الإشعار</h4>

              <div className="user-notifications-filter-sheet__options">
                {ADMIN_NOTIFICATION_TYPE_FILTERS.map((filter) => {
                  const isActive = activeTypeFilter === filter.value;
                  const count = getTypeCount({
                    typeCounts,
                    type: filter.value,
                    activeTypeFilter,
                    totalCount: pagination.totalCount,
                    notificationsCount: notifications.length,
                  });

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      className={`user-notifications-filter-sheet__option ${
                        isActive ? 'is-active' : ''
                      }`}
                      onClick={() => handleTypeFilterChange(filter.value)}
                    >
                      <span>
                        <strong>{filter.label}</strong>
                        <small>{filter.description}</small>
                      </span>

                      <em>{count}</em>

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

export default AdminNotificationsPage;
