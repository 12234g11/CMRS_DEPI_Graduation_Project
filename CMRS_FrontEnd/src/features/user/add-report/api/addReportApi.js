import axiosClient from '../../../../shared/services/api/axiosClient';
import { resolveAssetUrl } from '../../../../shared/services/api/assetUrl';

const PRIORITY_MAP = {
  low: 1,
  medium: 2,
  high: 3,
};

function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || 'حدث خطأ غير متوقع.';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  if (data.Message) {
    return data.Message;
  }

  if (data.title) {
    return data.title;
  }

  if (data.Title) {
    return data.Title;
  }

  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).flat().join(' ');
  }

  if (data.Errors && typeof data.Errors === 'object') {
    return Object.values(data.Errors).flat().join(' ');
  }

  return 'حدث خطأ أثناء تنفيذ الطلب.';
}

function getResponseBody(response) {
  return response?.data || {};
}

function getResponseData(response) {
  const body = getResponseBody(response);

  return body?.data ?? body?.Data ?? null;
}

function getResponseMessage(response, fallback = 'تم تنفيذ العملية بنجاح.') {
  const body = getResponseBody(response);

  return body?.message || body?.Message || fallback;
}

function sortCategoriesById(categories = []) {
  return [...categories].sort((a, b) => {
    const firstId = Number(a.categoryId);
    const secondId = Number(b.categoryId);

    if (Number.isNaN(firstId) || Number.isNaN(secondId)) {
      return String(a.categoryId || '').localeCompare(String(b.categoryId || ''));
    }

    return firstId - secondId;
  });
}

function cleanOptionalText(value) {
  const text = String(value ?? '').trim();

  if (!text || ['null', 'undefined', 'string'].includes(text.toLowerCase())) {
    return '';
  }

  return text;
}

function normalizeBoolean(value, fallback = false) {
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

function normalizeCount(value, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, numberValue);
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

  const normalizedValue = String(value).trim().toLowerCase();

  if (['up', 'upvote', 'correct', 'valid', 'true'].includes(normalizedValue)) {
    return 1;
  }

  if (
    ['down', 'downvote', 'incorrect', 'invalid', 'false'].includes(
      normalizedValue
    )
  ) {
    return -1;
  }

  return null;
}

function normalizeReportImages(report = {}) {
  const images =
    report.reportImages ||
    report.ReportImages ||
    report.images ||
    report.Images ||
    [];

  if (!Array.isArray(images)) return [];

  return images
    .map((image, index) => {
      const source = typeof image === 'string' ? { imageUrl: image } : image || {};
      const imageUrl =
        source.imageUrl ||
        source.ImageUrl ||
        source.url ||
        source.Url ||
        source.path ||
        source.Path ||
        '';

      return {
        ...source,
        id:
          source.imageId ||
          source.ImageId ||
          source.id ||
          source.Id ||
          `${imageUrl}-${index}`,
        imageUrl,
        fullImageUrl: resolveAssetUrl(imageUrl),
      };
    })
    .filter((image) => image.fullImageUrl);
}

function extractDuplicateReportFromBody(responseBody = {}, status = null) {
  const duplicateData = responseBody.data || responseBody.Data || {};
  const report =
    duplicateData.report ||
    duplicateData.Report ||
    duplicateData.duplicateReport ||
    duplicateData.DuplicateReport ||
    duplicateData ||
    {};

  const duplicateReportId =
    responseBody.duplicateReportId ||
    responseBody.DuplicateReportId ||
    duplicateData.duplicateReportId ||
    duplicateData.DuplicateReportId ||
    report.reportId ||
    report.ReportId ||
    report.id ||
    report.Id;

  const responseMessage =
    responseBody.message ||
    responseBody.Message ||
    'تم العثور على بلاغ مشابه في نفس المنطقة.';

  const normalizedMessage = String(responseMessage).toLowerCase();
  const isDuplicateResponse = Boolean(
    duplicateReportId &&
      (responseBody.success === false ||
        responseBody.Success === false ||
        status === 409 ||
        normalizedMessage.includes('مشابه') ||
        normalizedMessage.includes('duplicate'))
  );

  if (!isDuplicateResponse) {
    return null;
  }

  const area = report.area || report.Area || {};
  const city = cleanOptionalText(area.city || area.City);
  const addressLine = cleanOptionalText(area.address || area.Address);
  const address = [city, addressLine].filter(Boolean).join(' - ');

  const isOwnedByCurrentUser = normalizeBoolean(
    report.isOwnedByCurrentUser ?? report.IsOwnedByCurrentUser,
    false
  );
  const isVerifiedByCurrentUser = normalizeBoolean(
    report.isVerifiedByCurrentUser ?? report.IsVerifiedByCurrentUser,
    false
  );

  const currentUserVerifyVote =
    normalizeVerifyVote(
      report.currentUserVerifyVote ??
        report.CurrentUserVerifyVote ??
        report.verifyVote ??
        report.VerifyVote ??
        report.userVote ??
        report.UserVote
    ) ?? (isVerifiedByCurrentUser ? 1 : null);

  return {
    id: String(duplicateReportId),
    duplicateReportId: String(duplicateReportId),
    reportNumber: String(
      report.reportNumber ||
        report.ReportNumber ||
        report.reportId ||
        report.ReportId ||
        duplicateReportId
    ),
    title:
      report.title ||
      report.Title ||
      duplicateData.title ||
      duplicateData.Title ||
      'بلاغ مشابه موجود بالفعل',
    description: report.description || report.Description || '',
    ownerUserId: report.ownerUserId || report.OwnerUserId || '',
    ownerUserName:
      report.ownerUserName || report.OwnerUserName || report.userName || '—',
    isOwnedByCurrentUser,
    issueCategoryId:
      report.issueCategoryId || report.IssueCategoryId || report.categoryId || '',
    issueCategoryName:
      report.issueCategoryName ||
      report.IssueCategoryName ||
      report.categoryName ||
      report.CategoryName ||
      'أخرى',
    status: report.status || report.Status || '',
    statusLabel:
      report.statusLabel || report.StatusLabel || report.status || 'غير محدد',
    priority: report.priority ?? report.Priority ?? null,
    priorityLabel:
      report.priorityLabel ||
      report.PriorityLabel ||
      report.priority ||
      report.Priority ||
      '—',
    area: {
      city,
      address: addressLine,
    },
    address,
    latitude: Number(report.latitude ?? report.Latitude),
    longitude: Number(report.longitude ?? report.Longitude),
    followersCount: normalizeCount(
      report.followersCount ?? report.FollowersCount
    ),
    isFollowedByCurrentUser: normalizeBoolean(
      report.isFollowedByCurrentUser ?? report.IsFollowedByCurrentUser,
      false
    ),
    upvoteCount: normalizeCount(report.upvoteCount ?? report.UpvoteCount),
    downvoteCount: normalizeCount(report.downvoteCount ?? report.DownvoteCount),
    verifyCount: normalizeCount(
      report.verifyCount ??
        report.VerifyCount ??
        Number(report.upvoteCount ?? report.UpvoteCount ?? 0) +
          Number(report.downvoteCount ?? report.DownvoteCount ?? 0)
    ),
    isVerifiedByCurrentUser,
    currentUserVerifyVote,
    createdAt: report.createdAt || report.CreatedAt || null,
    updatedAt: report.updatedAt || report.UpdatedAt || null,
    reportImages: normalizeReportImages(report),
    distanceMeters:
      duplicateData.distanceMeters ??
      duplicateData.DistanceMeters ??
      responseBody.distanceMeters ??
      responseBody.DistanceMeters ??
      null,
    message: responseMessage,
    raw: responseBody,
  };
}

function extractDuplicateReport(error) {
  return extractDuplicateReportFromBody(
    error?.response?.data || {},
    error?.response?.status ?? null
  );
}

function getSelectedPosition(values = {}) {
  const location = values.location || {};

  return (
    values.position ||
    location.confirmedCoordinates ||
    location.coordinates ||
    null
  );
}

function buildCreateReportFormData(
  payload,
  { ignoreDuplicateCheck = false } = {}
) {
  const values = payload?.values || {};
  const location = values.location || {};
  const position = getSelectedPosition(values);

  const formData = new FormData();

  formData.append('Title', values.title || '');
  formData.append('Description', values.description || '');

  formData.append('Latitude', String(position?.lat ?? ''));
  formData.append('Longitude', String(position?.lng ?? ''));

  formData.append(
    'Priority',
    String(PRIORITY_MAP[values.severity] ?? PRIORITY_MAP.medium)
  );

  formData.append(
    'City',
    location.governorateLabel ||
      location.previewGovernorate ||
      location.city ||
      ''
  );

  formData.append(
    'Address',
    location.addressLine || location.address || values.locationText || ''
  );

  formData.append('IssueCategoryId', values.categoryId || '');

  const duplicateCheckValue = String(Boolean(ignoreDuplicateCheck));

  formData.append('ignoreDuplicateCheck', duplicateCheckValue);
  formData.append('IgnoreDuplicateCheck', duplicateCheckValue);

  (values.images || []).forEach((file) => {
    formData.append('ReportImages', file);
  });

  return formData;
}

function buildCreatedReport(response) {
  const data = getResponseData(response);
  const message = getResponseMessage(response, 'تم إنشاء البلاغ بنجاح.');

  return {
    ...(data || {}),
    message,
  };
}

export async function getIssueCategories() {
  try {
    const response = await axiosClient.get('/api/Report/categories');
    const data = getResponseData(response);

    if (!Array.isArray(data)) {
      return [];
    }

    return sortCategoriesById(data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getIssueCategoryById(id) {
  if (!id) {
    throw new Error('لم يتم تحديد نوع البلاغ.');
  }

  try {
    const response = await axiosClient.get(
      `/api/Report/categories/${encodeURIComponent(id)}`
    );

    return getResponseData(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function createAddReportSubmission(
  payload,
  options = { ignoreDuplicateCheck: false }
) {
  const formData = buildCreateReportFormData(payload, options);

  try {
    const response = await axiosClient.post('/api/Report', formData);
    const responseBody = getResponseBody(response);
    const duplicateReport = extractDuplicateReportFromBody(
      responseBody,
      response?.status ?? null
    );

    if (duplicateReport) {
      return {
        type: 'duplicate',
        duplicateReport,
        originalPayload: payload,
      };
    }

    if (responseBody.success === false || responseBody.Success === false) {
      throw new Error(getResponseMessage(response, 'تعذر إرسال البلاغ حاليًا.'));
    }

    return {
      type: 'created',
      report: buildCreatedReport(response),
    };
  } catch (error) {
    const duplicateReport = extractDuplicateReport(error);

    if (duplicateReport) {
      return {
        type: 'duplicate',
        duplicateReport,
        originalPayload: payload,
      };
    }

    if (error instanceof Error && !error?.response) {
      throw error;
    }

    throw new Error(getApiErrorMessage(error));
  }
}

export async function confirmDuplicateReport(reportId) {
  if (!reportId) {
    throw new Error('لا يوجد رقم بلاغ لتأكيد التكرار.');
  }

  try {
    const response = await axiosClient.post(
      `/api/Report/${encodeURIComponent(reportId)}/confirm-duplicate`
    );

    return {
      success: response?.data?.success ?? response?.data?.Success ?? true,
      message:
        response?.data?.message ||
        response?.data?.Message ||
        'تم تأكيد المشكلة بنجاح.',
      data: response?.data?.data || response?.data?.Data || null,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function followDuplicateReport(
  reportId,
  { currentLatitude, currentLongitude } = {}
) {
  if (!reportId) {
    throw new Error('معرّف البلاغ غير متاح.');
  }

  const latitude = Number(currentLatitude);
  const longitude = Number(currentLongitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('تعذر تحديد موقع البلاغ الحالي لإتمام المتابعة.');
  }

  try {
    const response = await axiosClient.post(
      `/api/Follow/reports/${encodeURIComponent(reportId)}`,
      {
        currentLatitude: latitude,
        currentLongitude: longitude,
      }
    );

    return getResponseData(response) || {};
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function unfollowDuplicateReport(reportId) {
  if (!reportId) {
    throw new Error('معرّف البلاغ غير متاح.');
  }

  try {
    const response = await axiosClient.delete(
      `/api/Follow/reports/${encodeURIComponent(reportId)}`
    );

    return getResponseData(response) || {};
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function verifyDuplicateReport(reportId, vote = 1) {
  if (!reportId) {
    throw new Error('معرّف البلاغ غير متاح.');
  }

  const normalizedVote = Number(vote) === -1 ? -1 : 1;

  try {
    const response = await axiosClient.post(
      `/api/Report/${encodeURIComponent(reportId)}/verify`,
      {
        reportId,
        vote: normalizedVote,
      }
    );

    return getResponseData(response) || {};
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function unverifyDuplicateReport(reportId) {
  if (!reportId) {
    throw new Error('معرّف البلاغ غير متاح.');
  }

  try {
    const response = await axiosClient.delete(
      `/api/Report/${encodeURIComponent(reportId)}/verify`,
      {
        data: {
          reportId,
        },
      }
    );

    return getResponseData(response) || {};
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
