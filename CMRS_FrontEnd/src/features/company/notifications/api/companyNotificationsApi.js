import {
  companyNotifications,
  getCompanyNotificationsStats,
} from '../mocks/companyNotificationsMockData';

let companyNotificationsStore = companyNotifications.map((notification) => ({
  ...notification,
}));

function wait(value, delay = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

function buildResponse() {
  const notifications = companyNotificationsStore.map((notification) => ({
    ...notification,
  }));

  return {
    notifications,
    stats: getCompanyNotificationsStats(notifications),
  };
}

export async function getCompanyNotificationsData() {
  return wait(buildResponse());
}

export async function markCompanyNotificationAsRead(notificationId) {
  companyNotificationsStore = companyNotificationsStore.map((notification) =>
    String(notification.id) === String(notificationId)
      ? { ...notification, isRead: true }
      : notification,
  );

  return wait(buildResponse());
}

export async function toggleCompanyNotificationRead(notificationId) {
  companyNotificationsStore = companyNotificationsStore.map((notification) =>
    String(notification.id) === String(notificationId)
      ? { ...notification, isRead: !notification.isRead }
      : notification,
  );

  return wait(buildResponse());
}

export async function markAllCompanyNotificationsAsRead() {
  companyNotificationsStore = companyNotificationsStore.map((notification) => ({
    ...notification,
    isRead: true,
  }));

  return wait(buildResponse());
}

export async function deleteCompanyNotification(notificationId) {
  companyNotificationsStore = companyNotificationsStore.filter(
    (notification) => String(notification.id) !== String(notificationId),
  );

  return wait(buildResponse());
}