import {
  adminDashboardPriorityOptions,
  adminDashboardProblemTypeOptions,
  adminDashboardReports,
  adminDashboardStats,
  adminDashboardStatusOptions,
} from '../mocks/adminDashboardMockData';

export async function getAdminDashboardData() {
  return Promise.resolve({
    stats: adminDashboardStats,
    reports: adminDashboardReports,
    filters: {
      problemTypes: adminDashboardProblemTypeOptions,
      statuses: adminDashboardStatusOptions,
      priorities: adminDashboardPriorityOptions,
    },
  });
}