import { userReportsSeed } from '../mocks/userReportsMockData';
import { buildReportPreviewImage } from '../utils/buildReportPreviewImage';
import { createUserReportEntity } from '../utils/createUserReportEntity';

const STORAGE_KEY = 'cmrs:user-reports:v1';
export const USER_REPORTS_UPDATED_EVENT = 'cmrs:user-reports:updated';

let memoryPayload = {};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function cloneReports(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortReports(reports = []) {
  return [...reports].sort((firstReport, secondReport) => {
    const firstDate = new Date(firstReport.updatedAt || firstReport.createdAt || firstReport.date).getTime();
    const secondDate = new Date(secondReport.updatedAt || secondReport.createdAt || secondReport.date).getTime();

    return secondDate - firstDate;
  });
}

function normalizeReport(report = {}) {
  const fallbackImage =
    report.coverImage ||
    report.images?.[0] ||
    buildReportPreviewImage({
      title: report.title || report.issue || 'بلاغ جديد',
      categoryLabel: report.categoryLabel || report.issue || 'أخرى',
      tone: report.statusTone || 'warning',
    });

  return {
    ...report,
    ownerId: String(report.ownerId ?? 'guest'),
    coverImage: fallbackImage,
    images: Array.isArray(report.images) && report.images.length ? report.images : [fallbackImage],
    issue: report.issue || report.categoryLabel || 'أخرى',
    categoryLabel: report.categoryLabel || report.issue || 'أخرى',
    date: report.date || String(report.createdAt || '').slice(0, 10),
  };
}

function readStoragePayload() {
  if (canUseStorage()) {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      if (rawValue) {
        const parsedValue = JSON.parse(rawValue);
        if (parsedValue && typeof parsedValue === 'object') {
          memoryPayload = parsedValue;
          return parsedValue;
        }
      }
    } catch (error) {
      console.error('Unable to read stored user reports.', error);
    }
  }

  return memoryPayload;
}

function writeStoragePayload(nextPayload) {
  memoryPayload = cloneReports(nextPayload);

  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPayload));
  } catch (error) {
    console.error('Unable to persist user reports.', error);
  }
}

function emitReportsUpdate(userId) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(USER_REPORTS_UPDATED_EVENT, {
      detail: { userId: String(userId ?? 'guest') },
    })
  );
}

function buildSeedReportsForUser(userId) {
  return sortReports(
    cloneReports(
      userReportsSeed.map((report) => ({
        ...report,
        ownerId: String(userId ?? report.ownerId ?? 'guest'),
      }))
    )
  );
}

export function getStoredUserReports(userId) {
  const normalizedUserId = String(userId ?? 'guest');
  const payload = readStoragePayload();
  const userReports = payload?.[normalizedUserId];

  if (Array.isArray(userReports) && userReports.length) {
    return sortReports(userReports.map(normalizeReport));
  }

  const seededReports = buildSeedReportsForUser(normalizedUserId);
  const nextPayload = {
    ...payload,
    [normalizedUserId]: seededReports,
  };

  writeStoragePayload(nextPayload);

  return seededReports;
}

export async function createStoredUserReport({ user, values }) {
  const normalizedUserId = String(user?.id ?? 'guest');
  const nextReport = await createUserReportEntity({ user, values });
  const payload = readStoragePayload();
  const currentReports = getStoredUserReports(normalizedUserId);
  const nextReports = sortReports([nextReport, ...currentReports]);
  const nextPayload = {
    ...payload,
    [normalizedUserId]: nextReports,
  };

  writeStoragePayload(nextPayload);
  emitReportsUpdate(normalizedUserId);

  return nextReport;
}
