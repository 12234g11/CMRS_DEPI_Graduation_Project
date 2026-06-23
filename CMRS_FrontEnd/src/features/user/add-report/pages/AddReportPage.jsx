import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import { ROUTES } from '../../../../shared/navigation';
import {
  ADD_REPORT_CATEGORIES,
  ADD_REPORT_STEPS,
  REPORT_DETAILS_LIMITS,
} from '../mocks/addReportMockData';
import CategorySelectionStep from '../components/CategorySelectionStep';
import DetailsStep from '../components/DetailsStep';
import LocationStep from '../components/LocationStep';
import ReportWizardHeader from '../components/ReportWizardHeader';
import ReviewStep from '../components/ReviewStep';
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

function AddReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const previewUrlsRef = useRef([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadMessage, setUploadMessage] = useState('');
  const [formValues, setFormValues] = useState(createInitialFormState);
  const { submitReport, isSubmitting, error: submitError } = useAddReport();

  const selectedCategory = useMemo(
    () => ADD_REPORT_CATEGORIES.find((item) => item.id === formValues.categoryId) || null,
    [formValues.categoryId]
  );

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
    previewUrlsRef.current = formValues.imagePreviews.map((preview) => preview.url);
  }, [formValues.imagePreviews]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
    };
  }, []);

  const handleCategoryChange = (categoryId) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      categoryId,
    }));
  };

  const handleTitleChange = (title) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      title,
    }));
  };

  const handleDescriptionChange = (description) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      description,
    }));
  };

  const handleSeverityChange = (severity) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      severity,
    }));
  };

  const handleAddImages = (nextFiles) => {
    const remainingSlots = REPORT_DETAILS_LIMITS.maxImages - formValues.images.length;
    const validTypeFiles = nextFiles.filter((file) => file.type.startsWith('image/'));
    const allowedSizeBytes = REPORT_DETAILS_LIMITS.maxImageSizeMb * 1024 * 1024;
    const validSizeFiles = validTypeFiles.filter((file) => file.size <= allowedSizeBytes);
    const acceptedFiles = validSizeFiles.slice(0, remainingSlots);

    const rejectedByTypeCount = nextFiles.length - validTypeFiles.length;
    const rejectedBySizeCount = validTypeFiles.length - validSizeFiles.length;
    const rejectedByLimitCount = validSizeFiles.length - acceptedFiles.length;

    if (rejectedByTypeCount || rejectedBySizeCount || rejectedByLimitCount) {
      const messages = [];

      if (rejectedByTypeCount) {
        messages.push('تم تجاهل الملفات غير الصورية.');
      }

      if (rejectedBySizeCount) {
        messages.push(`بعض الصور تجاوزت ${REPORT_DETAILS_LIMITS.maxImageSizeMb}MB.`);
      }

      if (rejectedByLimitCount) {
        messages.push(`يمكنك رفع ${REPORT_DETAILS_LIMITS.maxImages} صور كحد أقصى.`);
      }

      setUploadMessage(messages.join(' '));
    } else {
      setUploadMessage('');
    }

    if (!acceptedFiles.length) {
      return;
    }

    const nextPreviews = acceptedFiles.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setFormValues((currentValues) => ({
      ...currentValues,
      images: [...currentValues.images, ...acceptedFiles],
      imagePreviews: [...currentValues.imagePreviews, ...nextPreviews],
    }));
  };

  const handleRemoveImage = (previewId) => {
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
        images: currentValues.images.filter((_, index) => index !== previewIndex),
        imagePreviews: currentValues.imagePreviews.filter((preview) => preview.id !== previewId),
      };
    });
  };

  const handleSubmit = async () => {
    const createdReport = await submitReport({
      user,
      values: {
        ...formValues,
        position:
          formValues.location?.confirmedCoordinates ||
          formValues.location?.coordinates ||
          formValues.position,
        locationText: locationLabel,
      },
    });

    if (!createdReport) {
      return;
    }

    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setFormValues(createInitialFormState());
    setCurrentStep(1);
    setUploadMessage('');

    navigate(ROUTES.MY_REPORTS, {
      state: {
        createdReportId: createdReport.id,
        successMessage: 'تم إرسال البلاغ بنجاح ويمكنك متابعة حالته من صفحة بلاغاتي.',
      },
    });
  };

  return (
    <div className="dashboard-page add-report-page">
      <ReportWizardHeader
        steps={ADD_REPORT_STEPS}
        currentStep={currentStep}
      />

      <div className="add-report-shell">
        {currentStep === 1 ? (
          <CategorySelectionStep
            categories={ADD_REPORT_CATEGORIES}
            selectedCategoryId={formValues.categoryId}
            onSelect={handleCategoryChange}
            onNext={() => setCurrentStep(2)}
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
    </div>
  );
}

export default AddReportPage;