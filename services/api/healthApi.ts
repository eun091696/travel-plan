import { apiClient } from './apiClient';

export async function checkHealth() {
  return apiClient.get('/api/health', { skipAuth: true });
}

export const healthApi = {
  checkHealth,
};
