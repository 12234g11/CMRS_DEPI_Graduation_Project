export const ADD_REPORT_STEPS = [
  {
    id: 1,
    title: 'الفئة',
    subtitle: 'Category',
  },
  {
    id: 2,
    title: 'التفاصيل',
    subtitle: 'Details',
  },
  {
    id: 3,
    title: 'الموقع',
    subtitle: 'Location',
  },
  {
    id: 4,
    title: 'إرسال',
    subtitle: 'Submit',
  },
];

export const REPORT_DETAILS_LIMITS = {
  maxImages: 5,
  minImages: 1,
  maxImageSizeMb: 5,

  maxTitleLength: 100,
  minTitleLength: 5,

  maxDescriptionLength: 500,
  minDescriptionLength: 10,

  allowedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedImageExtensions: ['jpg', 'jpeg', 'png', 'webp'],
};