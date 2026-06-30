import {
  companyAnalyticsStats,
  companyAnalyticsSummary,
  companyReportsTrendData,
  companyStatusDistributionData,
} from '../mocks/companyAnalyticsMockData';

function wait(value, delay = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

export async function getCompanyAnalyticsData() {
  return wait({
    stats: companyAnalyticsStats,
    summary: companyAnalyticsSummary,
    reportsTrend: companyReportsTrendData,
    statusDistribution: companyStatusDistributionData,
  });
}