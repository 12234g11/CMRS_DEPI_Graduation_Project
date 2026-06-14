import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiMapPin,
  FiMessageCircle,
  FiTrash2,
} from 'react-icons/fi';

function getNotificationIcon(type) {
  if (type === 'solved') return <FiCheckCircle />;
  if (type === 'rating') return <FiMessageCircle />;
  if (type === 'system') return <FiInfo />;

  return <FiBell />;
}

function formatRelativeTime(createdAt) {
  const date = new Date(createdAt);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `منذ ${diffMinutes} دقيقة`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `منذ ${diffHours} ساعة`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `منذ ${diffDays} يوم`;
  }

  return date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}) {
  const isUnread = !notification.isRead;

  return (
    <article
      className={`user-notification-item user-notification-item--${notification.tone} ${isUnread ? 'is-unread' : 'is-read'}`.trim()}
    >
      <div className="user-notification-item__status" aria-hidden="true">
        <span className="user-notification-item__status-dot" />
      </div>

      <div className="user-notification-item__icon" aria-hidden="true">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="user-notification-item__content">
        <div className="user-notification-item__top">
          <div>
            <span className="user-notification-item__eyebrow">
              {isUnread ? 'إشعار جديد' : 'تمت القراءة'}
            </span>

            <h3>{notification.title}</h3>
          </div>

          <span className="user-notification-item__time">
            <FiClock />
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <p>{notification.message}</p>

        {(notification.reportTitle || notification.area || notification.reportCode) ? (
          <div className="user-notification-item__meta">
            {notification.reportTitle ? (
              <span>{notification.reportTitle}</span>
            ) : null}

            {notification.reportCode ? (
              <span>{notification.reportCode}</span>
            ) : null}

            {notification.area ? (
              <span>
                <FiMapPin />
                {notification.area}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="user-notification-item__actions">
        {isUnread ? (
          <button
            type="button"
            className="user-notification-item__action user-notification-item__action--read"
            onClick={() => onMarkAsRead?.(notification.id)}
          >
            تحديد كمقروء
          </button>
        ) : (
          <span className="user-notification-item__read-badge">
            <FiCheckCircle />
            مقروء
          </span>
        )}

        <button
          type="button"
          className="user-notification-item__delete"
          onClick={() => onDelete?.(notification.id)}
          aria-label="حذف الإشعار"
          title="حذف الإشعار"
        >
          <FiTrash2 />
        </button>
      </div>
    </article>
  );
}

export default NotificationItem;