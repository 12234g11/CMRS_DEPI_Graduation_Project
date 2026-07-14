import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiCheck, FiChevronDown, FiFilter, FiMapPin, FiX } from 'react-icons/fi';

import DashboardSectionCard from '../../../../shared/components/dashboard/DashboardSectionCard';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import ReportsMap from '../../../map/components/ReportsMap';
import NearbyIssuesList from '../components/NearbyIssuesList';
import UnfollowConfirmationModal from '../components/UnfollowConfirmationModal';

import {
  followReport,
  NEARBY_REPORT_STATUS_API_VALUES,
  NEARBY_STATUS_FILTER_OPTIONS,
  NEARBY_STATUS_LEGEND_ITEMS,
  unfollowReport,
  unverifyReport,
  verifyReport,
} from '../api/nearbyIssuesApi';

import useNearbyIssues from '../hooks/useNearbyIssues';
import useNearbyIssueDistances from '../hooks/useNearbyIssueDistances';

const NEARBY_RADIUS_KM = 5;
const NEARBY_PAGE_NUMBER = 1;


function getIssueReportId(issue = {}) {
  return issue.reportId || issue.id;
}

function readResponseValue(source = {}, ...keys) {
  return keys.reduce((currentValue, key) => {
    if (currentValue !== undefined && currentValue !== null) {
      return currentValue;
    }

    return source?.[key];
  }, undefined);
}

function toSafeCount(value, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, numberValue);
}

function toResponseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (['true', 'yes'].includes(normalizedValue)) return true;
    if (['false', 'no'].includes(normalizedValue)) return false;
  }

  return fallback;
}

function normalizeVerifyVote(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'boolean') return value ? 1 : -1;

  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    if (numericValue === -1) return -1;
    if (numericValue === 1) return 1;
    return null;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (
    ['1', '+1', 'up', 'upvote', 'true', 'valid', 'correct', 'right'].includes(
      normalizedValue
    )
  ) {
    return 1;
  }

  if (
    [
      '-1',
      'down',
      'downvote',
      'false',
      'invalid',
      'incorrect',
      'wrong',
    ].includes(normalizedValue)
  ) {
    return -1;
  }

  return null;
}

function getIssueCurrentVerifyVote(issue = {}) {
  return (
    normalizeVerifyVote(issue.currentUserVerifyVote) ??
    normalizeVerifyVote(issue.verifyVote) ??
    normalizeVerifyVote(issue.userVerifyVote) ??
    (issue.isVerifiedByCurrentUser ? 1 : null)
  );
}

function getVerifyResponseVote(data = {}, fallbackVote = null) {
  return (
    normalizeVerifyVote(
      readResponseValue(
        data,
        'currentUserVerifyVote',
        'CurrentUserVerifyVote',
        'verifyVote',
        'VerifyVote',
        'userVerifyVote',
        'UserVerifyVote',
        'userVote',
        'UserVote'
      )
    ) ?? fallbackVote
  );
}

function calculateNextVerifyCounts({
  currentIssue,
  data,
  normalizedVote,
  shouldRemoveCurrentVote,
}) {
  const previousVote = getIssueCurrentVerifyVote(currentIssue);
  const currentUpvoteCount = toSafeCount(currentIssue.upvoteCount);
  const currentDownvoteCount = toSafeCount(currentIssue.downvoteCount);

  const responseUpvoteCount = readResponseValue(
    data,
    'upvoteCount',
    'UpvoteCount',
    'validReportCount',
    'ValidReportCount',
    'correctReportCount',
    'CorrectReportCount'
  );
  const responseDownvoteCount = readResponseValue(
    data,
    'downvoteCount',
    'DownvoteCount',
    'invalidReportCount',
    'InvalidReportCount',
    'wrongReportCount',
    'WrongReportCount'
  );

  let nextUpvoteCount = toSafeCount(responseUpvoteCount, currentUpvoteCount);
  let nextDownvoteCount = toSafeCount(responseDownvoteCount, currentDownvoteCount);

  if (responseUpvoteCount == null && responseDownvoteCount == null) {
    nextUpvoteCount = currentUpvoteCount;
    nextDownvoteCount = currentDownvoteCount;

    if (shouldRemoveCurrentVote) {
      if (previousVote === 1) nextUpvoteCount = Math.max(0, nextUpvoteCount - 1);
      if (previousVote === -1) nextDownvoteCount = Math.max(0, nextDownvoteCount - 1);
    } else if (previousVote !== normalizedVote) {
      if (previousVote === 1) nextUpvoteCount = Math.max(0, nextUpvoteCount - 1);
      if (previousVote === -1) nextDownvoteCount = Math.max(0, nextDownvoteCount - 1);

      if (normalizedVote === 1) nextUpvoteCount += 1;
      if (normalizedVote === -1) nextDownvoteCount += 1;
    }
  }

  return {
    upvoteCount: nextUpvoteCount,
    downvoteCount: nextDownvoteCount,
  };
}

function getActiveFilterLabel(activeFilter) {
  const option = NEARBY_STATUS_FILTER_OPTIONS.find(
    (item) => item.value === activeFilter
  );

  return option?.label || 'كل الحالات';
}

function getFilterDotClass(statusValue) {
  const option = NEARBY_STATUS_FILTER_OPTIONS.find(
    (item) => item.value === statusValue
  );

  return option?.dotClassName || 'all';
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
          <div
            key={item.id}
            className={`nearby-status-panel__card nearby-status-panel__card--${item.dotClassName}`}
          >
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
  const [isLocationIntroOpen, setIsLocationIntroOpen] = useState(
    () => !location.state?.forceEnableCurrentLocation
  );
  const [showLocationControlHint, setShowLocationControlHint] = useState(false);
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
  const [pendingUnfollowIssue, setPendingUnfollowIssue] = useState(null);
  const [isRequestingCurrentLocation, setIsRequestingCurrentLocation] =
    useState(false);
  const [mapHeight, setMapHeight] = useState(() => {
    if (typeof window === 'undefined') return 420;
    if (window.innerWidth <= 480) return 330;
    if (window.innerWidth <= 768) return 360;
    return 420;
  });

  useEffect(() => {
    function updateMapHeight() {
      if (window.innerWidth <= 480) {
        setMapHeight(330);
        return;
      }

      if (window.innerWidth <= 768) {
        setMapHeight(360);
        return;
      }

      setMapHeight(420);
    }

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);

    return () => window.removeEventListener('resize', updateMapHeight);
  }, []);

  useEffect(() => {
    const hasCurrentLocation =
      Number.isFinite(Number(currentLocation?.lat)) &&
      Number.isFinite(Number(currentLocation?.lng));

    if (!hasCurrentLocation) return;

    setIsLocationIntroOpen(false);
    setShowLocationControlHint(false);
  }, [currentLocation]);

  useEffect(() => {
    if (!isLocationIntroOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsLocationIntroOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isLocationIntroOpen]);

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

  function scrollToIssueDetails(issueId) {
    window.setTimeout(() => {
      const issueElement = document.querySelector(
        `[data-nearby-issue-id="${issueId}"]`
      );

      if (issueElement) {
        issueElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        return;
      }

      listCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 140);
  }

  function handleSelectIssue(
    issue,
    { forceOpen = false, scrollToDetails = false } = {}
  ) {
    if (!issue?.id) return;

    setHighlightedIssueId(null);
    setRouteIssueId(null);

    if (forceOpen) {
      setSelectedIssueId(issue.id);
    } else {
      setSelectedIssueId((currentId) =>
        String(currentId) === String(issue.id) ? null : issue.id
      );
    }

    if (scrollToDetails) {
      scrollToIssueDetails(issue.id);
    }
  }

  function handleClearSelection() {
    setHighlightedIssueId(null);
    setSelectedIssueId(null);
    setRouteIssueId(null);
  }

  function scrollToMap() {
    window.setTimeout(() => {
      mapCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  }

  function handleShowIssueOnMap(issue) {
    if (!issue?.id) return;

    setHighlightedIssueId(null);
    setSelectedIssueId(issue.id);
    setRouteIssueId(null);
    scrollToMap();
  }

  function closeLocationIntro() {
    setIsLocationIntroOpen(false);
  }

  function handleGoToMapForLocation() {
    setIsLocationIntroOpen(false);
    setShowLocationControlHint(true);
    scrollToMap();
  }

  function handleCurrentLocationChange(locationPoint) {
    const normalizedLocation = {
      lat: Number(locationPoint?.lat),
      lng: Number(locationPoint?.lng),
    };

    if (
      !Number.isFinite(normalizedLocation.lat) ||
      !Number.isFinite(normalizedLocation.lng)
    ) {
      return;
    }

    setCurrentLocation(normalizedLocation);
    setShowLocationControlHint(false);
    setIsLocationIntroOpen(false);
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
    scrollToMap();
  }

  async function performFollowAction(issue, shouldUnfollow) {
    const reportId = getIssueReportId(issue);
    if (!reportId) return false;

    if (!shouldUnfollow) {
      const latitude = Number(currentLocation?.lat);
      const longitude = Number(currentLocation?.lng);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setActionError('يجب تحديد موقعك الحالي قبل متابعة البلاغ.');
        setActionMessage('');
        return false;
      }
    }

    setActionError('');
    setActionMessage('');
    setActiveAction(`follow:${reportId}`);

    try {
      const data = (shouldUnfollow
        ? await unfollowReport(reportId)
        : await followReport(reportId, {
            currentLatitude: currentLocation.lat,
            currentLongitude: currentLocation.lng,
          })) || {};

      const nextIsFollowedForMessage = toResponseBoolean(
        readResponseValue(
          data,
          'isFollowedByCurrentUser',
          'IsFollowedByCurrentUser'
        ),
        !shouldUnfollow
      );

      updateIssue(reportId, (currentIssue) => {
        const wasFollowed = Boolean(currentIssue.isFollowedByCurrentUser);
        const nextIsFollowed = toResponseBoolean(
          readResponseValue(
            data,
            'isFollowedByCurrentUser',
            'IsFollowedByCurrentUser'
          ),
          !shouldUnfollow
        );

        const currentFollowersCount = toSafeCount(currentIssue.followersCount);
        const responseFollowersCount = readResponseValue(
          data,
          'followersCount',
          'FollowersCount'
        );
        const nextFollowersCount =
          responseFollowersCount != null
            ? toSafeCount(responseFollowersCount, currentFollowersCount)
            : Math.max(
                0,
                currentFollowersCount +
                  (nextIsFollowed === wasFollowed ? 0 : nextIsFollowed ? 1 : -1)
              );

        return {
          ...currentIssue,
          followersCount: nextFollowersCount,
          isFollowedByCurrentUser: nextIsFollowed,
          followedAt: readResponseValue(data, 'followedAt', 'FollowedAt') ??
            (nextIsFollowed ? currentIssue.followedAt : null),
          canCurrentUserFollow: toResponseBoolean(
            readResponseValue(
              data,
              'canCurrentUserFollow',
              'CanCurrentUserFollow'
            ),
            nextIsFollowed ? currentIssue.canCurrentUserFollow : true
          ),
        };
      });

      setActionMessage(
        nextIsFollowedForMessage
          ? 'تمت متابعة البلاغ بنجاح.'
          : 'تم إلغاء متابعة البلاغ بنجاح.'
      );

      return true;
    } catch (error) {
      setActionError(error?.message || 'تعذر تحديث متابعة البلاغ حاليًا.');
      return false;
    } finally {
      setActiveAction('');
    }
  }

  function handleToggleFollow(issue) {
    const reportId = getIssueReportId(issue);
    if (!reportId || activeAction) return;

    if (issue.isFollowedByCurrentUser) {
      setActionError('');
      setActionMessage('');
      setPendingUnfollowIssue(issue);
      return;
    }

    void performFollowAction(issue, false);
  }

  async function handleConfirmUnfollow() {
    if (!pendingUnfollowIssue) return;

    const didUnfollow = await performFollowAction(pendingUnfollowIssue, true);

    if (didUnfollow) {
      setPendingUnfollowIssue(null);
    }
  }

  async function handleToggleVerify(issue, vote = 1) {
    const reportId = getIssueReportId(issue);
    if (!reportId) return;

    const normalizedVote = Number(vote) === -1 ? -1 : 1;
    const currentVote = getIssueCurrentVerifyVote(issue);

    const shouldRemoveCurrentVote =
      issue.isVerifiedByCurrentUser && currentVote === normalizedVote;

    setActionError('');
    setActionMessage('');
    setActiveAction(`verify:${reportId}:${normalizedVote}`);

    try {
      const data = (shouldRemoveCurrentVote
        ? await unverifyReport(reportId)
        : await verifyReport(reportId, normalizedVote)) || {};

      updateIssue(reportId, (currentIssue) => {
        const { upvoteCount, downvoteCount } = calculateNextVerifyCounts({
          currentIssue,
          data,
          normalizedVote,
          shouldRemoveCurrentVote,
        });

        const nextIsVerified = toResponseBoolean(
          readResponseValue(
            data,
            'isVerifiedByCurrentUser',
            'IsVerifiedByCurrentUser'
          ),
          !shouldRemoveCurrentVote
        );

        const nextVote = nextIsVerified
          ? getVerifyResponseVote(data, normalizedVote)
          : null;

        const responseVerifyCount = readResponseValue(
          data,
          'verifyCount',
          'VerifyCount'
        );

        return {
          ...currentIssue,
          verifyCount:
            responseVerifyCount != null
              ? toSafeCount(responseVerifyCount, upvoteCount + downvoteCount)
              : upvoteCount + downvoteCount,
          upvoteCount,
          downvoteCount,
          isVerifiedByCurrentUser: nextIsVerified,
          canCurrentUserVerify: toResponseBoolean(
            readResponseValue(
              data,
              'canCurrentUserVerify',
              'CanCurrentUserVerify'
            ),
            nextIsVerified ? currentIssue.canCurrentUserVerify : true
          ),
          currentUserVerifyVote: nextVote,
        };
      });

      if (shouldRemoveCurrentVote) {
        setActionMessage('تم إلغاء تصويتك على البلاغ.');
      } else if (normalizedVote === 1) {
        setActionMessage('تم تسجيل أن البلاغ صحيح.');
      } else {
        setActionMessage('تم تسجيل أن البلاغ غير صحيح.');
      }
    } catch (error) {
      setActionError(error?.message || 'تعذر تحديث تأكيد البلاغ حاليًا.');
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
        <div ref={mapCardRef} className="nearby-page__map-card">
          <DashboardSectionCard title="الخريطة" subtitle="Reports Map">
            <div
              className={`nearby-location-map-wrapper ${
                showLocationControlHint
                  ? 'nearby-location-map-wrapper--awaiting-location'
                  : ''
              }`}
            >
              {showLocationControlHint && !currentLocation ? (
                <div className="nearby-current-location-guide" dir="rtl">
                  <span
                    className="nearby-current-location-guide__icon"
                    aria-hidden="true"
                  >
                    <FiMapPin />
                  </span>
                  <div>
                    <strong>اضغط زر موقعك الحالي</strong>
                    <p>
                      استخدم الأيقونة الدائرية الموجودة أعلى يسار الخريطة،
                      وبعد السماح بالموقع ستظهر لك البلاغات القريبة.
                    </p>
                  </div>
                </div>
              ) : null}

              <ReportsMap
                markers={mapMarkers}
                height={mapHeight}
                userLocation={currentLocation}
                activeMarkerId={selectedIssueId}
                onMarkerSelect={(issue) =>
                  handleSelectIssue(issue, {
                    forceOpen: true,
                    scrollToDetails: true,
                  })
                }
                onCurrentLocationChange={handleCurrentLocationChange}
                routeDestination={routeIssue}
              />
            </div>
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
            onShowIssueOnMap={handleShowIssueOnMap}
            onClearSelection={handleClearSelection}
            onToggleFollow={handleToggleFollow}
            onToggleVerify={handleToggleVerify}
              activeAction={activeAction}
              highlightedIssueId={highlightedIssueId}
              emptyMessage={emptyMessage}
            />
          </DashboardSectionCard>
        </div>
      </div>

      {isLocationIntroOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="nearby-location-intro-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="nearby-location-intro-title"
              dir="rtl"
            >
              <button
                type="button"
                className="nearby-location-intro-modal__backdrop"
                onClick={closeLocationIntro}
                aria-label="إغلاق نافذة تفعيل الموقع"
              />

              <section className="nearby-location-intro-modal__panel">
                <span
                  className="nearby-location-intro-modal__icon"
                  aria-hidden="true"
                >
                  <FiMapPin />
                </span>

                <div className="nearby-location-intro-modal__content">
                  <strong id="nearby-location-intro-title">
                    فعّل موقعك لعرض المشاكل القريبة منك
                  </strong>
                  <p>
                    هذه الصفحة تعتمد على موقعك الحالي حتى تعرض البلاغات الموجودة
                    داخل نطاق {NEARBY_RADIUS_KM} كم وتحسب المسافة إليها بدقة.
                  </p>
                </div>

                <div className="nearby-location-intro-modal__control-guide">
                  <span aria-hidden="true">
                    <FiMapPin />
                  </span>
                  <div>
                    <strong>أين يوجد زر الموقع؟</strong>
                    <p>
                      ستجده كزر دائري يحمل أيقونة تحديد الموقع أعلى يسار
                      الخريطة. اضغط عليه ثم اسمح للمتصفح باستخدام موقعك.
                    </p>
                  </div>
                </div>

                <div className="nearby-location-intro-modal__actions">
                  <button
                    type="button"
                    className="nearby-location-intro-modal__confirm"
                    onClick={handleGoToMapForLocation}
                  >
                    <FiMapPin />
                    الذهاب للخريطة وتفعيل الموقع
                  </button>

                  <button
                    type="button"
                    className="nearby-location-intro-modal__cancel"
                    onClick={closeLocationIntro}
                  >
                    لاحقًا
                  </button>
                </div>
              </section>
            </div>,
            document.body
          )
        : null}

      <NearbyFilterBottomSheet
        isOpen={isFilterSheetOpen}
        activeFilter={activeFilter}
        onClose={() => setIsFilterSheetOpen(false)}
        onChange={handleFilterChange}
      />

      <UnfollowConfirmationModal
        isOpen={Boolean(pendingUnfollowIssue)}
        reportTitle={pendingUnfollowIssue?.title}
        isLoading={
          Boolean(pendingUnfollowIssue) &&
          activeAction === `follow:${getIssueReportId(pendingUnfollowIssue)}`
        }
        onCancel={() => {
          if (!activeAction) setPendingUnfollowIssue(null);
        }}
        onConfirm={handleConfirmUnfollow}
      />
    </div>
  );
}

export default NearbyIssuesPage;