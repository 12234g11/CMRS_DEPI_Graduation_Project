import { FiBellOff } from 'react-icons/fi';
import NotificationItem from './NotificationItem';

function NotificationsList({
  notifications = [],
  onMarkAsRead,
  onDelete,
  emptyTitle = 'لا توجد إشعارات',
  emptyMessage = 'عند حدوث أي تحديث على بلاغاتك سيظهر هنا مباشرة.',
}) {
  if (!notifications.length) {
    return (
      <div className="user-notifications-empty">
        <div className="user-notifications-empty__icon">
          <FiBellOff />
        </div>

        <h3>{emptyTitle}</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="user-notifications-list">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default NotificationsList;