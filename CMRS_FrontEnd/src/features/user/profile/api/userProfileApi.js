import {
  userProfileAchievements,
  userProfileFallback,
  userProfileRecentActivity,
} from '../mocks/userProfileMockData';

const STORAGE_KEY = 'cmrs:user-profile:v1';
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
      console.error('Unable to read user profile.', error);
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
      console.error('Unable to save user profile.', error);
    }
  }
}

function resolveUserId(user) {
  return String(user?.id || 'guest');
}

function buildProfileFromUser(user) {
  return {
    ...userProfileFallback,
    id: resolveUserId(user),
    fullName: user?.fullName || user?.name || userProfileFallback.fullName,
    email: user?.email || userProfileFallback.email,
    phone: user?.phone || userProfileFallback.phone,
    city: user?.city || userProfileFallback.city,
  };
}

function ensureUserProfile(user) {
  const userId = resolveUserId(user);
  const payload = readPayload();

  if (!payload[userId]) {
    const nextPayload = {
      ...payload,
      [userId]: buildProfileFromUser(user),
    };

    writePayload(nextPayload);

    return nextPayload[userId];
  }

  return {
    ...buildProfileFromUser(user),
    ...payload[userId],
    id: userId,
  };
}

export async function getUserProfile(user) {
  await wait();

  return {
    profile: clone(ensureUserProfile(user)),
    achievements: clone(userProfileAchievements),
    recentActivity: clone(userProfileRecentActivity),
  };
}

export async function updateUserProfile(user, updates) {
  await wait(220);

  const userId = resolveUserId(user);
  const payload = readPayload();
  const currentProfile = ensureUserProfile(user);

  const nextProfile = {
    ...currentProfile,
    ...updates,
    id: userId,
    updatedAt: new Date().toISOString(),
  };

  writePayload({
    ...payload,
    [userId]: nextProfile,
  });

  return clone(nextProfile);
}