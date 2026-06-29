import {
  companyDashboardCompany,
  companyDashboardPriorityOptions,
  companyDashboardProblemTypeOptions,
  companyDashboardReports,
  companyDashboardStats,
  companyDashboardStatusOptions,
} from '../mocks/companyDashboardMockData';

export async function getCompanyDashboardData() {
  return Promise.resolve({
    company: companyDashboardCompany,
    stats: companyDashboardStats,
    reports: companyDashboardReports,
    filters: {
      problemTypes: companyDashboardProblemTypeOptions,
      statuses: companyDashboardStatusOptions,
      priorities: companyDashboardPriorityOptions,
    },
  });
}