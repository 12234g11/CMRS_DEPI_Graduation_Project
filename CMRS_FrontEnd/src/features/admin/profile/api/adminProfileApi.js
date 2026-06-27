import { adminProfileMockData } from '../mocks/adminProfileMockData';

function wait(value, delay = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

export async function getAdminProfile() {
  return wait(adminProfileMockData);
}