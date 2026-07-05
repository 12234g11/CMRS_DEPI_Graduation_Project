import {  REPORT_SEVERITY_OPTIONS } from '../../add-report/mocks/addReportMockData';
import { buildReportPreviewImage } from './buildReportPreviewImage';
import { buildReportLocationDetails, normalizeReportPosition } from './reportLocation';

const INITIAL_STATUS = {
  id: 'pending',
  label: 'قيد المراجعة',
  tone: 'warning',
};

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!(file instanceof File)) {
      resolve('');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };

    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function compressImageDataUrl(dataUrl) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(dataUrl);
      return;
    }

    const image = new Image();

    image.onload = () => {
      const maxWidth = 1280;
      const maxHeight = 960;
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };

    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

async function serializeImageFile(file) {
  const dataUrl = await readFileAsDataUrl(file);

  if (!dataUrl) {
    return '';
  }

  return compressImageDataUrl(dataUrl);
}

export async function createUserReportEntity({ user, values }) {
  const category =
    ADD_REPORT_CATEGORIES.find((item) => item.id === values?.categoryId) ||
    ADD_REPORT_CATEGORIES.find((item) => item.id === 'other');

  const severity =
    REPORT_SEVERITY_OPTIONS.find((item) => item.id === values?.severity) ||
    REPORT_SEVERITY_OPTIONS.find((item) => item.id === 'medium');

  const normalizedPosition = normalizeReportPosition(values?.position || user?.location);
  const locationDetails = buildReportLocationDetails(
    normalizedPosition,
    values?.locationText
  );

  const persistedImages = (
    await Promise.all((values?.images || []).slice(0, 4).map(serializeImageFile))
  ).filter(Boolean);

  const timestamp = new Date().toISOString();
  const reportId = `R-${String(Date.now()).slice(-6)}`;
  const reportTitle = values?.title?.trim() || `${category.label} يحتاج متابعة`;
  const coverImage =
    persistedImages[0] ||
    buildReportPreviewImage({
      title: reportTitle,
      categoryLabel: category.label,
      tone: INITIAL_STATUS.tone,
    });

  return {
    id: reportId,
    reportNumber: `RP-${String(Date.now()).slice(-6)}`,
    ownerId: String(user?.id ?? 'guest'),
    reporterName: user?.fullName || user?.name || 'مستخدم النظام',
    title: reportTitle,
    issue: category.label,
    categoryId: category.id,
    categoryLabel: category.label,
    categorySubtitle: category.subtitle,
    categoryTone: category.tone,
    description: values?.description?.trim() || '',
    severity: severity.id,
    severityLabel: severity.label,
    severityTone: severity.tone,
    status: INITIAL_STATUS.id,
    statusLabel: INITIAL_STATUS.label,
    statusTone: INITIAL_STATUS.tone,
    date: timestamp.slice(0, 10),
    createdAt: timestamp,
    updatedAt: timestamp,
    coverImage,
    images: persistedImages.length ? persistedImages : [coverImage],
    locationText: locationDetails.label,
    area: locationDetails.area,
    address: locationDetails.address,
    position: normalizedPosition,
  };
}

export default createUserReportEntity;
