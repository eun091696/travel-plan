import { apiClient } from './apiClient';
import { findLocalTrip } from './localTripStorage';
import { markLocalMode, markServerMode } from '../serverConnectionService';

function localChecklistToApiChecklist(trip) {
  return (trip?.checklist || []).map((item) => ({
    id: item.backendId || item.id,
    title: item.title || item.label,
    category: item.category || '기본',
    isChecked: Boolean(item.checked || item.isChecked),
  }));
}

async function fallback(action, fn) {
  try {
    const result = await action();
    markServerMode();
    return result;
  } catch (error) {
    if (error?.name === 'AuthRequiredError') {
      throw error;
    }
    console.log('[checklistApi] API unavailable. Using AsyncStorage fallback.', {
      message: error?.message,
    });
    markLocalMode(error);
    return fn();
  }
}

export async function getChecklists(tripId) {
  return fallback(
    () => apiClient.get(`/api/trips/${encodeURIComponent(tripId)}/checklists`),
    async () => localChecklistToApiChecklist(await findLocalTrip(tripId))
  );
}

export async function createChecklistItem(tripId, item) {
  return fallback(
    () => apiClient.post(`/api/trips/${encodeURIComponent(tripId)}/checklists`, item),
    async () => item
  );
}

export async function updateChecklistItem(checklistId, item) {
  return fallback(
    () => apiClient.put(`/api/checklists/${encodeURIComponent(checklistId)}`, item),
    async () => ({ ...item, id: checklistId })
  );
}

export async function deleteChecklistItem(checklistId) {
  return fallback(
    () => apiClient.delete(`/api/checklists/${encodeURIComponent(checklistId)}`),
    async () => true
  );
}

export const checklistApi = {
  getChecklists,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
};
