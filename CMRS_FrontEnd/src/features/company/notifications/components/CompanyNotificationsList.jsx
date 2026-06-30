import { FiBell } from 'react-icons/fi';
import CompanyNotificationItem from './CompanyNotificationItem';

function CompanyNotificationsList({
  notifications = [],
  onToggleRead,
  onDelete,
}) {
  return (
    <section className="company-notifications-card">
      <header className="company-notifications-card__header">
        <div>
          <h2>قائمة الإشعارات</h2>
          <p>Notifications List</p>
        </div>
      </header>

      <div className="company-notifications-list">
        {notifications.length ? (
          notifications.map((notification) => (
            <CompanyNotificationItem
              key={notification.id}
              notification={notification}
              onToggleRead={onToggleRead}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="company-notifications-empty">
            <FiBell />
            <h3>لا توجد إشعارات مطابقة</h3>
            <p>جرّب تغيير الفلتر أو مسح البحث الحالي.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CompanyNotificationsList;