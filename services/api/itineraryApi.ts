import { apiClient } from './apiClient';
import { findLocalTrip, upsertLocalTrip } from './localTripStorage';
import { markLocalMode, markServerMode } from '../serverConnectionService';

function toApiDay(day) {
  return {
    id: day.id,
    dayNumber: day.day,
    date: day.date,
    items: (day.items || []).map((item, index) => ({
      id: item.backendId || item.id,
      time: item.time || '09:00',
      title: item.title || item.placeName || '일정',
      description: item.description || '',
      category: item.category || item.type || '관광지',
      placeName: item.placeName || item.title || '장소',
      address: item.address || '',
      latitude: item.latitude,
      longitude: item.longitude,
      sortOrder: item.sortOrder ?? index,
      isCompleted: Boolean(item.completed || item.isCompleted),
    })),
  };
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
    console.log('[itineraryApi] API unavailable. Using AsyncStorage fallback.', {
      message: error?.message,
    });
    markLocalMode(error);
    return fn();
  }
}

export async function getItinerary(tripId) {
  return fallback(
    () => apiClient.get(`/api/trips/${encodeURIComponent(tripId)}/itinerary`),
    async () => {
      const trip = await findLocalTrip(tripId);
      return (trip?.days || []).map(toApiDay);
    }
  );
}

export async function createItineraryItem(tripId, item) {
  return fallback(
    () => apiClient.post(`/api/trips/${encodeURIComponent(tripId)}/itinerary/items`, item),
    async () => item
  );
}

export async function updateItineraryItem(itemId, item) {
  return fallback(
    () => apiClient.put(`/api/itinerary/items/${encodeURIComponent(itemId)}`, item),
    async () => ({ ...item, id: itemId })
  );
}

export async function deleteItineraryItem(itemId) {
  return fallback(
    () => apiClient.delete(`/api/itinerary/items/${encodeURIComponent(itemId)}`),
    async () => true
  );
}

export async function replaceLocalItinerary(tripId, days) {
  const trip = await findLocalTrip(tripId);
  if (!trip) return null;
  return upsertLocalTrip({ ...trip, days });
}

export const itineraryApi = {
  getItinerary,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  replaceLocalItinerary,
};
