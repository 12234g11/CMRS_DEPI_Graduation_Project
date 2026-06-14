import { useEffect, useMemo, useState } from 'react';
import {
  FiBell,
  FiCheck,
  FiRefreshCcw,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { useAuth } from '../../../auth/hooks/useAuth';
import NotificationsList from '../components/NotificationsList';
import { USER_NOTIFICATION_FILTERS } from '../mocks/userNotificationsMockData';
import {
  clearUserNotifications,
  deleteUserNotification,
  getUserNotifications,
  markAllUserNotificationsAsRead,
  markUserNotificationAsRead,
} from '../api/userNotificationsApi';
import '../user-notifications.css';

function getFilterCount(filterValue, notifications) {
  if (filterValue === 'all') return notifications.length;
  if (filterValue === 'unread') return notifications.filter((item) => !item.isRead).length;

  return notifications.filter((item) => item.type === filterValue).length;
}

function UserNotificationsPage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'unread' && !notification.isRead) ||
        notification.type === activeFilter;

      const searchableText = [
        notification.title,
        notification.message,
        notification.reportTitle,
        notification.reportCode,
        notification.area,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, notifications, searchValue]);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        setIsLoading(true);
        const nextNotifications = await getUserNotifications(userId);

        if (isMounted) {
          setNotifications(nextNotifications);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setIsActionLoading(true);

      const nextNotifications = await markUserNotificationAsRead({
        userId,
        notificationId,
      });

      setNotifications(nextNotifications);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadCount) return;

    try {
      setIsActionLoading(true);
      const nextNotifications = await markAllUserNotificationsAsRead(userId);

      setNotifications(nextNotifications);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setIsActionLoading(true);

      const nextNotifications = await deleteUserNotification({
        userId,
        notificationId,
      });

      setNotifications(nextNotifications);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!notifications.length) return;

    try {
      setIsActionLoading(true);
      const nextNotifications = await clearUserNotifications(userId);

      setNotifications(nextNotifications);
      setActiveFilter('all');
      setSearchValue('');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="dashboard-page user-notifications-page">
      <PageHeader
        title="الإشعارات"
        subtitle="تابع تحديثات بلاغاتك أولًا بأول"
      />


      <section className="user-notifications-panel">
        <div className="user-notifications-toolbar">
          <div className="user-notifications-toolbar__search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="ابحث باسم البلاغ أو المنطقة أو كود البلاغ..."
              aria-label="بحث في الإشعارات"
            />
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

            <button
              type="button"
              className="user-notifications-btn user-notifications-btn--danger"
              onClick={handleClearAll}
              disabled={!notifications.length || isActionLoading}
            >
              <FiTrash2 />
              مسح الكل
            </button>
          </div>
        </div>

        <div className="user-notifications-filters" role="tablist" aria-label="فلترة الإشعارات">
          {USER_NOTIFICATION_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            const count = getFilterCount(filter.value, notifications);

            return (
              <button
                key={filter.value}
                type="button"
                className={`user-notifications-filter ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                <span>{filter.label}</span>
                <strong>{count}</strong>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="user-notifications-loading">
            <FiRefreshCcw />
            <span>جارٍ تحميل الإشعارات...</span>
          </div>
        ) : (
          <NotificationsList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
            emptyTitle={
              searchValue || activeFilter !== 'all'
                ? 'لا توجد نتائج مطابقة'
                : 'لا توجد إشعارات'
            }
            emptyMessage={
              searchValue || activeFilter !== 'all'
                ? 'جرّب تغيير كلمة البحث أو اختيار فلتر آخر.'
                : 'عند حدوث أي تحديث على بلاغاتك سيظهر هنا مباشرة.'
            }
          />
        )}
      </section>
    </div>
  );
}

export default UserNotificationsPage;