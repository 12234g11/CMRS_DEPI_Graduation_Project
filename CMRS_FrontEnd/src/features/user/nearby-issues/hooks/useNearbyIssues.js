import { useCallback, useEffect, useState } from 'react';
import {
  getNearbyReports,
  NEARBY_REPORT_STATUS_API_VALUES,
} from '../api/nearbyIssuesApi';

function useNearbyIssues(
  currentLocation = null,
  pageNumber = 1,
  statusFilter = NEARBY_REPORT_STATUS_API_VALUES.all
) {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function loadNearbyIssues() {
      if (currentLocation?.lat == null || currentLocation?.lng == null) {
        setIssues([]);
        setErrorMessage('');
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');

        const nextIssues = await getNearbyReports({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          pageNumber,
          status: statusFilter,
        });

        if (!isCancelled) {
          setIssues(nextIssues);
        }
      } catch (error) {
        if (!isCancelled) {
          setIssues([]);
          setErrorMessage(
            error?.message || 'تعذر تحميل البلاغات القريبة حاليًا.'
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadNearbyIssues();

    return () => {
      isCancelled = true;
    };
  }, [
    currentLocation?.lat,
    currentLocation?.lng,
    pageNumber,
    statusFilter,
  ]);

  const updateIssue = useCallback((reportId, updater) => {
    setIssues((currentIssues) =>
      currentIssues.map((issue) => {
        const issueId = issue.reportId || issue.id;

        if (String(issueId) !== String(reportId)) {
          return issue;
        }

        if (typeof updater === 'function') {
          return updater(issue);
        }

        return {
          ...issue,
          ...updater,
        };
      })
    );
  }, []);

  return {
    issues,
    isLoading,
    errorMessage,
    updateIssue,
  };
}

export default useNearbyIssues;