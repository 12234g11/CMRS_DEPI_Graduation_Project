import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMapPin,
  FiEye,
  FiPlayCircle,
  FiTrash2,
} from 'react-icons/fi';

function normalizeType(type) {
  return String(type || '').trim().toLowerCase();
}

function getNotificationIcon(type) {
  const normalizedType = normalizeType(type);

  if (normalizedType === 'newreport') return <FiFileText />;
  if (normalizedType === 'companystartedexecution') return <FiPlayCircle />;
  if (normalizedType === 'companyrequestedclosure') return <FiCheckCircle />;
  if (normalizedType === 'companyexecutionfailed') return <FiAlertTriangle />;

  return <FiBell />;
}

function getNotificationTone(type) {
  const normalizedType = normalizeType(type);

  if (normalizedType === 'newreport') return 'info';
  if (normalizedType === 'companystartedexecution') return 'primary';
  if (normalizedType === 'companyrequestedclosure') return 'success';
  if (normalizedType === 'companyexecutionfailed') return 'danger';

  return 'neutral';
}

function getNotificationTitle(type) {
  const normalizedType = normalizeType(type);

  if (normalizedType === 'newreport') {
    return 'بلاغ جديد داخل المحافظة';
  }

  if (normalizedType === 'companystartedexecution') {
    return 'بدأت الشركة التنفيذ';
  }

  if (normalizedType === 'companyrequestedclosure') {
    return 'طلب اعتماد الحل النهائي';
  }

  if (normalizedType === 'companyexecutionfailed') {
    return 'تعذر تنفيذ البلاغ';
  }

  return 'إشعار جديد';
}

function parseNotificationDate(createdAt) {
  if (!createdAt) return null;

  const rawDate = String(createdAt).trim();

  if (!rawDate) return null;

  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(rawDate);
  const normalizedDate = hasTimezone ? rawDate : `${rawDate}Z`;

  const parsedDate = new Date(normalizedDate);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  const fallbackDate = new Date(rawDate);

  if (!Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  return null;
}

function formatRelativeTime(createdAt) {
  const date = parseNotificationDate(createdAt);

  if (!date) return 'الآن';

  const diffMs = Date.now() - date.getTime();

  if (diffMs <= 0) {
    return 'الآن';
  }

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

function AdminNotificationItem({ notification, onMarkAsRead, onDelete, onViewReport }) {
  const isUnread = !notification.isRead;
  const tone = getNotificationTone(notification.type);

  return (
    <article
      className={`user-notification-item user-notification-item--${tone} ${
        isUnread ? 'is-unread' : 'is-read'
      }`.trim()}
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

            <h3>{getNotificationTitle(notification.type)}</h3>
          </div>

          <span className="user-notification-item__time">
            <FiClock />
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <p>{notification.message}</p>

        {(notification.reportId || notification.reportTitle || notification.area) ? (
          <div className="user-notification-item__meta">
            {notification.reportTitle ? <span>{notification.reportTitle}</span> : null}

            {notification.reportId ? (
              <span>رقم البلاغ: {notification.reportId}</span>
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
        {notification.reportId ? (
          <button
            type="button"
            className="user-notification-item__action user-notification-item__action--report"
            onClick={() => onViewReport?.(notification)}
          >
            <FiEye />
            عرض البلاغ
          </button>
        ) : null}

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

export default AdminNotificationItem;
