import axiosClient from '../../../../shared/services/api/axiosClient';

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

function extractDuplicateReport(error) {
  const status = error?.response?.status;
  const responseBody = error?.response?.data || {};
  const duplicateData = responseBody.data || responseBody.Data || {};

  const duplicateReportId =
    duplicateData.duplicateReportId ||
    duplicateData.DuplicateReportId ||
    duplicateData.reportId ||
    duplicateData.ReportId ||
    responseBody.duplicateReportId ||
    responseBody.DuplicateReportId ||
    responseBody.reportId ||
    responseBody.ReportId;

  if (status !== 409 || !duplicateReportId) {
    return null;
  }

  return {
    id: String(duplicateReportId),
    duplicateReportId: String(duplicateReportId),
    title:
      duplicateData.title ||
      duplicateData.Title ||
      responseBody.title ||
      responseBody.Title ||
      'بلاغ مشابه موجود بالفعل',
    address:
      duplicateData.address ||
      duplicateData.Address ||
      responseBody.address ||
      responseBody.Address ||
      '',
    status:
      duplicateData.status ||
      duplicateData.Status ||
      responseBody.status ||
      responseBody.Status ||
      '',
    distanceMeters:
      duplicateData.distanceMeters ??
      duplicateData.DistanceMeters ??
      responseBody.distanceMeters ??
      responseBody.DistanceMeters ??
      null,
    message:
      responseBody.message ||
      responseBody.Message ||
      'تم اكتشاف بلاغ مشابه في نفس المنطقة.',
    raw: responseBody,
  };
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
    location.addressLine ||
      location.address ||
      values.locationText ||
      ''
  );

  formData.append(
    'DetailedAddress',
    location.addressDetails ||
      location.detailedAddress ||
      ''
  );

  formData.append('IssueCategoryId', values.categoryId || '');

  const duplicateCheckValue = String(Boolean(ignoreDuplicateCheck));

  // Send both names defensively because the request is multipart/form-data.
  // Some .NET endpoints bind from the C# DTO property name, while the API
  // contract documents the camelCase field name. Both carry the same value.
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