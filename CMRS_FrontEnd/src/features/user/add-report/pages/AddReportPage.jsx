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
  addressDetails: '',
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
    confirmDuplicate,
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
      location.addressDetails || '',
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
    return {
      user,
      category: selectedCategory,
      values: {
        ...formValues,
        position:
          formValues.location?.confirmedCoordinates ||
          formValues.location?.coordinates ||
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

    const result = await submitReport(submissionPayload, {
      ignoreDuplicateCheck: false,
    });

    if (!result) return;

    if (result.type === 'duplicate') {
      setDuplicateReport(result.duplicateReport);
      return;
    }

    if (result.type === 'created') {
      resetFormAfterSuccess();
      navigateToMyReports(result.report);
    }
  }

  async function handleConfirmDuplicate() {
    if (!duplicateReport?.id) return;

    const result = await confirmDuplicate(duplicateReport.id);

    if (!result) return;

    resetFormAfterSuccess();

    navigateToMyReports(
      { reportId: duplicateReport.id },
      result.message ||
      'تم تأكيد المشكلة بنجاح ويمكنك متابعة حالته من صفحة بلاغاتي.'
    );
  }

  async function handleCreateAnyway() {
    const submissionPayload = lastSubmissionPayload || buildSubmissionPayload();

    const result = await submitReport(submissionPayload, {
      ignoreDuplicateCheck: true,
    });

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
      setDuplicateReport(result.duplicateReport);
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
            onConfirmDuplicate={handleConfirmDuplicate}
            onCreateAnyway={handleCreateAnyway}
            onClose={() => {
              if (!isSubmitting) {
                setDuplicateReport(null);
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