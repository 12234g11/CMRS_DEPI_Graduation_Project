import { FiBell, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function formatDate(value) {
  if (!value) return '—';

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsedDate);
}

function NearbyIssueDetails({
  issue,
  currentLocation = null,
  onRequestDirections,
  onClearSelection,
  onToggleFollow,
  onToggleVerify,
  activeAction = '',
  inline = false,
}) {
  if (!issue) return null;

  const hasCurrentLocation = Boolean(
    currentLocation?.lat && currentLocation?.lng
  );

  const reportId = issue.reportId || issue.id;
  const currentVerifyVote = Number(issue.currentUserVerifyVote || 0);
  const isPositiveVerified =
    issue.isVerifiedByCurrentUser && currentVerifyVote !== -1;
  const isNegativeVerified =
    issue.isVerifiedByCurrentUser && currentVerifyVote === -1;

  const isFollowLoading = activeAction === `follow:${reportId}`;
  const isVerifyUpLoading = activeAction === `verify:${reportId}:1`;
  const isVerifyDownLoading = activeAction === `verify:${reportId}:-1`;

  const canToggleFollow =
    issue.canCurrentUserFollow !== false || issue.isFollowedByCurrentUser;

  const canToggleVerify =
    issue.canCurrentUserVerify !== false || issue.isVerifiedByCurrentUser;

  const handleRouteClick = () => {
    if (!hasCurrentLocation) {
      window.alert(
        'فعّل موقعك الحالي الأول من زر تحديد الموقع الموجود على الخريطة، وبعدها اضغط عرض أقصر طريق.'
      );
      return;
    }

    onRequestDirections?.(issue);
  };

  return (
    <div
      className={`nearby-issue-details ${
        inline ? 'nearby-issue-details--inline' : ''
      }`}
    >
      <div className="nearby-issue-details__header">
        <div>
          <h3>{issue.title}</h3>
          <p>{issue.area}</p>
        </div>

        <span
          className={`nearby-issue-details__status nearby-issue-details__status--${issue.tone}`}
        >
          {issue.statusLabel}
        </span>
      </div>

      <p className="nearby-issue-details__description">
        {issue.description}
      </p>

      <div className="nearby-issue-details__grid">
        <div className="nearby-issue-details__item">
          <span>رقم البلاغ</span>
          <strong>{issue.reportNumber || reportId}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>المسافة</span>
          <strong>{issue.distanceLabel || issue.distance || '—'}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>تاريخ الإبلاغ</span>
          <strong>
            {formatDate(issue.reportedAt || issue.createdAt || issue.date)}
          </strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>الفئة</span>
          <strong>{issue.category || issue.issueCategoryName || 'أخرى'}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>الأولوية</span>
          <strong>{issue.priorityLabel || issue.priority || '—'}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>مقدم البلاغ</span>
          <strong>{issue.ownerUserName || '—'}</strong>
        </div>
      </div>

      <div className="nearby-issue-details__address">
        <span>العنوان التفصيلي</span>
        <strong>{issue.address || 'لم يتم تحديد العنوان'}</strong>
      </div>

      {issue.reportImages?.length ? (
        <div className="nearby-issue-details__images">
          {issue.reportImages.map((image) => (
            <img
              key={image.imageId || image.imageUrl}
              src={image.fullImageUrl || image.imageUrl}
              alt={issue.title}
            />
          ))}
        </div>
      ) : null}

      <div className="nearby-issue-details__community">
        <button
          type="button"
          className={`nearby-issue-details__community-btn nearby-issue-details__community-btn--follow ${
            issue.isFollowedByCurrentUser ? 'is-active' : ''
          }`}
          onClick={() => onToggleFollow?.(issue)}
          disabled={!canToggleFollow || isFollowLoading}
          title={issue.isFollowedByCurrentUser ? 'إلغاء متابعة البلاغ' : 'متابعة البلاغ'}
        >
          <span className="nearby-issue-details__community-icon" aria-hidden="true">
            <FiBell />
          </span>

          <span className="nearby-issue-details__community-content">
            <strong>{issue.isFollowedByCurrentUser ? 'إلغاء المتابعة' : 'متابعة'}</strong>
            <small>
              <span className="nearby-issue-details__community-count">
                {issue.followersCount ?? 0}
              </span>
              متابع
            </small>
          </span>
        </button>

        <button
          type="button"
          className={`nearby-issue-details__community-btn nearby-issue-details__community-btn--upvote ${
            isPositiveVerified ? 'is-active' : ''
          }`}
          onClick={() => onToggleVerify?.(issue, 1)}
          disabled={!canToggleVerify || isVerifyUpLoading}
          title={isPositiveVerified ? 'إلغاء تصديق البلاغ' : 'البلاغ صحيح'}
        >
          <span className="nearby-issue-details__community-icon" aria-hidden="true">
            <FiCheckCircle />
          </span>

          <span className="nearby-issue-details__community-content">
            <strong>{isPositiveVerified ? 'إلغاء التصديق' : 'البلاغ صحيح'}</strong>
            <small>
              <span className="nearby-issue-details__community-count">
                {issue.upvoteCount ?? 0}
              </span>
              تصديق
            </small>
          </span>
        </button>

        <button
          type="button"
          className={`nearby-issue-details__community-btn nearby-issue-details__community-btn--downvote ${
            isNegativeVerified ? 'is-active' : ''
          }`}
          onClick={() => onToggleVerify?.(issue, -1)}
          disabled={!canToggleVerify || isVerifyDownLoading}
          title={isNegativeVerified ? 'إلغاء تكذيب البلاغ' : 'البلاغ غير صحيح'}
        >
          <span className="nearby-issue-details__community-icon" aria-hidden="true">
            <FiXCircle />
          </span>

          <span className="nearby-issue-details__community-content">
            <strong>{isNegativeVerified ? 'إلغاء عدم الصحة' : 'البلاغ غير صحيح'}</strong>
            <small>
              <span className="nearby-issue-details__community-count">
                {issue.downvoteCount ?? 0}
              </span>
              تكذيب
            </small>
          </span>
        </button>
      </div>

      <div className="nearby-issue-details__actions">
        <button
          type="button"
          className="nearby-issue-details__route-btn"
          onClick={handleRouteClick}
        >
          عرض أقصر طريق من موقعك الحالي
        </button>

        {!hasCurrentLocation && (
          <p className="nearby-issue-details__helper-text">
            فعّل موقعك الحالي من زر الخريطة ليتم حساب المسار والمسافة الدقيقة.
          </p>
        )}

        <button
          type="button"
          className="nearby-issue-details__clear-btn"
          onClick={() => onClearSelection?.()}
        >
          إلغاء تحديد المشكلة
        </button>
      </div>
    </div>
  );
}

export default NearbyIssueDetails;