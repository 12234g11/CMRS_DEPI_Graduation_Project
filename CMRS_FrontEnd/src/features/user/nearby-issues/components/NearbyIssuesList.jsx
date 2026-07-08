import { PiArrowCircleLeftBold } from 'react-icons/pi';
import NearbyIssueDetails from './NearbyIssueDetails';

function NearbyIssuesList({
  issues = [],
  activeIssueId = null,
  highlightedIssueId = null,
  onSelectIssue,
  currentLocation = null,
  onRequestDirections,
  onClearSelection,
  onToggleFollow,
  onToggleVerify,
  onToggleRating,
  activeAction = '',
  emptyMessage = 'لا توجد بلاغات قريبة لعرضها حاليًا.',
}) {
  if (!issues.length) {
    return <p className="no-data-message">{emptyMessage}</p>;
  }

  return (
    <div className="dashboard-side-list">
      {issues.map((issue) => {
        const isActive = String(issue.id) === String(activeIssueId);
        const isHighlighted =
          highlightedIssueId && String(issue.id) === String(highlightedIssueId);

        return (
          <div
            key={issue.id}
            data-nearby-issue-id={issue.id}
            className={`dashboard-side-list__entry ${
              isActive ? 'is-active' : ''
            } ${isHighlighted ? 'is-notification-highlight' : ''}`.trim()}
          >
            <button
              type="button"
              className="dashboard-side-list__item"
              onClick={() => onSelectIssue?.(issue)}
            >
              <div className="dashboard-side-list__content">
                <strong className="dashboard-side-list__title">
                  {issue.title}
                </strong>

                <span className="dashboard-side-list__meta">
                  {issue.distanceLabel || issue.distance || issue.area}
                </span>
              </div>

              <span
                className={`dashboard-mini-icon ${
                  isActive ? 'is-expanded' : ''
                }`}
                aria-hidden="true"
              >
                <PiArrowCircleLeftBold size={38} />
              </span>
            </button>

            {isActive ? (
              <NearbyIssueDetails
                issue={issue}
                currentLocation={currentLocation}
                onRequestDirections={onRequestDirections}
                onClearSelection={onClearSelection}
                onToggleFollow={onToggleFollow}
                onToggleVerify={onToggleVerify}
                onToggleRating={onToggleRating}
                activeAction={activeAction}
                inline
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default NearbyIssuesList;