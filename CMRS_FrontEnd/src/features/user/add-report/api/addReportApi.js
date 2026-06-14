import { createStoredUserReport } from '../../reports/api/mockUserReportsStore';

function wait(duration = 420) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export async function createAddReportSubmission(payload) {
  await wait();
  return createStoredUserReport(payload);
}
