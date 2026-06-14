import { userNotificationsMockData } from '../mocks/userNotificationsMockData';

const STORAGE_KEY = 'cmrs:user-notifications:v1';
let memoryPayload = {};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function wait(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function resolveUserId(userId) {
  return String(userId || 'guest');
}

function sortNotifications(notifications = []) {
  return [...notifications].sort((firstItem, secondItem) => {
    const firstDate = new Date(firstItem.createdAt).getTime();
    const secondDate = new Date(secondItem.createdAt).getTime();

    return secondDate - firstDate;
  });
}

function readPayload() {
  if (canUseStorage()) {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);

        if (parsedValue && typeof parsedValue === 'object') {
          memoryPayload = parsedValue;
          return parsedValue;
        }
      }
    } catch (error) {
      console.error('Unable to read user notifications.', error);
    }
  }

  return memoryPayload;
}

function writePayload(payload) {
  memoryPayload = payload;

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Unable to save user notifications.', error);
    }
  }
}

function createSeedForUser(userId) {
  return userNotificationsMockData.map((notification) => ({
    ...notification,
    ownerId: userId,
  }));
}

function ensureUserNotifications(userId) {
  const resolvedUserId = resolveUserId(userId);
  const payload = readPayload();

  if (!Array.isArray(payload[resolvedUserId])) {
    const nextPayload = {
      ...payload,
      [resolvedUserId]: createSeedForUser(resolvedUserId),
    };

    writePayload(nextPayload);

    return nextPayload[resolvedUserId];
  }

  return payload[resolvedUserId];
}

export async function getUserNotifications(userId) {
  await wait();

  return sortNotifications(clone(ensureUserNotifications(userId)));
}

export async function markUserNotificationAsRead({ userId, notificationId }) {
  await wait(120);

  const resolvedUserId = resolveUserId(userId);
  const payload = readPayload();
  const currentNotifications = ensureUserNotifications(resolvedUserId);

  const nextNotifications = currentNotifications.map((notification) =>
    notification.id === notificationId
      ? { ...notification, isRead: true }
      : notification
  );

  writePayload({
    ...payload,
    [resolvedUserId]: nextNotifications,
  });

  return sortNotifications(clone(nextNotifications));
}

export async function markAllUserNotificationsAsRead(userId) {
  await wait(140);

  const resolvedUserId = resolveUserId(userId);
  const payload = readPayload();
  const currentNotifications = ensureUserNotifications(resolvedUserId);

  const nextNotifications = currentNotifications.map((notification) => ({
    ...notification,
    isRead: true,
  }));

  writePayload({
    ...payload,
    [resolvedUserId]: nextNotifications,
  });

  return sortNotifications(clone(nextNotifications));
}

export async function deleteUserNotification({ userId, notificationId }) {
  await wait(120);

  const resolvedUserId = resolveUserId(userId);
  const payload = readPayload();
  const currentNotifications = ensureUserNotifications(resolvedUserId);

  const nextNotifications = currentNotifications.filter(
    (notification) => notification.id !== notificationId
  );

  writePayload({
    ...payload,
    [resolvedUserId]: nextNotifications,
  });

  return sortNotifications(clone(nextNotifications));
}

export async function clearUserNotifications(userId) {
  await wait(140);

  const resolvedUserId = resolveUserId(userId);
  const payload = readPayload();

  writePayload({
    ...payload,
    [resolvedUserId]: [],
  });

  return [];
}