import { PiArrowCircleLeftBold } from 'react-icons/pi';
import NearbyIssueDetails from './NearbyIssueDetails';

function NearbyIssuesList({
  issues = [],
  activeIssueId = null,
  onSelectIssue,
  currentLocation = null,
  onRequestDirections,
  onClearSelection,
}) {
  return (
    <div className="dashboard-side-list">
      {issues.map((issue) => {
        const isActive = issue.id === activeIssueId;

        return (
          <div
            key={issue.id}
            className={`dashboard-side-list__entry ${isActive ? 'is-active' : ''}`}
          >
            <button
              type="button"
              className="dashboard-side-list__item"
              onClick={() => onSelectIssue?.(issue)}
            >
              <div className="dashboard-side-list__content">
                <strong className="dashboard-side-list__title">{issue.title}</strong>
                <span className="dashboard-side-list__meta">
                  {issue.distanceLabel || issue.distance}
                </span>
              </div>

              <span
                className={`dashboard-mini-icon ${isActive ? 'is-expanded' : ''}`}
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