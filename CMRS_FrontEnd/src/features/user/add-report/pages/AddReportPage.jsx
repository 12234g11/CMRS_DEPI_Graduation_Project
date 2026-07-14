import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../auth/hooks/useAuth';
import { ROUTES } from '../../../../shared/navigation';
import {
  ADD_REPORT_STEPS,
  REPORT_DETAILS_LIMITS,
} from '../constants/addReportConfig';

import CategorySelectionStep from '../components/CategorySelectionStep';
import DetailsStep from '../components/DetailsStep';
import LocationStep from '../components/LocationStep';
import ReportWizardHeader from '../components/ReportWizardHeader';
import ReviewStep from '../components/ReviewStep';
import DuplicateReportModal from '../components/DuplicateReportModal';
import useAddReport from '../hooks/useAddReport';

const DEFAULT_LOCATION = {
  coordinates: { lat: 30.04442, lng: 31.235712 },
  confirmedCoordinates: null,
  isConfirmed: false,
  governorate: '',
  governorateLabel: '',
  addressLine: '',
  previewLabel: '',
  previewGovernorate: '',
};

function createInitialFormState() {
  return {
    categoryId: '',
    title: '',
    description: '',
    severity: 'medium',
    images: [],
    imagePreviews: [],
    position: null,
    locationText: '',
    location: DEFAULT_LOCATION,
  };
}

function getReportId(report) {
  return report?.reportId || report?.id || report?.ReportId || report?.Id || '';
}

function getUserId(user = {}) {
  return user.id || user.userId || user.UserId || user.sub || '';
}

function applyCurrentUserOwnership(report, user) {
  if (!report) return report;

  const ownerUserId = report.ownerUserId || report.OwnerUserId || '';
  const currentUserId = getUserId(user);
  const isSameUser = Boolean(
    ownerUserId &&
      currentUserId &&
      String(ownerUserId).toLowerCase() === String(currentUserId).toLowerCase()
  );

  return {
    ...report,
    isOwnedByCurrentUser: Boolean(report.isOwnedByCurrentUser || isSameUser),
  };
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

  if (!Number.isFinite(numberValue)) return fallback;

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
    if (numericValue === 1) return 1;
    if (numericValue === -1) return -1;
    return null;
  }

  return null;
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

function AddReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const previewUrlsRef = useRef([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadMessage, setUploadMessage] = useState('');
  const [formValues, setFormValues] = useState(createInitialFormState);

  const [duplicateReport, setDuplicateReport] = useState(null);
  const [lastSubmissionPayload, setLastSubmissionPayload] = useState(null);

  const {
    categories,
    isLoadingCategories,
    categoriesError,
    submitReport,
    toggleDuplicateFollow,
    toggleDuplicateVerify,
    resetDuplicateActionFeedback,
    activeDuplicateAction,
    duplicateActionError,
    duplicateActionMessage,
    isSubmitting,
    submitError,
  } = useAddReport();

  const safeCategories = Array.isArray(categories) ? categories : [];

  const selectedCategory = useMemo(() => {
    return (
      safeCategories.find(
        (category) =>
          String(category.categoryId) === String(formValues.categoryId)
      ) || null
    );
  }, [safeCategories, formValues.categoryId]);

  const locationLabel = useMemo(() => {
    const location = formValues.location || {};

    const parts = [
      location.governorateLabel || location.previewGovernorate || '',
      location.addressLine || '',
    ].filter(Boolean);

    return parts.join(' - ');
  }, [formValues.location]);

  useEffect(() => {
    previewUrlsRef.current = formValues.imagePreviews.map(
      (preview) => preview.url
    );
  }, [formValues.imagePreviews]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
    };
  }, []);

  function resetFormAfterSuccess() {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];

    setFormValues(createInitialFormState());
    setCurrentStep(1);
    setUploadMessage('');
    setDuplicateReport(null);
    setLastSubmissionPayload(null);
    resetDuplicateActionFeedback();
  }

  function navigateToMyReports(createdReport, successMessage) {
    navigate(ROUTES.MY_REPORTS, {
      state: {
        createdReportId: getReportId(createdReport),
        successMessage:
          successMessage ||
          createdReport?.message ||
          'تم إرسال البلاغ بنجاح ويمكنك متابعة حالته من صفحة بلاغاتي.',
      },
    });
  }

  function buildSubmissionPayload() {
    const currentLocation = formValues.location || {};
    const location = {
      coordinates: currentLocation.coordinates,
      confirmedCoordinates: currentLocation.confirmedCoordinates,
      isConfirmed: currentLocation.isConfirmed,
      governorate: currentLocation.governorate,
      governorateLabel: currentLocation.governorateLabel,
      addressLine: currentLocation.addressLine,
      previewLabel: currentLocation.previewLabel,
      previewGovernorate: currentLocation.previewGovernorate,
    };

    return {
      user,
      category: selectedCategory,
      values: {
        ...formValues,
        location,
        position:
          location.confirmedCoordinates ||
          location.coordinates ||
          formValues.position,
        locationText: locationLabel,
      },
    };
  }

  function handleCategoryChange(categoryId) {
    setFormValues((currentValues) => ({
      ...currentValues,
      categoryId: String(categoryId),
    }));
  }

  function handleTitleChange(title) {
    setFormValues((currentValues) => ({
      ...currentValues,
      title,
    }));
  }

  function handleDescriptionChange(description) {
    setFormValues((currentValues) => ({
      ...currentValues,
      description,
    }));
  }

  function handleSeverityChange(severity) {
    setFormValues((currentValues) => ({
      ...currentValues,
      severity,
    }));
  }
  function handleAddImages(nextFiles) {
    const remainingSlots =
      REPORT_DETAILS_LIMITS.maxImages - formValues.images.length;

    const allowedSizeBytes =
      REPORT_DETAILS_LIMITS.maxImageSizeMb * 1024 * 1024;

    const validFiles = nextFiles
      .filter((file) => file.type === 'image/webp')
      .filter((file) => file.size <= allowedSizeBytes)
      .slice(0, remainingSlots);

    const rejectedCount = nextFiles.length - validFiles.length;

    if (rejectedCount) {
      setUploadMessage(
        `تم تجاهل ${rejectedCount} صورة. الصور يجب أن تكون WEBP ولا تتجاوز ${REPORT_DETAILS_LIMITS.maxImageSizeMb}MB.`
      );
    } else {
      setUploadMessage('');
    }

    if (!validFiles.length) {
      return;
    }

    const nextPreviews = validFiles.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setFormValues((currentValues) => ({
      ...currentValues,
      images: [...currentValues.images, ...validFiles],
      imagePreviews: [...currentValues.imagePreviews, ...nextPreviews],
    }));
  }

  function handleRemoveImage(previewId) {
    setFormValues((currentValues) => {
      const previewIndex = currentValues.imagePreviews.findIndex(
        (preview) => preview.id === previewId
      );

      if (previewIndex === -1) {
        return currentValues;
      }

      const removedPreview = currentValues.imagePreviews[previewIndex];

      if (removedPreview?.url) {
        URL.revokeObjectURL(removedPreview.url);
      }

      return {
        ...currentValues,
        images: currentValues.images.filter(
          (_, index) => index !== previewIndex
        ),
        imagePreviews: currentValues.imagePreviews.filter(
          (preview) => preview.id !== previewId
        ),
      };
    });
  }

  async function handleSubmit() {
    const submissionPayload = buildSubmissionPayload();

    setLastSubmissionPayload(submissionPayload);

    let result;

    try {
      result = await submitReport(submissionPayload, {
        ignoreDuplicateCheck: false,
      });
    } catch {
      return;
    }

    if (!result) return;

    if (result.type === 'duplicate') {
      resetDuplicateActionFeedback();
      setDuplicateReport(applyCurrentUserOwnership(result.duplicateReport, user));
      return;
    }

    if (result.type === 'created') {
      resetFormAfterSuccess();
      navigateToMyReports(result.report);
    }
  }

  async function handleToggleDuplicateFollow() {
    if (!duplicateReport?.id || duplicateReport.isOwnedByCurrentUser) return;

    const selectedPosition =
      lastSubmissionPayload?.values?.position ||
      lastSubmissionPayload?.values?.location?.confirmedCoordinates ||
      lastSubmissionPayload?.values?.location?.coordinates ||
      null;

    const result = await toggleDuplicateFollow({
      reportId: duplicateReport.id,
      isFollowed: Boolean(duplicateReport.isFollowedByCurrentUser),
      currentLatitude: selectedPosition?.lat,
      currentLongitude: selectedPosition?.lng,
    });

    if (!result) return;

    const data = result.data || {};

    setDuplicateReport((currentReport) => {
      if (!currentReport) return currentReport;

      const wasFollowed = Boolean(currentReport.isFollowedByCurrentUser);
      const nextIsFollowed = toResponseBoolean(
        readResponseValue(
          data,
          'isFollowedByCurrentUser',
          'IsFollowedByCurrentUser'
        ),
        result.requestedIsFollowed
      );
      const currentFollowersCount = toSafeCount(currentReport.followersCount);
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
        ...currentReport,
        followersCount: nextFollowersCount,
        isFollowedByCurrentUser: nextIsFollowed,
      };
    });
  }

  async function handleToggleDuplicateVerify(vote) {
    if (!duplicateReport?.id || duplicateReport.isOwnedByCurrentUser) return;

    const normalizedVote = Number(vote) === -1 ? -1 : 1;
    const previousVote = normalizeVerifyVote(
      duplicateReport.currentUserVerifyVote
    );

    const result = await toggleDuplicateVerify({
      reportId: duplicateReport.id,
      currentVote: previousVote,
      vote: normalizedVote,
    });

    if (!result) return;

    const data = result.data || {};

    setDuplicateReport((currentReport) => {
      if (!currentReport) return currentReport;

      const currentVote = normalizeVerifyVote(
        currentReport.currentUserVerifyVote
      );
      const currentUpvoteCount = toSafeCount(currentReport.upvoteCount);
      const currentDownvoteCount = toSafeCount(currentReport.downvoteCount);
      const responseUpvoteCount = readResponseValue(
        data,
        'upvoteCount',
        'UpvoteCount',
        'validReportCount',
        'ValidReportCount'
      );
      const responseDownvoteCount = readResponseValue(
        data,
        'downvoteCount',
        'DownvoteCount',
        'invalidReportCount',
        'InvalidReportCount'
      );

      let nextUpvoteCount = toSafeCount(
        responseUpvoteCount,
        currentUpvoteCount
      );
      let nextDownvoteCount = toSafeCount(
        responseDownvoteCount,
        currentDownvoteCount
      );

      if (responseUpvoteCount == null && responseDownvoteCount == null) {
        nextUpvoteCount = currentUpvoteCount;
        nextDownvoteCount = currentDownvoteCount;

        if (result.shouldRemoveCurrentVote) {
          if (currentVote === 1) {
            nextUpvoteCount = Math.max(0, nextUpvoteCount - 1);
          }
          if (currentVote === -1) {
            nextDownvoteCount = Math.max(0, nextDownvoteCount - 1);
          }
        } else if (currentVote !== normalizedVote) {
          if (currentVote === 1) {
            nextUpvoteCount = Math.max(0, nextUpvoteCount - 1);
          }
          if (currentVote === -1) {
            nextDownvoteCount = Math.max(0, nextDownvoteCount - 1);
          }

          if (normalizedVote === 1) nextUpvoteCount += 1;
          if (normalizedVote === -1) nextDownvoteCount += 1;
        }
      }

      const nextIsVerified = toResponseBoolean(
        readResponseValue(
          data,
          'isVerifiedByCurrentUser',
          'IsVerifiedByCurrentUser'
        ),
        !result.shouldRemoveCurrentVote
      );
      const nextVote = nextIsVerified
        ? getVerifyResponseVote(data, normalizedVote)
        : null;

      return {
        ...currentReport,
        upvoteCount: nextUpvoteCount,
        downvoteCount: nextDownvoteCount,
        verifyCount: nextUpvoteCount + nextDownvoteCount,
        isVerifiedByCurrentUser: nextIsVerified,
        currentUserVerifyVote: nextVote,
      };
    });
  }

  async function handleCreateAnyway() {
    const submissionPayload = lastSubmissionPayload || buildSubmissionPayload();

    let result;

    try {
      result = await submitReport(submissionPayload, {
        ignoreDuplicateCheck: true,
      });
    } catch {
      return;
    }

    if (!result) return;

    if (result.type === 'created') {
      resetFormAfterSuccess();

      navigateToMyReports(
        result.report,
        result.report?.message || 'تم إرسال البلاغ كبلاغ جديد بنجاح.'
      );

      return;
    }

    if (result.type === 'duplicate') {
      resetDuplicateActionFeedback();
      setDuplicateReport(applyCurrentUserOwnership(result.duplicateReport, user));
    }
  }

  return (
    <div className="dashboard-page add-report-page">
      <ReportWizardHeader steps={ADD_REPORT_STEPS} currentStep={currentStep} />

      <div className="add-report-shell">
        {currentStep === 1 ? (
          <CategorySelectionStep
            categories={safeCategories}
            selectedCategoryId={formValues.categoryId}
            onSelect={handleCategoryChange}
            onNext={() => setCurrentStep(2)}
            isLoading={isLoadingCategories}
            errorMessage={categoriesError}
          />
        ) : null}

        {currentStep === 2 ? (
          <DetailsStep
            values={formValues}
            limits={REPORT_DETAILS_LIMITS}
            uploadMessage={uploadMessage}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
            onSeverityChange={handleSeverityChange}
            onAddImages={handleAddImages}
            onRemoveImage={handleRemoveImage}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        ) : null}

        {currentStep === 3 ? (
          <LocationStep
            formData={formValues}
            setFormData={setFormValues}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        ) : null}

        {currentStep === 4 ? (
          <ReviewStep
            values={formValues}
            category={selectedCategory}
            locationLabel={locationLabel}
            onBack={() => setCurrentStep(3)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        ) : null}
      </div>

      {duplicateReport
        ? createPortal(
          <DuplicateReportModal
            duplicateReport={duplicateReport}
            isSubmitting={isSubmitting}
            activeAction={activeDuplicateAction}
            actionError={duplicateActionError || submitError}
            actionMessage={duplicateActionMessage}
            onToggleFollow={handleToggleDuplicateFollow}
            onToggleVerify={handleToggleDuplicateVerify}
            onCreateAnyway={handleCreateAnyway}
            onClose={() => {
              if (!isSubmitting && !activeDuplicateAction) {
                setDuplicateReport(null);
                resetDuplicateActionFeedback();
              }
            }}
          />,
          document.body
        )
        : null}
    </div>
  );
}

export default AddReportPage;