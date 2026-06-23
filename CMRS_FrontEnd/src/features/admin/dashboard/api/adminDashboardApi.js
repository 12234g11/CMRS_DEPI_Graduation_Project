import {
  adminDashboardCompanies,
  adminDashboardMapMarkers,
  adminDashboardReports,
  adminDashboardReportsMapLegend,
  adminDashboardStats,
} from '../mocks/adminDashboardMockData';

export async function getAdminDashboardData() {
  return Promise.resolve({
    stats: adminDashboardStats,
    mapMarkers: adminDashboardMapMarkers,
    mapLegend: adminDashboardReportsMapLegend,
    companies: adminDashboardCompanies,
    reports: adminDashboardReports,
  });
}