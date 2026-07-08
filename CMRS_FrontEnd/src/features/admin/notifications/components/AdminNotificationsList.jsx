import { FiBellOff } from 'react-icons/fi';
import AdminNotificationItem from './AdminNotificationItem';

function AdminNotificationsList({
  notifications = [],
  onMarkAsRead,
  onDelete,
  onViewReport,
  emptyTitle = 'لا توجد إشعارات',
  emptyMessage = 'عند حدوث أي تحديث يخص البلاغات سيظهر هنا مباشرة.',
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
        <AdminNotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          onViewReport={onViewReport}
        />
      ))}
    </div>
  );
}

export default AdminNotificationsList;
