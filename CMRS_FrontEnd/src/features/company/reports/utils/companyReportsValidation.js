export const MAX_REPORT_IMAGES = 5;
export const MAX_REPORT_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_REPORT_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

function getFileExtension(fileName = '') {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export function validateReportImageFile(file) {
  if (!file) return 'ملف الصورة غير صالح.';

  if (!file.size) {
    return `الصورة "${file.name || 'المختارة'}" فارغة ولا يمكن رفعها.`;
  }

  const extension = getFileExtension(file.name);
  const isAcceptedExtension = ACCEPTED_REPORT_IMAGE_EXTENSIONS.includes(extension);
  const isAcceptedMime = !file.type || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);

  if (!isAcceptedExtension || !isAcceptedMime) {
    return `الصورة "${file.name}" غير مدعومة. الصيغ المسموحة: JPG وJPEG وPNG وWEBP.`;
  }

  if (file.size > MAX_REPORT_IMAGE_SIZE) {
    return `حجم الصورة "${file.name}" أكبر من 5 ميجابايت.`;
  }

  return '';
}

export function isDuplicateImage(file, currentImages = []) {
  return currentImages.some(
    (image) =>
      image.file?.name === file.name &&
      image.file?.size === file.size &&
      image.file?.lastModified === file.lastModified,
  );
}

export function validateRequiredText(value, {
  label,
  minLength,
  maxLength,
}) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return `${label} مطلوب ولا يمكن تركه فارغًا.`;
  }

  if (normalizedValue.length < minLength) {
    return `${label} يجب ألا يقل عن ${minLength} أحرف.`;
  }

  if (normalizedValue.length > maxLength) {
    return `${label} يجب ألا يزيد عن ${maxLength} حرفًا.`;
  }

  return '';
}
