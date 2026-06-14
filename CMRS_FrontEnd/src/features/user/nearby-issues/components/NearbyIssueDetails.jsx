function NearbyIssueDetails({
  issue,
  currentLocation = null,
  onRequestDirections,
  onClearSelection,
  inline = false,
}) {
  if (!issue) return null;

  const hasCurrentLocation = Boolean(currentLocation?.lat && currentLocation?.lng);

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
      className={`nearby-issue-details ${inline ? 'nearby-issue-details--inline' : ''}`}
    >
      <div className="nearby-issue-details__header">
        <div>
          <h3>{issue.title}</h3>
          <p>{issue.area}</p>
        </div>

        <span className={`nearby-issue-details__status nearby-issue-details__status--${issue.tone}`}>
          {issue.statusLabel}
        </span>
      </div>

      <p className="nearby-issue-details__description">{issue.description}</p>

      <div className="nearby-issue-details__grid">
        <div className="nearby-issue-details__item">
          <span>رقم البلاغ</span>
          <strong>{issue.reportNumber}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>المسافة</span>
          <strong>{issue.distanceLabel || issue.distance}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>تاريخ الإبلاغ</span>
          <strong>{issue.reportedAt}</strong>
        </div>

        <div className="nearby-issue-details__item">
          <span>الفئة</span>
          <strong>{issue.category}</strong>
        </div>
      </div>

      <div className="nearby-issue-details__address">
        <span>العنوان التفصيلي</span>
        <strong>{issue.address}</strong>
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