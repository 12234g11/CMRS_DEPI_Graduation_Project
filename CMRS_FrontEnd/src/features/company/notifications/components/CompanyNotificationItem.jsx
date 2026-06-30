import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiFileText,
  FiMessageSquare,
  FiTrash2,
} from 'react-icons/fi';
import { ROUTES } from '../../../../shared/navigation';
import { COMPANY_NOTIFICATION_TYPES } from '../mocks/companyNotificationsMockData';

const TYPE_ICONS = {
  [COMPANY_NOTIFICATION_TYPES.REPORT_ASSIGNED]: FiFileText,
  [COMPANY_NOTIFICATION_TYPES.ADMIN_FEEDBACK]: FiMessageSquare,
  [COMPANY_NOTIFICATION_TYPES.NEEDS_COMPLETION]: FiAlertTriangle,
  [COMPANY_NOTIFICATION_TYPES.SOLUTION_ACCEPTED]: FiCheckCircle,
  [COMPANY_NOTIFICATION_TYPES.SYSTEM]: FiBell,
};

function CompanyNotificationItem({
  notification,
  onToggleRead,
  onDelete,
}) {
  const TypeIcon = TYPE_ICONS[notification.type] || FiBell;

  return (
    <article
      className={`company-notification-item company-notification-item--${notification.tone} ${
        !notification.isRead ? 'is-unread' : ''
      }`}
    >
      <span className="company-notification-item__icon">
        <TypeIcon />
      </span>

      <div className="company-notification-item__content">
        <div className="company-notification-item__title-row">
          <div>
            <h3>{notification.title}</h3>

            <div className="company-notification-item__meta">
              <span>{notification.time}</span>
              <span>{notification.typeLabel}</span>

              {notification.priority ? (
                <span
                  className={`company-notification-priority company-notification-priority--${notification.priorityTone}`}
                >
                  {notification.priority}
                </span>
              ) : null}
            </div>
          </div>

          {!notification.isRead ? (
            <span className="company-notification-unread-dot" />
          ) : null}
        </div>

        <p>{notification.message}</p>

        {notification.reportId ? (
          <div className="company-notification-report-box">
            <strong>{notification.reportTitle}</strong>
            <span>
              #{notification.reportId}
              {notification.location ? ` - ${notification.location}` : ''}
            </span>
          </div>
        ) : null}

        <div className="company-notification-actions">
          {notification.reportId ? (
            <Link
              to={`${ROUTES.COMPANY_REPORTS}/${notification.reportId}`}
              className="company-notification-view-btn"
            >
              <FiEye />
              عرض البلاغ
            </Link>
          ) : null}

          <button
            type="button"
            className="company-notification-read-btn"
            onClick={() => onToggleRead(notification.id)}
          >
            <FiCheck />
            {notification.isRead ? 'تمييز كغير مقروء' : 'تمييز كمقروء'}
          </button>

          <button
            type="button"
            className="company-notification-delete-btn"
            onClick={() => onDelete(notification.id)}
          >
            <FiTrash2 />
            حذف
          </button>
        </div>
      </div>
    </article>
  );
}

export default CompanyNotificationItem;