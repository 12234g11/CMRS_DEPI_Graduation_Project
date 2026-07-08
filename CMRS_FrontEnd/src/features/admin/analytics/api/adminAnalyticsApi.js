import { get } from '../../../../shared/services/api/request';

const ADMIN_ANALYTICS_ENDPOINT = '/api/Admin/analytics';

const DEFAULT_REPORT_TYPE_COLORS = [
  '#1f2358',
  '#163fad',
  '#5c66b8',
  '#927df1',
  '#3f2b82',
  '#0f766e',
  '#f59e0b',
  '#ef4444',
];

const EMPTY_ANALYTICS_DATA = {
  summaryCards: [],
  reportsOverTime: [],
  reportTypes: [],
};

function getResponseData(response) {
  const responseBody = response?.data ?? response;

  return responseBody?.data ?? responseBody ?? EMPTY_ANALYTICS_DATA;
}

function toNumber(value, fallback = 0) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeSummaryCards(summaryCards) {
  if (!Array.isArray(summaryCards)) return [];

  return summaryCards.map((card, index) => ({
    id: card?.id || `summary-card-${index + 1}`,
    label: card?.label || '',
    subtitle: card?.subtitle || '',
    value: card?.value ?? 0,
    change: toNumber(card?.change),
    icon: card?.icon || 'file',
    tone: card?.tone || 'blue',
  }));
}

function normalizeReportsOverTime(reportsOverTime) {
  if (!Array.isArray(reportsOverTime)) return [];

  return reportsOverTime.map((item, index) => ({
    label: item?.label || `${index + 1}`,
    value: toNumber(item?.value),
  }));
}

function normalizeReportTypes(reportTypes) {
  if (!Array.isArray(reportTypes)) return [];

  return reportTypes
    .map((item, index) => ({
      id: item?.id || `report-type-${index + 1}`,
      label: item?.label || '',
      value: Math.max(toNumber(item?.value), 0),
      color:
        item?.color ||
        DEFAULT_REPORT_TYPE_COLORS[index % DEFAULT_REPORT_TYPE_COLORS.length],
    }))
    .filter((item) => item.value > 0);
}

function normalizeAnalyticsData(data) {
  return {
    summaryCards: normalizeSummaryCards(data?.summaryCards),
    reportsOverTime: normalizeReportsOverTime(data?.reportsOverTime),
    reportTypes: normalizeReportTypes(data?.reportTypes),
  };
}

export async function getAdminAnalytics(params = {}) {
  const response = await get(ADMIN_ANALYTICS_ENDPOINT, { params });
  const data = getResponseData(response);

  return normalizeAnalyticsData(data);
}
