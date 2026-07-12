import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import NotificationsList from '../components/NotificationsList';
import {
  deleteUserNotification,
  getUserNotifications,
  markAllUserNotificationsAsRead,
  markUserNotificationAsRead,
  USER_NOTIFICATION_TYPE,
} from '../api/userNotificationsApi';
import '../user-notifications.css';

const USER_NOTIFICATION_TYPE_FILTERS = [
  {
    value: USER_NOTIFICATION_TYPE.ALL,
    label: 'كل الأنواع',
    description: 'عرض جميع أنواع الإشعارات',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_SUBMITTED,
    label: 'إرسال البلاغ',
    description: 'عند إرسال بلاغ جديد',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_ACCEPTED,
    label: 'قبول البلاغ',
    description: 'عند قبول البلاغ من الأدمن',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_REJECTED,
    label: 'رفض البلاغ',
    description: 'عند رفض البلاغ مع توضيح السبب',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_ASSIGNED_TO_COMPANY,
    label: 'تحويل البلاغ للشركة',
    description: 'عند تعيين شركة مسؤولة عن البلاغ',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_IN_PROGRESS,
    label: 'بدأ التنفيذ',
    description: 'عند بدء الشركة في التنفيذ',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_RESOLVED,
    label: 'اعتماد الحل',
    description: 'عند اعتماد حل البلاغ',
  },
];

const READ_FILTERS = {
  ALL: 'all',
  UNREAD: 'unread',
};

const PAGE_SIZE = 10;

function resolveUserId(user) {
  return user?.id || user?.userId || user?.UserId || user?.sub || '';
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

  if (normalizedType === String(USER_NOTIFICATION_TYPE.ALL).toLowerCase()) {
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

function UserNotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [notifications, setNotifications] = useState([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState(
    USER_NOTIFICATION_TYPE.ALL
  );
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
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
  const [desktopFilterMenuStyle, setDesktopFilterMenuStyle] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const desktopFilterButtonRef = useRef(null);
  const desktopFilterMenuRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedTypeFilter = useMemo(
    () =>
      USER_NOTIFICATION_TYPE_FILTERS.find(
        (filter) => filter.value === activeTypeFilter
      ) || USER_NOTIFICATION_TYPE_FILTERS[0],
    [activeTypeFilter]
  );

  const visibleNotifications = notifications;

  const readFilterAllCount = useMemo(
    () =>
      getTypeCount({
        typeCounts,
        type: activeTypeFilter,
        activeTypeFilter,
        totalCount: pagination.totalCount,
        notificationsCount: notifications.length,
      }),
    [activeTypeFilter, notifications.length, pagination.totalCount, typeCounts]
  );

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
          type: activeTypeFilter,
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
    [activeReadFilter, activeTypeFilter, pageNumber, userId]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const updateDesktopFilterMenuPosition = useCallback(() => {
    const trigger = desktopFilterButtonRef.current;

    if (!trigger || typeof window === 'undefined') return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const menuGap = 10;
    const preferredMaxHeight = 430;
    const minimumUsefulHeight = 190;
    const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - menuGap - viewportPadding);
    const spaceAbove = Math.max(0, rect.top - menuGap - viewportPadding);
    const shouldOpenUpward =
      spaceBelow < minimumUsefulHeight && spaceAbove > spaceBelow;
    const availableSpace = shouldOpenUpward ? spaceAbove : spaceBelow;
    const menuHeight = Math.max(
      120,
      Math.min(preferredMaxHeight, availableSpace)
    );
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - rect.width - viewportPadding)
    );
    const top = shouldOpenUpward
      ? Math.max(viewportPadding, rect.top - menuGap - menuHeight)
      : rect.bottom + menuGap;

    setDesktopFilterMenuStyle({
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(rect.width)}px`,
      maxHeight: `${Math.round(menuHeight)}px`,
    });
  }, []);

  useEffect(() => {
    if (!isDesktopFilterOpen) {
      setDesktopFilterMenuStyle(null);
      return undefined;
    }

    updateDesktopFilterMenuPosition();

    const handleOutsideClick = (event) => {
      const target = event.target;

      if (
        desktopFilterButtonRef.current?.contains(target) ||
        desktopFilterMenuRef.current?.contains(target)
      ) {
        return;
      }

      setIsDesktopFilterOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDesktopFilterOpen(false);
      }
    };

    window.addEventListener('resize', updateDesktopFilterMenuPosition);
    window.addEventListener('scroll', updateDesktopFilterMenuPosition, true);
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('resize', updateDesktopFilterMenuPosition);
      window.removeEventListener('scroll', updateDesktopFilterMenuPosition, true);
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDesktopFilterOpen, updateDesktopFilterMenuPosition]);

  function handleTypeFilterChange(nextFilter) {
    setActiveTypeFilter(nextFilter);
    setPageNumber(1);
    setIsDesktopFilterOpen(false);
    setIsMobileFilterOpen(false);
  }

  function handleReadFilterChange(nextFilter) {
    setActiveReadFilter(nextFilter);
    setPageNumber(1);
    setIsMobileFilterOpen(false);
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

    const searchParams = new URLSearchParams({
      reportId,
      source: 'notification',
      highlight: 'true',
    });

    navigate(`/my-reports?${searchParams.toString()}#reports-table`, {
      state: {
        reportId,
        selectedReportId: reportId,
        highlightReportId: reportId,
        source: 'notification',
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

          <div className="user-notifications-filter-dropdown">
            <button
              ref={desktopFilterButtonRef}
              type="button"
              className="user-notifications-filter-dropdown__button"
              onClick={() => setIsDesktopFilterOpen((current) => !current)}
              aria-expanded={isDesktopFilterOpen}
              aria-label="فلترة الإشعارات حسب النوع"
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

            {isDesktopFilterOpen &&
            desktopFilterMenuStyle &&
            typeof document !== 'undefined'
              ? createPortal(
                  <div
                    ref={desktopFilterMenuRef}
                    className="user-notifications-filter-dropdown__menu"
                    style={desktopFilterMenuStyle}
                    role="menu"
                    aria-label="أنواع الإشعارات"
                  >
                    {USER_NOTIFICATION_TYPE_FILTERS.map((filter) => {
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
                          role="menuitemradio"
                          aria-checked={isActive}
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
                  </div>,
                  document.body
                )
              : null}
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
                  : activeTypeFilter !== USER_NOTIFICATION_TYPE.ALL
                    ? 'لا توجد إشعارات من هذا النوع'
                    : 'لا توجد إشعارات'
              }
              emptyMessage={
                activeReadFilter === READ_FILTERS.UNREAD
                  ? 'لا توجد إشعارات غير مقروءة حسب الفلتر الحالي.'
                  : activeTypeFilter !== USER_NOTIFICATION_TYPE.ALL
                    ? 'جرّب اختيار نوع إشعار آخر.'
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

      {isMobileFilterOpen ? (
        <div
          className="user-notifications-filter-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="فلترة الإشعارات"
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
                <h3>فلترة الإشعارات</h3>
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
            </div>

            <div className="user-notifications-filter-sheet__group">
              <h4>نوع الإشعار</h4>

              <div className="user-notifications-filter-sheet__options">
                {USER_NOTIFICATION_TYPE_FILTERS.map((filter) => {
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

export default UserNotificationsPage;
