import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiInfo,
  FiMessageSquare,
  FiTrash2,
} from 'react-icons/fi';
import { ROUTES } from '../../../../shared/navigation';
import { COMPANY_NOTIFICATION_TYPES } from '../constants/companyNotifications';

function normalizeType(type) {
  return String(type || '').trim().toLowerCase();
}

function getNotificationIcon(type) {
  const normalizedType = normalizeType(type);

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED) {
    return <FiFileText />;
  }

  if (
    normalizedType === COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED ||
    normalizedType === COMPANY_NOTIFICATION_TYPES.CANNOT_FIX_ACCEPTED
  ) {
    return <FiCheckCircle />;
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED) {
    return <FiAlertTriangle />;
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK) {
    return <FiMessageSquare />;
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.SYSTEM) {
    return <FiInfo />;
  }

  return <FiBell />;
}

function getNotificationTone(notification) {
  if (notification?.tone) return notification.tone;

  const normalizedType = normalizeType(notification?.type);

  if (
    normalizedType === COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED ||
    normalizedType === COMPANY_NOTIFICATION_TYPES.CANNOT_FIX_ACCEPTED
  ) {
    return 'success';
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED) {
    return 'warning';
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK) {
    return 'info';
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.SYSTEM) {
    return 'neutral';
  }

  return 'primary';
}

function getNotificationTitle(notification) {
  if (notification?.title) return notification.title;

  const normalizedType = normalizeType(notification?.type);

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED) {
    return 'تم إسناد بلاغ جديد للشركة';
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED) {
    return 'تم قبول الحل وإغلاق البلاغ';
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.CANNOT_FIX_ACCEPTED) {
    return 'تم قبول طلب تعذر التنفيذ';
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.COMPLETION_REQUESTED) {
    return 'الأدمن طلب استكمال التنفيذ';
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK) {
    return 'رد جديد من الأدمن';
  }

  if (normalizedType === COMPANY_NOTIFICATION_TYPES.SYSTEM) {
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

  if (!Number.isNaN(parsedDate.getTime())) return parsedDate;

  const fallbackDate = new Date(rawDate);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function formatRelativeTime(createdAt) {
  const date = parseNotificationDate(createdAt);
  if (!date) return 'الآن';

  const diffMs = Date.now() - date.getTime();
  if (diffMs <= 0) return 'الآن';

  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `منذ ${diffDays} يوم`;

  return date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function CompanyNotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isActionLoading = false,
}) {
  const isUnread = !notification.isRead;
  const tone = getNotificationTone(notification);
  const reportNumber = notification.reportNumber;

  return (
    <article
      className={`company-notification-item company-notification-item--${tone} ${
        isUnread ? 'is-unread' : 'is-read'
      }`.trim()}
    >
      <div className="company-notification-item__status" aria-hidden="true">
        <span className="company-notification-item__status-dot" />
      </div>

      <div className="company-notification-item__icon" aria-hidden="true">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="company-notification-item__content">
        <div className="company-notification-item__top">
          <div>
            <span className="company-notification-item__eyebrow">
              {isUnread ? 'إشعار جديد' : 'تمت القراءة'}
            </span>

            <h3>{getNotificationTitle(notification)}</h3>
          </div>

          <span className="company-notification-item__time">
            <FiClock />
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <p>{notification.message || 'لا توجد بيانات للعرض'}</p>

        {reportNumber ? (
          <div className="company-notification-item__meta">
            <span>رقم البلاغ: {reportNumber}</span>

            {notification.reportTitle ? (
              <span>{notification.reportTitle}</span>
            ) : null}

            {notification.location ? (
              <span>{notification.location}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="company-notification-item__actions">
        {notification.reportId ? (
          <Link
            to={`${ROUTES.COMPANY_REPORTS}/${notification.reportId}`}
            className="company-notification-item__action company-notification-item__action--view"
          >
            عرض البلاغ
            <FiArrowLeft />
          </Link>
        ) : null}

        {isUnread ? (
          <button
            type="button"
            className="company-notification-item__action company-notification-item__action--read"
            onClick={() => onMarkAsRead?.(notification.id)}
            disabled={isActionLoading}
          >
            تحديد كمقروء
          </button>
        ) : (
          <span className="company-notification-item__read-badge">
            <FiCheckCircle />
            مقروء
          </span>
        )}

        <button
          type="button"
          className="company-notification-item__delete"
          onClick={() => onDelete?.(notification.id)}
          disabled={isActionLoading}
          aria-label="حذف الإشعار"
          title="حذف الإشعار"
        >
          <FiTrash2 />
        </button>
      </div>
    </article>
  );
}

export default CompanyNotificationItem;
