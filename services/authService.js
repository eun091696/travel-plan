import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_USER_ID_KEY = 'travel-plan:mock-user-id';
const MOCK_USER_KEY = 'travel-plan:mock-user';

export class AuthRequiredError extends Error {
  constructor() {
    super('로그인이 필요합니다.');
    this.name = 'AuthRequiredError';
  }
}

function createGuestUser() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const userId = `guest-${suffix}`;
  return {
    id: userId,
    userId,
    type: 'guest',
    name: '게스트 여행자',
    email: `${userId}@guest.travel-plan.local`,
    createdAt: new Date().toISOString(),
  };
}

export async function getCurrentUser() {
  const storedUser = await AsyncStorage.getItem(MOCK_USER_KEY);
  if (storedUser) return JSON.parse(storedUser);

  const storedUserId = await AsyncStorage.getItem(MOCK_USER_ID_KEY);
  if (!storedUserId) return null;

  const migratedUser = {
    id: storedUserId,
    userId: storedUserId,
    type: 'guest',
    name: '게스트 여행자',
    email: `${storedUserId}@guest.travel-plan.local`,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(migratedUser));
  return migratedUser;
}

export async function loginAsGuest() {
  const guestUser = createGuestUser();
  await AsyncStorage.setItem(MOCK_USER_ID_KEY, guestUser.userId);
  await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(guestUser));
  return guestUser;
}

export async function logout() {
  await AsyncStorage.removeItem(MOCK_USER_KEY);
  await AsyncStorage.removeItem(MOCK_USER_ID_KEY);
  return true;
}

export async function getMockUserId() {
  const currentUser = await getCurrentUser();
  return currentUser?.userId || null;
}

export async function setMockUserId(userId) {
  const nextUserId = String(userId || '').trim();
  if (!nextUserId) return logout();
  const user = {
    id: nextUserId,
    userId: nextUserId,
    type: 'guest',
    name: '게스트 여행자',
    email: `${nextUserId}@guest.travel-plan.local`,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(MOCK_USER_ID_KEY, nextUserId);
  await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  return user;
}

export async function getAuthHeaders() {
  const mockUserId = await getMockUserId();
  if (!mockUserId) {
    throw new AuthRequiredError();
  }
  return { 'X-Mock-User-Id': mockUserId };
}

export const authService = {
  getCurrentUser,
  loginAsGuest,
  logout,
  AuthRequiredError,
  getMockUserId,
  setMockUserId,
  getAuthHeaders,
};
