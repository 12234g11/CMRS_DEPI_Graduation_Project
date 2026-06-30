import {
  companyProfileMockData,
  getCompanyProfileStats,
} from '../mocks/companyProfileMockData';

function wait(value, delay = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

export async function getCompanyProfileData() {
  return wait({
    profile: { ...companyProfileMockData },
    stats: getCompanyProfileStats(companyProfileMockData),
  });
}