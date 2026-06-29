import { healthApi } from './api/healthApi';

const listeners = new Set();

let state = {
  isChecking: true,
  isServerConnected: false,
  storageMode: 'local',
  message: '서버 연결을 확인하는 중입니다',
  lastError: null,
};

function emit() {
  listeners.forEach((listener) => listener(state));
}

export function getServerConnectionState() {
  return state;
}

export function subscribeServerConnection(listener) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export function markServerMode() {
  state = {
    ...state,
    isChecking: false,
    isServerConnected: true,
    storageMode: 'server',
    message: '서버 연결됨',
    lastError: null,
  };
  emit();
}

export function markLocalMode(error) {
  if (error) {
    console.log('[serverConnectionService] switching to local storage mode', {
      message: error?.message,
      name: error?.name,
    });
  }

  state = {
    ...state,
    isChecking: false,
    isServerConnected: false,
    storageMode: 'local',
    message: '서버 연결이 불안정하여 로컬 저장소를 사용합니다',
    lastError: error?.message || null,
  };
  emit();
}

export async function checkServerConnection() {
  state = {
    ...state,
    isChecking: true,
    message: '서버 연결을 확인하는 중입니다',
  };
  emit();

  try {
    await healthApi.checkHealth();
    markServerMode();
    return true;
  } catch (error) {
    console.log('[serverConnectionService] health check failed', {
      message: error?.message,
      name: error?.name,
    });
    markLocalMode(error);
    return false;
  }
}

export const serverConnectionService = {
  getServerConnectionState,
  subscribeServerConnection,
  checkServerConnection,
  markServerMode,
  markLocalMode,
};
