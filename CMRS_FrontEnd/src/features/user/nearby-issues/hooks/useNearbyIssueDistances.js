import { useEffect, useMemo, useState } from 'react';
import {
  calculateCrowDistanceMeters,
  formatDistanceFromMeters,
  getRouteMatrixFromCurrentLocation,
} from '../../../map/api/mapRoutingApi';

function useNearbyIssueDistances(issues = [], currentLocation = null) {
  const [distanceMap, setDistanceMap] = useState({});

  useEffect(() => {
    let isCancelled = false;

    if (!currentLocation?.lat || !currentLocation?.lng || !issues.length) {
      setDistanceMap({});
      return undefined;
    }

    const fallbackDistanceMap = issues.reduce((accumulator, issue) => {
      if (!issue?.position?.lat || !issue?.position?.lng) {
        return accumulator;
      }

      const fallbackDistance = calculateCrowDistanceMeters(
        currentLocation,
        issue.position
      );

      if (fallbackDistance) {
        accumulator[issue.id] = {
          distanceMeters: fallbackDistance,
          distanceLabel: formatDistanceFromMeters(fallbackDistance),
          isApproximate: true,
        };
      }

      return accumulator;
    }, {});

    setDistanceMap(fallbackDistanceMap);

    getRouteMatrixFromCurrentLocation(currentLocation, issues)
      .then((nextDistanceMap) => {
        if (
          !isCancelled &&
          nextDistanceMap &&
          Object.keys(nextDistanceMap).length
        ) {
          setDistanceMap(nextDistanceMap);
        }
      })
      .catch(() => {
        // Keep fallback straight-line distance.
      });

    return () => {
      isCancelled = true;
    };
  }, [currentLocation, issues]);

  return useMemo(
    () =>
      issues.map((issue) => {
        const issueDistance = distanceMap[issue.id];

        if (!issueDistance) {
          return issue;
        }

        return {
          ...issue,
          distance: issueDistance.distanceLabel,
          distanceLabel: issueDistance.distanceLabel,
          distanceMeters: issueDistance.distanceMeters,
          isApproximateDistance: issueDistance.isApproximate || false,
        };
      }),
    [distanceMap, issues]
  );
}

export default useNearbyIssueDistances;