import { adminAnalyticsMockData } from '../mocks/adminAnalyticsMockData';

function wait(value, delay = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

export async function getAdminAnalytics() {
  return wait(adminAnalyticsMockData);
}