import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiFileText,
  FiFilter,
  FiMapPin,
  FiMessageSquare,
  FiRefreshCcw,
  FiTool,
  FiX,
} from 'react-icons/fi';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { useAuth } from '../../../auth/hooks/useAuth';
import NotificationsList from '../components/NotificationsList';
import {
  deleteUserNotification,
  getNotificationReportDetails,
  getUserNotifications,
  markAllUserNotificationsAsRead,
  markUserNotificationAsRead,
  USER_NOTIFICATION_TYPE,
} from '../api/userNotificationsApi';
import '../user-notifications.css';

const USER_NOTIFICATION_TYPE_FILTERS = [
  {
    value: USER_NOTIFICATION_TYPE.ALL,
    label: 'كل الأنواع',
    description: 'عرض جميع أنواع الإشعارات',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_SUBMITTED,
    label: 'إرسال البلاغ',
    description: 'عند إرسال بلاغ جديد',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_ACCEPTED,
    label: 'قبول البلاغ',
    description: 'عند قبول البلاغ من الأدمن',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_REJECTED,
    label: 'رفض البلاغ',
    description: 'عند رفض البلاغ مع توضيح السبب',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_ASSIGNED_TO_COMPANY,
    label: 'تحويل البلاغ للشركة',
    description: 'عند تعيين شركة مسؤولة عن البلاغ',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_IN_PROGRESS,
    label: 'بدأ التنفيذ',
    description: 'عند بدء الشركة في التنفيذ',
  },
  {
    value: USER_NOTIFICATION_TYPE.REPORT_RESOLVED,
    label: 'اعتماد الحل',
    description: 'عند اعتماد حل البلاغ',
  },
];

const READ_FILTERS = {
  ALL: 'all',
  UNREAD: 'unread',
};

const PAGE_SIZE = 10;

const EMPTY_REPORT_MODAL_STATE = {
  isOpen: false,
  notification: null,
  report: null,
  isLoading: false,
  errorMessage: '',
};

function resolveUserId(user) {
  return user?.id || user?.userId || user?.UserId || user?.sub || '';
}

function getTypeCount({
  typeCounts = [],
  type,
  activeTypeFilter,
  totalCount = 0,
  notificationsCount = 0,
}) {
  const normalizedType = String(type || '').toLowerCase();
  const normalizedActiveType = String(activeTypeFilter || '').toLowerCase();

  if (normalizedType === String(USER_NOTIFICATION_TYPE.ALL).toLowerCase()) {
    const allCount = typeCounts.find(
      (item) => String(item.type || '').toLowerCase() === 'all'
    );

    return allCount ? allCount.count : totalCount;
  }

  const foundType = typeCounts.find(
    (item) => String(item.type || '').toLowerCase() === normalizedType
  );

  if (foundType) {
    return foundType.count;
  }

  if (normalizedType === normalizedActiveType) {
    return totalCount || notificationsCount;
  }

  return 0;
}

function parseDate(value) {
  if (!value) return null;

  const rawDate = String(value).trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(rawDate);
  const normalizedDate = hasTimezone ? rawDate : `${rawDate}Z`;
  const parsedDate = new Date(normalizedDate);

  if (!Number.isNaN(parsedDate.getTime())) return parsedDate;

  const fallbackDate = new Date(rawDate);

  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function formatDateTime(value) {
  const date = parseDate(value);

  if (!date) return '—';

  return date.toLocaleString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getImageUrl(image) {
  return image?.imageUrl || image?.thumbnailUrl || '';
}

function getStatusTone(status = '') {
  const normalizedStatus = String(status || '').toLowerCase();

  if (
    normalizedStatus.includes('resolved') ||
    normalizedStatus.includes('completed') ||
    normalizedStatus.includes('closed') ||
    normalizedStatus.includes('solved') ||
    normalizedStatus.includes('حل')
  ) {
    return 'success';
  }

  if (
    normalizedStatus.includes('rejected') ||
    normalizedStatus.includes('رفض') ||
    normalizedStatus.includes('cancel')
  ) {
    return 'danger';
  }

  if (
    normalizedStatus.includes('progress') ||
    normalizedStatus.includes('assigned') ||
    normalizedStatus.includes('review') ||
    normalizedStatus.includes('متابعة') ||
    normalizedStatus.includes('تنفيذ') ||
    normalizedStatus.includes('مراجعة')
  ) {
    return 'warning';
  }

  return 'primary';
}

function ReportInfoCard({ icon, label, value }) {
  return (
    <div className="notification-report-modal__info-card">
      <span className="notification-report-modal__info-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );
}

function ReportImageGrid({ title, subtitle, images = [], emptyMessage }) {
  return (
    <section className="notification-report-modal__section">
      <div className="notification-report-modal__section-title">
        <div>
          <h4>{title}</h4>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <span>{images.length}</span>
      </div>

      {images.length ? (
        <div className="notification-report-modal__images-grid">
          {images.map((image, index) => {
            const imageUrl = getImageUrl(image);

            return (
              <a
                key={image.id || `${imageUrl}-${index}`}
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="notification-report-modal__image-link"
              >
                <img src={imageUrl} alt={`${title} ${index + 1}`} />
              </a>
            );
          })}
        </div>
      ) : (
        <p className="notification-report-modal__empty-text">{emptyMessage}</p>
      )}
    </section>
  );
}

function ReportTimeline({ timeline = [] }) {
  return (
    <section className="notification-report-modal__section">
      <div className="notification-report-modal__section-title">
        <div>
          <h4>آخر التحديثات</h4>
          <p>كل خطوة أو تحديث حصل على البلاغ</p>
        </div>

        <span>{timeline.length}</span>
      </div>

      {timeline.length ? (
        <div className="notification-report-modal__timeline">
          {timeline.map((item) => (
            <article key={item.id} className="notification-report-modal__timeline-item">
              <span className="notification-report-modal__timeline-icon">
                <FiClock />
              </span>

              <div>
                <strong>{item.title || 'تحديث على البلاغ'}</strong>
                {item.description ? <p>{item.description}</p> : null}
                <small>{formatDateTime(item.createdAt)}</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="notification-report-modal__empty-text">
          لا توجد تحديثات تفصيلية متاحة لهذا البلاغ حاليًا.
        </p>
      )}
    </section>
  );
}

function NotificationReportModal({ modalState, onClose }) {
  const { isOpen, notification, report, isLoading, errorMessage } = modalState;

  if (!isOpen) return null;

  const reportStatusTone = getStatusTone(report?.status || report?.statusLabel);
  const companyResponse = report?.companyResponse;
  const updateNote =
    companyResponse?.note ||
    companyResponse?.reason ||
    companyResponse?.adminNote ||
    notification?.message ||
    '';

  return (
    <div
      className="notification-report-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="تفاصيل البلاغ المرتبط بالإشعار"
    >
      <button
        type="button"
        className="notification-report-modal-backdrop__click-area"
        onClick={onClose}
        aria-label="إغلاق تفاصيل البلاغ"
      />

      <article className="notification-report-modal">
        <button
          type="button"
          className="notification-report-modal__close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <FiX />
        </button>

        <header className="notification-report-modal__header">
          <span className="notification-report-modal__icon">
            <FiFileText />
          </span>

          <div>
            <span className="notification-report-modal__eyebrow">
              البلاغ المرتبط بالإشعار
            </span>
            <h3>{report?.title || notification?.message || 'تفاصيل البلاغ'}</h3>
            <p>يتم عرض البلاغ هنا مباشرة حتى لو كان البلاغ متابعًا وليس ضمن بلاغاتك أو البلاغات القريبة من موقعك الحالي.</p>
          </div>
        </header>

        <div className="notification-report-modal__body">
          {isLoading ? (
            <div className="notification-report-modal__state">
              <FiRefreshCcw />
              <strong>جارٍ تحميل تفاصيل البلاغ...</strong>
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="notification-report-modal__state notification-report-modal__state--error">
              <FiAlertTriangle />
              <strong>{errorMessage}</strong>
              <p>
                تأكد أن الباك يوفر Endpoint لتفاصيل البلاغ للمستخدم أو للبلاغات المتابعة.
              </p>
            </div>
          ) : null}

          {!isLoading && report ? (
            <>
              <div className="notification-report-modal__status-row">
                <span
                  className={`notification-report-modal__status notification-report-modal__status--${reportStatusTone}`}
                >
                  {report.statusLabel || report.status || '—'}
                </span>

                <span className="notification-report-modal__report-id">
                  رقم البلاغ: {report.id || notification?.reportId}
                </span>
              </div>

              <div className="notification-report-modal__info-grid">
                <ReportInfoCard
                  icon={<FiTool />}
                  label="نوع المشكلة"
                  value={report.issueCategoryName || report.type}
                />
                <ReportInfoCard
                  icon={<FiMapPin />}
                  label="الموقع"
                  value={[report.city, report.location].filter(Boolean).join(' - ')}
                />
                <ReportInfoCard
                  icon={<FiCalendar />}
                  label="تاريخ البلاغ"
                  value={formatDateTime(report.createdAt)}
                />
                <ReportInfoCard
                  icon={<FiMessageSquare />}
                  label="الشركة المسؤولة"
                  value={report.assignedCompanyName || report.concernedCompanyName}
                />
              </div>

              <section className="notification-report-modal__section">
                <div className="notification-report-modal__section-title">
                  <div>
                    <h4>وصف البلاغ</h4>
                    <p>تفاصيل المشكلة الأصلية</p>
                  </div>
                </div>

                <p className="notification-report-modal__description">
                  {report.description || notification?.message || 'لا يوجد وصف متاح.'}
                </p>
              </section>

              {report.rejectionReason ? (
                <section className="notification-report-modal__section notification-report-modal__section--warning">
                  <div className="notification-report-modal__section-title">
                    <div>
                      <h4>سبب الرفض</h4>
                      <p>السبب الذي تم تسجيله على البلاغ</p>
                    </div>
                  </div>

                  <p className="notification-report-modal__description">
                    {report.rejectionReason}
                  </p>
                </section>
              ) : null}

              {updateNote ? (
                <section className="notification-report-modal__section notification-report-modal__section--update">
                  <div className="notification-report-modal__section-title">
                    <div>
                      <h4>آخر تحديث</h4>
                      <p>ملاحظة الشركة أو النظام على البلاغ</p>
                    </div>
                  </div>

                  <p className="notification-report-modal__description">{updateNote}</p>

                  {companyResponse?.submittedAt ? (
                    <small className="notification-report-modal__date-note">
                      تاريخ التحديث: {formatDateTime(companyResponse.submittedAt)}
                    </small>
                  ) : null}
                </section>
              ) : null}

              <ReportImageGrid
                title="صور البلاغ قبل الحل"
                subtitle="الصور الأصلية المرفوعة مع البلاغ"
                images={report.images || []}
                emptyMessage="لا توجد صور أصلية متاحة لهذا البلاغ."
              />

              <ReportImageGrid
                title="صور البلاغ بعد الحل"
                subtitle="صور الحل المرفوعة من الشركة إن وجدت"
                images={companyResponse?.images || []}
                emptyMessage="لم يتم رفع صور حل لهذا البلاغ حتى الآن."
              />

              <ReportTimeline timeline={report.timeline || []} />
            </>
          ) : null}
        </div>
      </article>
    </div>
  );
}

function UserNotificationsPage() {
  const { user } = useAuth();
  const userId = resolveUserId(user);

  const [notifications, setNotifications] = useState([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState(
    USER_NOTIFICATION_TYPE.ALL
  );
  const [activeReadFilter, setActiveReadFilter] = useState(READ_FILTERS.ALL);

  const [pageNumber, setPageNumber] = useState(1);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: PAGE_SIZE,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [typeCounts, setTypeCounts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reportModalState, setReportModalState] = useState(
    EMPTY_REPORT_MODAL_STATE
  );

  const selectedTypeFilter = useMemo(
    () =>
      USER_NOTIFICATION_TYPE_FILTERS.find(
        (filter) => filter.value === activeTypeFilter
      ) || USER_NOTIFICATION_TYPE_FILTERS[0],
    [activeTypeFilter]
  );

  const visibleNotifications = notifications;

  const readFilterAllCount = useMemo(
    () =>
      getTypeCount({
        typeCounts,
        type: activeTypeFilter,
        activeTypeFilter,
        totalCount: pagination.totalCount,
        notificationsCount: notifications.length,
      }),
    [activeTypeFilter, notifications.length, pagination.totalCount, typeCounts]
  );

  const loadNotifications = useCallback(
    async ({ showLoading = true } = {}) => {
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        setTypeCounts([]);
        setPagination({
          pageNumber: 1,
          pageSize: PAGE_SIZE,
          totalCount: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        setIsLoading(false);
        setErrorMessage('تعذر تحديد المستخدم الحالي.');
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }

        setErrorMessage('');

        const notificationsResponse = await getUserNotifications({
          userId,
          type: activeTypeFilter,
          isRead: activeReadFilter === READ_FILTERS.UNREAD ? false : undefined,
          pageNumber,
          pageSize: PAGE_SIZE,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        });

        setNotifications(notificationsResponse.items || []);
        setUnreadCount(notificationsResponse.unreadCount || 0);
        setTypeCounts(notificationsResponse.typeCounts || []);

        setPagination({
          pageNumber: notificationsResponse.pageNumber || pageNumber,
          pageSize: notificationsResponse.pageSize || PAGE_SIZE,
          totalCount: notificationsResponse.totalCount || 0,
          totalPages: Math.max(1, notificationsResponse.totalPages || 1),
          hasNextPage: Boolean(notificationsResponse.hasNextPage),
          hasPreviousPage: Boolean(notificationsResponse.hasPreviousPage),
        });
      } catch (error) {
        setErrorMessage(error?.message || 'حدث خطأ أثناء تحميل الإشعارات.');
        setNotifications([]);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [activeReadFilter, activeTypeFilter, pageNumber, userId]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  function handleTypeFilterChange(nextFilter) {
    setActiveTypeFilter(nextFilter);
    setPageNumber(1);
    setIsDesktopFilterOpen(false);
    setIsMobileFilterOpen(false);
  }

  function handleReadFilterChange(nextFilter) {
    setActiveReadFilter(nextFilter);
    setPageNumber(1);
    setIsMobileFilterOpen(false);
  }

  async function refreshAfterAction() {
    await loadNotifications({ showLoading: false });
  }

  function markNotificationAsReadLocally(notificationId) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );

    setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await markUserNotificationAsRead(notificationId);
      await refreshAfterAction();
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء تحديث حالة الإشعار.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadCount || !userId) return;

    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await markAllUserNotificationsAsRead(userId);
      setActiveReadFilter(READ_FILTERS.ALL);
      await refreshAfterAction();
    } catch (error) {
      setErrorMessage(
        error?.message || 'حدث خطأ أثناء تحديد الإشعارات كمقروءة.'
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setIsActionLoading(true);
      setErrorMessage('');

      await deleteUserNotification(notificationId);
      await refreshAfterAction();
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء حذف الإشعار.');
    } finally {
      setIsActionLoading(false);
    }
  };

  async function handleViewNotificationReport(notification) {
    const reportId = notification?.reportId;

    if (!reportId) {
      setErrorMessage('هذا الإشعار غير مرتبط برقم بلاغ صالح.');
      return;
    }

    setErrorMessage('');
    setReportModalState({
      isOpen: true,
      notification,
      report: null,
      isLoading: true,
      errorMessage: '',
    });

    if (!notification.isRead && notification.id) {
      try {
        await markUserNotificationAsRead(notification.id);
        markNotificationAsReadLocally(notification.id);
      } catch {
        // لا نمنع المستخدم من فتح تفاصيل البلاغ لو تحديث حالة القراءة فشل.
      }
    }

    try {
      const reportDetails = await getNotificationReportDetails(reportId);

      setReportModalState({
        isOpen: true,
        notification,
        report: reportDetails,
        isLoading: false,
        errorMessage: '',
      });
    } catch (error) {
      setReportModalState({
        isOpen: true,
        notification,
        report: null,
        isLoading: false,
        errorMessage:
          error?.message ||
          'تعذر تحميل تفاصيل البلاغ المرتبط بهذا الإشعار.',
      });
    }
  }

  function closeReportModal() {
    setReportModalState(EMPTY_REPORT_MODAL_STATE);
  }

  function goToPreviousPage() {
    if (pageNumber <= 1 || isLoading) return;

    setPageNumber((currentPage) => Math.max(1, currentPage - 1));
  }

  function goToNextPage() {
    if (pageNumber >= pagination.totalPages || isLoading) return;

    setPageNumber((currentPage) =>
      Math.min(pagination.totalPages, currentPage + 1)
    );
  }

  return (
    <div className="dashboard-page user-notifications-page">
      <PageHeader
        title="الإشعارات"
        subtitle="تابع تحديثات بلاغاتك والبلاغات التي تتابعها أولًا بأول"
      />

      <section className="user-notifications-panel">
        <div className="user-notifications-toolbar">
          <div className="user-notifications-read-tabs">
            <button
              type="button"
              className={`user-notifications-read-tab ${
                activeReadFilter === READ_FILTERS.ALL ? 'is-active' : ''
              }`}
              onClick={() => handleReadFilterChange(READ_FILTERS.ALL)}
            >
              <span>كل الإشعارات</span>
              <strong>{readFilterAllCount}</strong>
            </button>

            <button
              type="button"
              className={`user-notifications-read-tab ${
                activeReadFilter === READ_FILTERS.UNREAD ? 'is-active' : ''
              }`}
              onClick={() => handleReadFilterChange(READ_FILTERS.UNREAD)}
            >
              <span>غير مقروءة</span>
              <strong>{unreadCount}</strong>
            </button>
          </div>

          <div className="user-notifications-filter-dropdown">
            <button
              type="button"
              className="user-notifications-filter-dropdown__button"
              onClick={() => setIsDesktopFilterOpen((current) => !current)}
              aria-expanded={isDesktopFilterOpen}
              aria-label="فلترة الإشعارات حسب النوع"
            >
              <span className="user-notifications-filter-dropdown__icon">
                <FiFilter />
              </span>

              <span className="user-notifications-filter-dropdown__text">
                <small>فلترة حسب النوع</small>
                <strong>{selectedTypeFilter.label}</strong>
              </span>

              <FiChevronDown className="user-notifications-filter-dropdown__arrow" />
            </button>

            {isDesktopFilterOpen ? (
              <div className="user-notifications-filter-dropdown__menu">
                {USER_NOTIFICATION_TYPE_FILTERS.map((filter) => {
                  const isActive = activeTypeFilter === filter.value;
                  const count = getTypeCount({
                    typeCounts,
                    type: filter.value,
                    activeTypeFilter,
                    totalCount: pagination.totalCount,
                    notificationsCount: notifications.length,
                  });

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      className={`user-notifications-filter-dropdown__item ${
                        isActive ? 'is-active' : ''
                      }`}
                      onClick={() => handleTypeFilterChange(filter.value)}
                    >
                      <span>
                        <strong>{filter.label}</strong>
                        <small>{filter.description}</small>
                      </span>

                      <em>{count}</em>

                      {isActive ? <FiCheck /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="user-notifications-mobile-filter-btn"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <FiFilter />
            <span>فلترة الإشعارات</span>
          </button>

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
          </div>
        </div>

        {errorMessage ? (
          <div className="user-notifications-loading" role="alert">
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="user-notifications-loading">
            <FiRefreshCcw />
            <span>جارٍ تحميل الإشعارات...</span>
          </div>
        ) : (
          <>
            <NotificationsList
              notifications={visibleNotifications}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
              onViewReport={handleViewNotificationReport}
              emptyTitle={
                activeReadFilter === READ_FILTERS.UNREAD
                  ? 'لا توجد إشعارات غير مقروءة'
                  : activeTypeFilter !== USER_NOTIFICATION_TYPE.ALL
                    ? 'لا توجد إشعارات من هذا النوع'
                    : 'لا توجد إشعارات'
              }
              emptyMessage={
                activeReadFilter === READ_FILTERS.UNREAD
                  ? 'لا توجد إشعارات غير مقروءة حسب الفلتر الحالي.'
                  : activeTypeFilter !== USER_NOTIFICATION_TYPE.ALL
                    ? 'جرّب اختيار نوع إشعار آخر.'
                    : 'عند حدوث أي تحديث على بلاغاتك أو البلاغات التي تتابعها سيظهر هنا مباشرة.'
              }
            />

            {pagination.totalPages > 1 ? (
              <div className="user-notifications-pagination">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={pageNumber <= 1 || isLoading}
                >
                  السابق
                </button>

                <span>
                  صفحة {pageNumber} من {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={pageNumber >= pagination.totalPages || isLoading}
                >
                  التالي
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {isMobileFilterOpen ? (
        <div
          className="user-notifications-filter-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="فلترة الإشعارات"
        >
          <button
            type="button"
            className="user-notifications-filter-sheet__backdrop"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-label="إغلاق الفلترة"
          />

          <div className="user-notifications-filter-sheet__content">
            <div className="user-notifications-filter-sheet__handle" />

            <div className="user-notifications-filter-sheet__header">
              <div>
                <h3>فلترة الإشعارات</h3>
                <p>اختر حالة القراءة ونوع الإشعار</p>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="إغلاق"
              >
                <FiX />
              </button>
            </div>

            <div className="user-notifications-filter-sheet__group">
              <h4>حالة القراءة</h4>

              <div className="user-notifications-filter-sheet__read-options">
                <button
                  type="button"
                  className={`user-notifications-read-tab ${
                    activeReadFilter === READ_FILTERS.ALL ? 'is-active' : ''
                  }`}
                  onClick={() => handleReadFilterChange(READ_FILTERS.ALL)}
                >
                  <span>كل الإشعارات</span>
                  <strong>{readFilterAllCount}</strong>
                </button>

                <button
                  type="button"
                  className={`user-notifications-read-tab ${
                    activeReadFilter === READ_FILTERS.UNREAD ? 'is-active' : ''
                  }`}
                  onClick={() => handleReadFilterChange(READ_FILTERS.UNREAD)}
                >
                  <span>غير مقروءة</span>
                  <strong>{unreadCount}</strong>
                </button>
              </div>
            </div>

            <div className="user-notifications-filter-sheet__group">
              <h4>نوع الإشعار</h4>

              <div className="user-notifications-filter-sheet__options">
                {USER_NOTIFICATION_TYPE_FILTERS.map((filter) => {
                  const isActive = activeTypeFilter === filter.value;
                  const count = getTypeCount({
                    typeCounts,
                    type: filter.value,
                    activeTypeFilter,
                    totalCount: pagination.totalCount,
                    notificationsCount: notifications.length,
                  });

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      className={`user-notifications-filter-sheet__option ${
                        isActive ? 'is-active' : ''
                      }`}
                      onClick={() => handleTypeFilterChange(filter.value)}
                    >
                      <span>
                        <strong>{filter.label}</strong>
                        <small>{filter.description}</small>
                      </span>

                      <em>{count}</em>

                      {isActive ? <FiCheck /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <NotificationReportModal
        modalState={reportModalState}
        onClose={closeReportModal}
      />
    </div>
  );
}

export default UserNotificationsPage;
