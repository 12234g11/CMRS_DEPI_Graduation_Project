import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiCheck, FiChevronDown, FiFilter, FiMapPin, FiX } from 'react-icons/fi';

import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import ReportsMap from '../../../map/components/ReportsMap';
import NearbyIssuesList from '../components/NearbyIssuesList';

import {
  followReport,
  NEARBY_REPORT_STATUS_API_VALUES,
  NEARBY_STATUS_FILTER_OPTIONS,
  NEARBY_STATUS_LEGEND_ITEMS,
  rateReport,
  unfollowReport,
  unrateReport,
  unverifyReport,
  verifyReport,
} from '../api/nearbyIssuesApi';

import useNearbyIssues from '../hooks/useNearbyIssues';
import useNearbyIssueDistances from '../hooks/useNearbyIssueDistances';

const NEARBY_RADIUS_KM = 5;
const NEARBY_PAGE_NUMBER = 1;

function isResolvedIssue(issue = {}) {
  return (
    issue.statusKey === 'Resolved' ||
    issue.status === 'Resolved' ||
    issue.tone === 'success'
  );
}

function getIssueReportId(issue = {}) {
  return issue.reportId || issue.id;
}

function getActiveFilterLabel(activeFilter) {
  const option = NEARBY_STATUS_FILTER_OPTIONS.find(
    (item) => item.value === activeFilter
  );

  return option?.label || 'كل الحالات';
}

function getFilterDotClass(statusValue) {
  if (statusValue === NEARBY_REPORT_STATUS_API_VALUES.accepted) {
    return 'accepted';
  }

  if (statusValue === NEARBY_REPORT_STATUS_API_VALUES.assigned) {
    return 'assigned';
  }

  if (statusValue === NEARBY_REPORT_STATUS_API_VALUES.inProgress) {
    return 'in-progress';
  }

  if (statusValue === NEARBY_REPORT_STATUS_API_VALUES.resolved) {
    return 'resolved';
  }

  return 'all';
}

function NearbyStatusLegend() {
  return (
    <section className="nearby-status-panel" dir="rtl">
      <div className="nearby-status-panel__header">
        <div>
          <h2>معنى ألوان الحالات</h2>
          <p>
            البلاغات القريبة تعرض الحالات العامة المسموح للمستخدمين القريبين
            برؤيتها فقط.
          </p>
        </div>
      </div>

      <div className="nearby-status-panel__grid">
        {NEARBY_STATUS_LEGEND_ITEMS.map((item) => (
          <div key={item.id} className="nearby-status-panel__card">
            <div className="nearby-status-panel__title-row">
              <span
                className={`nearby-status-panel__dot nearby-status-panel__dot--${item.dotClassName}`}
                aria-hidden="true"
              />
              <strong>{item.label}</strong>
            </div>

            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function NearbyFilterDropdown({ activeFilter, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeOption =
    NEARBY_STATUS_FILTER_OPTIONS.find(
      (option) => option.value === activeFilter
    ) || NEARBY_STATUS_FILTER_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleClickOutside(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  function handleSelect(value) {
    onChange?.(value);
    setIsOpen(false);
  }

  return (
    <div className="nearby-filter-dropdown" ref={dropdownRef}>
      <span className="nearby-filter-dropdown__label">الحالة</span>

      <button
        type="button"
        className={`nearby-filter-dropdown__button ${
          isOpen ? 'is-open' : ''
        }`}
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="nearby-filter-dropdown__selected">
          <span
            className={`nearby-filter-dropdown__status-dot nearby-filter-dropdown__status-dot--${getFilterDotClass(
              activeOption.value
            )}`}
            aria-hidden="true"
          />
          {activeOption.label}
        </span>

        <FiChevronDown className="nearby-filter-dropdown__chevron" />
      </button>

      {isOpen ? (
        <div className="nearby-filter-dropdown__menu" role="listbox">
          {NEARBY_STATUS_FILTER_OPTIONS.map((option) => {
            const isActive = option.value === activeFilter;

            return (
              <button
                key={option.value}
                type="button"
                className={`nearby-filter-dropdown__option ${
                  isActive ? 'is-active' : ''
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={isActive}
              >
                <span className="nearby-filter-dropdown__option-content">
                  <span
                    className={`nearby-filter-dropdown__status-dot nearby-filter-dropdown__status-dot--${getFilterDotClass(
                      option.value
                    )}`}
                    aria-hidden="true"
                  />
                  {option.label}
                </span>

                {isActive ? <FiCheck /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function NearbyFilterBottomSheet({
  isOpen,
  activeFilter,
  onClose,
  onChange,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="nearby-filter-sheet" dir="rtl">
      <button
        type="button"
        className="nearby-filter-sheet__backdrop"
        aria-label="إغلاق الفلتر"
        onClick={onClose}
      />

      <div className="nearby-filter-sheet__panel">
        <div className="nearby-filter-sheet__handle" />

        <div className="nearby-filter-sheet__header">
          <div>
            <h3>فلترة البلاغات القريبة</h3>
            <p>اختر الحالة التي تريد عرضها.</p>
          </div>

          <button
            type="button"
            className="nearby-filter-sheet__close"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <FiX />
          </button>
        </div>

        <div className="nearby-filter-sheet__options">
          {NEARBY_STATUS_FILTER_OPTIONS.map((option) => {
            const isActive = activeFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`nearby-filter-sheet__option ${
                  isActive ? 'is-active' : ''
                }`}
                onClick={() => onChange(option.value)}
              >
                <span className="nearby-filter-sheet__option-content">
                  <span
                    className={`nearby-filter-sheet__dot nearby-filter-sheet__dot--${getFilterDotClass(
                      option.value
                    )}`}
                    aria-hidden="true"
                  />
                  {option.label}
                </span>

                {isActive ? (
                  <strong className="nearby-filter-sheet__selected-badge">
                    محدد
                  </strong>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NearbyIssuesPage() {
  const location = useLocation();
  const mapCardRef = useRef(null);
  const listCardRef = useRef(null);
  const autoRequestedLocationRef = useRef(false);

  const [activeFilter, setActiveFilter] = useState(
    NEARBY_REPORT_STATUS_API_VALUES.all
  );
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(
    location.state?.selectedIssueId ||
      location.state?.highlightIssueId ||
      location.state?.notificationReportId ||
      null
  );
  const [highlightedIssueId, setHighlightedIssueId] = useState(
    location.state?.highlightIssueId ||
      location.state?.selectedIssueId ||
      location.state?.notificationReportId ||
      null
  );
  const [routeIssueId, setRouteIssueId] = useState(null);
  const [activeAction, setActiveAction] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isRequestingCurrentLocation, setIsRequestingCurrentLocation] =
    useState(false);

  const {
    issues: apiNearbyIssues,
    isLoading,
    errorMessage,
    updateIssue,
  } = useNearbyIssues(currentLocation, NEARBY_PAGE_NUMBER, activeFilter);

  const issuesWithAccurateDistances = useNearbyIssueDistances(
    apiNearbyIssues,
    currentLocation
  );

  const visibleIssues = issuesWithAccurateDistances;

  const notificationIssueId =
    location.state?.notificationReportId ||
    location.state?.selectedIssueId ||
    location.state?.highlightIssueId ||
    null;

  const isNotificationFocusActive = Boolean(
    location.state?.fromNotification && notificationIssueId
  );

  useEffect(() => {
    const issueId =
      location.state?.notificationReportId ||
      location.state?.selectedIssueId ||
      location.state?.highlightIssueId ||
      null;

    if (!issueId) return undefined;

    setActiveFilter(NEARBY_REPORT_STATUS_API_VALUES.all);
    setSelectedIssueId(issueId);
    setHighlightedIssueId(issueId);
    setRouteIssueId(null);
    setIsFilterSheetOpen(false);

    const timer = window.setTimeout(() => {
      mapCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location.state]);

  useEffect(() => {
    if (
      !location.state?.forceEnableCurrentLocation ||
      currentLocation ||
      autoRequestedLocationRef.current
    ) {
      return undefined;
    }

    autoRequestedLocationRef.current = true;

    if (!navigator.geolocation) {
      setActionError('المتصفح لا يدعم تحديد الموقع الحالي.');
      return undefined;
    }

    setIsRequestingCurrentLocation(true);
    setActionError('');
    setActionMessage('من فضلك اسمح بتفعيل الموقع الحالي لعرض البلاغ القادم من الإشعار.');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsRequestingCurrentLocation(false);
        setActionMessage('تم تفعيل موقعك الحالي، جاري تحديد البلاغ المرتبط بالإشعار.');
      },
      () => {
        setIsRequestingCurrentLocation(false);
        setActionMessage('');
        setActionError(
          'يجب السماح بتفعيل الموقع الحالي حتى يتم تحميل البلاغات القريبة وتحديد البلاغ القادم من الإشعار.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );

    return undefined;
  }, [currentLocation, location.state]);

  useEffect(() => {
    if (!highlightedIssueId || !currentLocation) return undefined;

    const highlightedIssue = visibleIssues.find(
      (issue) => String(issue.id) === String(highlightedIssueId)
    );

    if (!highlightedIssue) {
      if (!isLoading && isNotificationFocusActive) {
        setActionError(
          'تم تفعيل موقعك، لكن البلاغ المرتبط بالإشعار غير ظاهر ضمن البلاغات القريبة الحالية. تأكد أنه داخل نطاق الموقع الحالي وحالته مسموحة للظهور.'
        );
      }

      return undefined;
    }

    setActionError('');
    setSelectedIssueId(highlightedIssue.id);

    const timer = window.setTimeout(() => {
      listCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      document
        .querySelector(`[data-nearby-issue-id="${highlightedIssue.id}"]`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [
    currentLocation,
    highlightedIssueId,
    isLoading,
    isNotificationFocusActive,
    visibleIssues,
  ]);

  useEffect(() => {
    const shouldKeepNotificationSelection =
      isNotificationFocusActive &&
      highlightedIssueId &&
      String(selectedIssueId) === String(highlightedIssueId) &&
      (!currentLocation || isLoading);

    if (
      selectedIssueId &&
      !shouldKeepNotificationSelection &&
      !visibleIssues.some(
        (issue) => String(issue.id) === String(selectedIssueId)
      )
    ) {
      setSelectedIssueId(null);
    }

    if (
      routeIssueId &&
      !visibleIssues.some((issue) => String(issue.id) === String(routeIssueId))
    ) {
      setRouteIssueId(null);
    }
  }, [
    currentLocation,
    highlightedIssueId,
    isLoading,
    isNotificationFocusActive,
    visibleIssues,
    routeIssueId,
    selectedIssueId,
  ]);

  const routeIssue = useMemo(
    () =>
      issuesWithAccurateDistances.find(
        (issue) => String(issue.id) === String(routeIssueId)
      ) || null,
    [issuesWithAccurateDistances, routeIssueId]
  );

  const mapMarkers = useMemo(
    () =>
      visibleIssues.map((issue) => ({
        ...issue,
        subtitle: issue.area,
      })),
    [visibleIssues]
  );

  function handleFilterChange(nextFilter) {
    setHighlightedIssueId(null);
    setActiveFilter(nextFilter);
    setSelectedIssueId(null);
    setRouteIssueId(null);
    setActionError('');
    setActionMessage('');
    setIsFilterSheetOpen(false);
  }

  function handleSelectIssue(issue) {
    if (!issue?.id) return;

    setHighlightedIssueId(null);
    setRouteIssueId(null);

    setSelectedIssueId((currentId) =>
      String(currentId) === String(issue.id) ? null : issue.id
    );
  }

  function handleClearSelection() {
    setHighlightedIssueId(null);
    setSelectedIssueId(null);
    setRouteIssueId(null);
  }

  function handleRequestDirections(issue) {
    if (!issue?.id) return;

    if (!currentLocation?.lat || !currentLocation?.lng) {
      window.alert(
        'فعّل موقعك الحالي من زر تحديد الموقع الموجود على الخريطة أولًا.'
      );
      return;
    }

    setSelectedIssueId(issue.id);
    setRouteIssueId(issue.id);
  }

  async function handleToggleFollow(issue) {
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
  }

  async function handleToggleVerify(issue, vote = 1) {
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
  }

  async function handleToggleRating(issue) {
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
  }

  const activeFilterLabel = getActiveFilterLabel(activeFilter);
  const isFiltered = activeFilter !== NEARBY_REPORT_STATUS_API_VALUES.all;

  const emptyMessage = !currentLocation
    ? 'فعّل موقعك الحالي من الخريطة لعرض البلاغات القريبة منك.'
    : isLoading
      ? 'جاري تحميل البلاغات القريبة...'
      : isFiltered
        ? `لا توجد بلاغات قريبة بحالة: ${activeFilterLabel}.`
        : errorMessage || 'لا توجد بلاغات قريبة ضمن النطاق الحالي.';

  return (
    <div className="dashboard-page nearby-page">
      <PageHeader
        title="مشاكل قريبة منك"
        subtitle={`Nearby Issues — البلاغات القريبة ضمن نطاق ${NEARBY_RADIUS_KM} كم`}
      />

      {location.state?.successMessage ? (
        <p className="nearby-notification-focus-message">
          <FiMapPin />
          {location.state.successMessage}
        </p>
      ) : null}

      {isNotificationFocusActive && !currentLocation ? (
        <p className="nearby-notification-focus-message nearby-notification-focus-message--warning">
          <FiMapPin />
          {isRequestingCurrentLocation
            ? 'جاري طلب السماح بتفعيل الموقع الحالي...'
            : 'يجب تفعيل موقعك الحالي حتى يتم تحميل البلاغات القريبة وتحديد البلاغ القادم من الإشعار.'}
        </p>
      ) : null}

      <div className="nearby-page__stack">
        <NearbyStatusLegend />

        <section className="nearby-filter-toolbar" dir="rtl">
          <div className="nearby-filter-toolbar__copy">
            <strong>فلترة البلاغات القريبة</strong>
            <span>
              يمكنك تصفية النتائج بالحالات العامة المسموح للمستخدم القريب
              برؤيتها.
            </span>
          </div>

          <div className="nearby-filter-toolbar__controls">
            <button
              type="button"
              className="nearby-filter-toolbar__mobile-btn"
              onClick={() => setIsFilterSheetOpen(true)}
            >
              <FiFilter />
              <span>فلتر: {activeFilterLabel}</span>
            </button>

            <NearbyFilterDropdown
              activeFilter={activeFilter}
              onChange={handleFilterChange}
            />
          </div>
        </section>
      </div>

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
        <div ref={mapCardRef}>
          <DashboardSectionCard title="الخريطة" subtitle="Reports Map">
            <ReportsMap
              markers={mapMarkers}
              height={420}
              userLocation={currentLocation}
              activeMarkerId={selectedIssueId}
              onMarkerSelect={handleSelectIssue}
              onCurrentLocationChange={setCurrentLocation}
              routeDestination={routeIssue}
            />
          </DashboardSectionCard>
        </div>

        <div ref={listCardRef}>
          <DashboardSectionCard
          title="القائمة"
          subtitle={
            currentLocation
              ? `${visibleIssues.length} بلاغ قريب${
                  isFiltered ? ` — ${activeFilterLabel}` : ''
                }`
              : 'Nearby Issues List'
          }
        >
          <NearbyIssuesList
            issues={visibleIssues}
            activeIssueId={selectedIssueId}
            onSelectIssue={handleSelectIssue}
            currentLocation={currentLocation}
            onRequestDirections={handleRequestDirections}
            onClearSelection={handleClearSelection}
            onToggleFollow={handleToggleFollow}
            onToggleVerify={handleToggleVerify}
            onToggleRating={handleToggleRating}
              activeAction={activeAction}
              highlightedIssueId={highlightedIssueId}
              emptyMessage={emptyMessage}
            />
          </DashboardSectionCard>
        </div>
      </div>

      <NearbyFilterBottomSheet
        isOpen={isFilterSheetOpen}
        activeFilter={activeFilter}
        onClose={() => setIsFilterSheetOpen(false)}
        onChange={handleFilterChange}
      />
    </div>
  );
}

export default NearbyIssuesPage;