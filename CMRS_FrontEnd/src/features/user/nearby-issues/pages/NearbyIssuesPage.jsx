import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import MapFilters from '../../../map/components/MapFilters';
import MapLegend from '../../../map/components/MapLegend';
import ReportsMap from '../../../map/components/ReportsMap';
import NearbyIssuesList from '../components/NearbyIssuesList';
import {
  followReport,
  rateReport,
  unfollowReport,
  unrateReport,
  unverifyReport,
  verifyReport,
} from '../api/nearbyIssuesApi';
import useNearbyIssues from '../hooks/useNearbyIssues';
import useNearbyIssueDistances from '../hooks/useNearbyIssueDistances';
import { reportMapLegend } from '../../../map/mocks/mapMockData';

const FILTER_OPTIONS = [
  { label: 'الكل', value: 'all' },
  { label: 'قيد المراجعة', value: 'warning' },
  { label: 'جاري الحل', value: 'info' },
  { label: 'تم الحل', value: 'success' },
];

const NEARBY_RADIUS_KM = 5;
const NEARBY_PAGE_NUMBER = 1;

function isResolvedIssue(issue = {}) {
  return issue.status === 'Resolved' || issue.tone === 'success';
}

function getIssueReportId(issue = {}) {
  return issue.reportId || issue.id;
}

function NearbyIssuesPage() {
  const location = useLocation();

  const [activeFilter, setActiveFilter] = useState('all');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [routeIssueId, setRouteIssueId] = useState(null);
  const [activeAction, setActiveAction] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const {
    issues: apiNearbyIssues,
    isLoading,
    errorMessage,
    updateIssue,
  } = useNearbyIssues(currentLocation, NEARBY_PAGE_NUMBER);

  const issuesWithAccurateDistances = useNearbyIssueDistances(
    apiNearbyIssues,
    currentLocation
  );

  const filteredIssues = useMemo(() => {
    if (activeFilter === 'all') {
      return issuesWithAccurateDistances;
    }

    return issuesWithAccurateDistances.filter(
      (issue) => issue.tone === activeFilter
    );
  }, [activeFilter, issuesWithAccurateDistances]);

  useEffect(() => {
    const issueId =
      location.state?.selectedIssueId ||
      location.state?.highlightIssueId ||
      null;

    if (!issueId) return;

    setActiveFilter('all');
    setSelectedIssueId(issueId);
    setRouteIssueId(null);

    const timer = window.setTimeout(() => {
      document
        .querySelector(`[data-nearby-issue-id="${issueId}"]`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [location.state]);

  useEffect(() => {
    if (
      selectedIssueId &&
      !filteredIssues.some(
        (issue) => String(issue.id) === String(selectedIssueId)
      )
    ) {
      setSelectedIssueId(null);
    }

    if (
      routeIssueId &&
      !filteredIssues.some(
        (issue) => String(issue.id) === String(routeIssueId)
      )
    ) {
      setRouteIssueId(null);
    }
  }, [filteredIssues, routeIssueId, selectedIssueId]);

  const routeIssue = useMemo(
    () =>
      issuesWithAccurateDistances.find(
        (issue) => String(issue.id) === String(routeIssueId)
      ) || null,
    [issuesWithAccurateDistances, routeIssueId]
  );

  const mapMarkers = useMemo(
    () =>
      filteredIssues.map((issue) => ({
        ...issue,
        subtitle: issue.area,
      })),
    [filteredIssues]
  );

  const handleSelectIssue = (issue) => {
    if (!issue?.id) return;

    setRouteIssueId(null);

    setSelectedIssueId((currentId) =>
      String(currentId) === String(issue.id) ? null : issue.id
    );
  };

  const handleClearSelection = () => {
    setSelectedIssueId(null);
    setRouteIssueId(null);
  };

  const handleRequestDirections = (issue) => {
    if (!issue?.id) return;

    if (!currentLocation?.lat || !currentLocation?.lng) {
      window.alert(
        'فعّل موقعك الحالي من زر تحديد الموقع الموجود على الخريطة أولًا.'
      );
      return;
    }

    setSelectedIssueId(issue.id);
    setRouteIssueId(issue.id);
  };

  const handleToggleFollow = async (issue) => {
    const reportId = getIssueReportId(issue);
    if (!reportId) return;

    setActionError('');
    setActionMessage('');
    setActiveAction(`follow:${reportId}`);

    try {
      const data = issue.isFollowedByCurrentUser
        ? await unfollowReport(reportId)
        : await followReport(reportId);

      updateIssue(reportId, (currentIssue) => ({
        ...currentIssue,
        followersCount: data.followersCount ?? currentIssue.followersCount,
        isFollowedByCurrentUser:
          data.isFollowedByCurrentUser ?? !currentIssue.isFollowedByCurrentUser,
        canCurrentUserFollow:
          data.canCurrentUserFollow ?? currentIssue.canCurrentUserFollow,
      }));

      setActionMessage(
        data.isFollowedByCurrentUser === false
          ? 'تم إلغاء متابعة البلاغ.'
          : 'تم تحديث متابعة البلاغ بنجاح.'
      );
    } catch (error) {
      setActionError(error?.message || 'تعذر تحديث متابعة البلاغ حاليًا.');
    } finally {
      setActiveAction('');
    }
  };

  const handleToggleVerify = async (issue, vote = 1) => {
    const reportId = getIssueReportId(issue);
    if (!reportId) return;

    const normalizedVote = Number(vote) === -1 ? -1 : 1;
    const currentVote = Number(issue.currentUserVerifyVote || 0);

    const shouldRemoveCurrentVote =
      issue.isVerifiedByCurrentUser && currentVote === normalizedVote;

    setActionError('');
    setActionMessage('');
    setActiveAction(`verify:${reportId}:${normalizedVote}`);

    try {
      const data = shouldRemoveCurrentVote
        ? await unverifyReport(reportId)
        : await verifyReport(reportId, normalizedVote);

      updateIssue(reportId, (currentIssue) => {
        const nextIsVerified =
          data.isVerifiedByCurrentUser ?? !shouldRemoveCurrentVote;

        const nextVote = nextIsVerified
          ? data.currentUserVerifyVote ??
            data.verifyVote ??
            data.userVerifyVote ??
            data.userVote ??
            normalizedVote
          : null;

        return {
          ...currentIssue,
          verifyCount: data.verifyCount ?? currentIssue.verifyCount,
          isVerifiedByCurrentUser: nextIsVerified,
          canCurrentUserVerify:
            data.canCurrentUserVerify ?? currentIssue.canCurrentUserVerify,
          currentUserVerifyVote: nextVote,
        };
      });

      if (shouldRemoveCurrentVote) {
        setActionMessage('تم إلغاء تصويتك على البلاغ.');
      } else if (normalizedVote === 1) {
        setActionMessage('تم تأكيد صحة البلاغ بنجاح.');
      } else {
        setActionMessage('تم تسجيل أن البلاغ غير صحيح.');
      }
    } catch (error) {
      setActionError(error?.message || 'تعذر تحديث تأكيد البلاغ حاليًا.');
    } finally {
      setActiveAction('');
    }
  };

  const handleToggleRating = async (issue) => {
    const reportId = getIssueReportId(issue);
    if (!reportId) return;

    if (!isResolvedIssue(issue)) {
      setActionError('تقييم جودة الحل متاح فقط بعد أن تصبح حالة البلاغ: تم الحل.');
      return;
    }

    setActionError('');
    setActionMessage('');
    setActiveAction(`rating:${reportId}`);

    try {
      const data = issue.isRatedByCurrentUser
        ? await unrateReport(reportId)
        : await rateReport(reportId);

      updateIssue(reportId, (currentIssue) => ({
        ...currentIssue,
        ratingCount: data.ratingCount ?? currentIssue.ratingCount,
        isRatedByCurrentUser:
          data.isRatedByCurrentUser ?? !currentIssue.isRatedByCurrentUser,
        canCurrentUserRate:
          data.canCurrentUserRate ?? currentIssue.canCurrentUserRate,
      }));

      setActionMessage(
        data.isRatedByCurrentUser === false
          ? 'تم إلغاء تقييم جودة الحل.'
          : 'تم تقييم جودة الحل بنجاح.'
      );
    } catch (error) {
      setActionError(error?.message || 'تعذر تحديث تقييم البلاغ حاليًا.');
    } finally {
      setActiveAction('');
    }
  };

  const emptyMessage = !currentLocation
    ? 'فعّل موقعك الحالي من الخريطة لعرض البلاغات القريبة منك.'
    : isLoading
      ? 'جاري تحميل البلاغات القريبة...'
      : errorMessage || 'لا توجد بلاغات قريبة ضمن النطاق الحالي.';

  return (
    <div className="dashboard-page">
      <PageHeader
        title="مشاكل قريبة منك"
        subtitle={`Nearby Issues — البلاغات القريبة ضمن نطاق ${NEARBY_RADIUS_KM} كم`}
      />

      <MapFilters
        options={FILTER_OPTIONS}
        value={activeFilter}
        onChange={setActiveFilter}
      />

      {errorMessage ? (
        <p className="add-report-form__message add-report-form__message--error">
          {errorMessage}
        </p>
      ) : null}

      {actionError ? (
        <p className="add-report-form__message add-report-form__message--error">
          {actionError}
        </p>
      ) : null}

      {actionMessage ? (
        <p className="add-report-form__message add-report-form__message--success">
          {actionMessage}
        </p>
      ) : null}

      <div className="dashboard-content-grid">
        <DashboardSectionCard
          title="الخريطة"
          subtitle="Reports Map"
          action={<MapLegend items={reportMapLegend} compact />}
        >
          <ReportsMap
            markers={mapMarkers}
            height={420}
            activeMarkerId={selectedIssueId}
            onMarkerSelect={handleSelectIssue}
            onCurrentLocationChange={setCurrentLocation}
            routeDestination={routeIssue}
          />
        </DashboardSectionCard>

        <DashboardSectionCard
          title="القائمة"
          subtitle={
            currentLocation
              ? `${filteredIssues.length} بلاغ قريب`
              : 'Nearby Issues List'
          }
        >
          <NearbyIssuesList
            issues={filteredIssues}
            activeIssueId={selectedIssueId}
            onSelectIssue={handleSelectIssue}
            currentLocation={currentLocation}
            onRequestDirections={handleRequestDirections}
            onClearSelection={handleClearSelection}
            onToggleFollow={handleToggleFollow}
            onToggleVerify={handleToggleVerify}
            onToggleRating={handleToggleRating}
            activeAction={activeAction}
            emptyMessage={emptyMessage}
          />
        </DashboardSectionCard>
      </div>
    </div>
  );
}

export default NearbyIssuesPage;