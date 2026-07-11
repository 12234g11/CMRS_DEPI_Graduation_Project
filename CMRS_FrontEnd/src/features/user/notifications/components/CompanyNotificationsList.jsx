import { FiBellOff } from 'react-icons/fi';
import CompanyNotificationItem from './CompanyNotificationItem';

function CompanyNotificationsList({
  notifications = [],
  onMarkAsRead,
  onDelete,
  emptyTitle = 'لا توجد إشعارات',
  emptyMessage = 'عند حدوث أي تحديث على البلاغات المسندة للشركة سيظهر هنا مباشرة.',
}) {
  if (!notifications.length) {
    return (
      <div className="company-notifications-empty">
        <div className="company-notifications-empty__icon">
          <FiBellOff />
        </div>

        <h3>{emptyTitle}</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="company-notifications-list">
      {notifications.map((notification) => (
        <CompanyNotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default CompanyNotificationsList;
