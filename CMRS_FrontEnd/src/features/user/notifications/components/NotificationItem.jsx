import {
  FiArrowLeft,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiInfo,
  FiSend,
  FiTool,
  FiTrash2,
  FiXCircle,
} from 'react-icons/fi';

function normalizeType(type) {
  return String(type || '').trim().toLowerCase();
}

function getNotificationIcon(type) {
  const normalizedType = normalizeType(type);

  if (normalizedType === 'reportsubmitted') return <FiSend />;
  if (normalizedType === 'reportaccepted') return <FiCheckCircle />;
  if (normalizedType === 'reportrejected') return <FiXCircle />;
  if (normalizedType === 'reportassignedtocompany') return <FiFileText />;
  if (normalizedType === 'reportinprogress') return <FiTool />;
  if (normalizedType === 'reportresolved') return <FiCheckCircle />;
  if (normalizedType === 'reportunabletoexecute') return <FiXCircle />;
  if (normalizedType.includes('system')) return <FiInfo />;

  return <FiBell />;
}

function getNotificationTone(type) {
  const normalizedType = normalizeType(type);

  if (normalizedType === 'reportsubmitted') return 'info';
  if (normalizedType === 'reportaccepted') return 'success';
  if (normalizedType === 'reportrejected') return 'danger';
  if (normalizedType === 'reportassignedtocompany') return 'primary';
  if (normalizedType === 'reportinprogress') return 'warning';
  if (normalizedType === 'reportresolved') return 'success';
  if (normalizedType === 'reportunabletoexecute') return 'danger';
  if (normalizedType.includes('system')) return 'neutral';

  return 'primary';
}

function getNotificationTitle(type) {
  const normalizedType = normalizeType(type);

  if (normalizedType === 'reportsubmitted') {
    return 'تم إرسال البلاغ';
  }

  if (normalizedType === 'reportaccepted') {
    return 'تم قبول البلاغ';
  }

  if (normalizedType === 'reportrejected') {
    return 'تم رفض البلاغ';
  }

  if (normalizedType === 'reportassignedtocompany') {
    return 'تم تحويل البلاغ للشركة';
  }

  if (normalizedType === 'reportinprogress') {
    return 'بدأ تنفيذ البلاغ';
  }

  if (normalizedType === 'reportresolved') {
    return 'تم اعتماد الحل';
  }

  if (normalizedType === 'reportunabletoexecute') {
    return 'تم إغلاق البلاغ لتعذر التنفيذ';
  }

  if (normalizedType.includes('system')) {
    return 'إشعار من النظام';
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

function NotificationItem({ notification, onMarkAsRead, onDelete, onViewReport }) {
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

        <p>{notification.message || 'لا توجد بيانات للعرض'}</p>

        {notification.reportId ? (
          <div className="user-notification-item__meta">
            <span>رقم البلاغ: {notification.reportId}</span>
          </div>
        ) : null}
      </div>

      <div className="user-notification-item__actions">
        {notification.reportId ? (
          <button
            type="button"
            className="user-notification-item__action user-notification-item__action--view"
            onClick={() => onViewReport?.(notification)}
          >
            عرض البلاغ
            <FiArrowLeft />
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

export default NotificationItem;