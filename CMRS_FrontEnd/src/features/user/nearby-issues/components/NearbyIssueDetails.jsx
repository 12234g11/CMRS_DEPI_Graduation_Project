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

function isResolvedIssue(issue = {}) {
  return issue.status === 'Resolved' || issue.tone === 'success';
}

function NearbyIssueDetails({
  issue,
  currentLocation = null,
  onRequestDirections,
  onClearSelection,
  onToggleFollow,
  onToggleVerify,
  onToggleRating,
  activeAction = '',
  inline = false,
}) {
  if (!issue) return null;

  const hasCurrentLocation = Boolean(
    currentLocation?.lat && currentLocation?.lng
  );

  const reportId = issue.reportId || issue.id;
  const isResolved = isResolvedIssue(issue);

  const currentVerifyVote = Number(issue.currentUserVerifyVote || 0);
  const isPositiveVerified =
    issue.isVerifiedByCurrentUser && currentVerifyVote !== -1;
  const isNegativeVerified =
    issue.isVerifiedByCurrentUser && currentVerifyVote === -1;

  const isFollowLoading = activeAction === `follow:${reportId}`;
  const isVerifyUpLoading = activeAction === `verify:${reportId}:1`;
  const isVerifyDownLoading = activeAction === `verify:${reportId}:-1`;
  const isRatingLoading = activeAction === `rating:${reportId}`;

  const canToggleFollow =
    issue.canCurrentUserFollow !== false || issue.isFollowedByCurrentUser;

  const canToggleVerify =
    issue.canCurrentUserVerify !== false || issue.isVerifiedByCurrentUser;

  const canToggleRating =
    isResolved &&
    (issue.canCurrentUserRate !== false || issue.isRatedByCurrentUser);

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
          className={`nearby-issue-details__community-btn ${
            issue.isFollowedByCurrentUser ? 'is-active' : ''
          }`}
          onClick={() => onToggleFollow?.(issue)}
          disabled={!canToggleFollow || isFollowLoading}
        >
          <span>{issue.followersCount ?? 0}</span>
          {issue.isFollowedByCurrentUser ? 'إلغاء المتابعة' : 'متابعة'}
        </button>

        <button
          type="button"
          className={`nearby-issue-details__community-btn ${
            isPositiveVerified ? 'is-active' : ''
          }`}
          onClick={() => onToggleVerify?.(issue, 1)}
          disabled={!canToggleVerify || isVerifyUpLoading}
        >
          <span>{issue.verifyCount ?? 0}</span>
          {isPositiveVerified ? 'إلغاء التأكيد' : 'البلاغ صحيح'}
        </button>

        <button
          type="button"
          className={`nearby-issue-details__community-btn ${
            isNegativeVerified ? 'is-active' : ''
          }`}
          onClick={() => onToggleVerify?.(issue, -1)}
          disabled={!canToggleVerify || isVerifyDownLoading}
        >
          {isNegativeVerified ? 'إلغاء عدم الصحة' : 'البلاغ غير صحيح'}
        </button>

        <button
          type="button"
          className={`nearby-issue-details__community-btn ${
            issue.isRatedByCurrentUser ? 'is-active' : ''
          }`}
          onClick={() => onToggleRating?.(issue)}
          disabled={!canToggleRating || isRatingLoading}
          title={
            isResolved
              ? undefined
              : 'التقييم متاح فقط بعد تحويل حالة البلاغ إلى تم الحل'
          }
        >
          <span>{issue.ratingCount ?? 0}</span>
          {issue.isRatedByCurrentUser ? 'إلغاء تقييم الحل' : 'تقييم جودة الحل'}
        </button>
      </div>

      {!isResolved ? (
        <p className="nearby-issue-details__helper-text">
          تقييم جودة الحل يظهر بعد أن تصبح حالة البلاغ: تم الحل.
        </p>
      ) : null}

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