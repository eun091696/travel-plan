import { apiClient } from './apiClient';
import { readLocalTrips, writeLocalTrips } from './localTripStorage';
import { markLocalMode, markServerMode } from '../serverConnectionService';

async function fallback(action, fn) {
  try {
    const result = await action();
    markServerMode();
    return result;
  } catch (error) {
    if (error?.name === 'AuthRequiredError') {
      throw error;
    }
    console.log('[tripApi] API unavailable. Using AsyncStorage fallback.', {
      message: error?.message,
    });
    markLocalMode(error);
    return fn();
  }
}

export async function getTrips() {
  return fallback(() => apiClient.get('/api/trips'), () => readLocalTrips());
}

export async function getTripById(id) {
  return fallback(
    () => apiClient.get(`/api/trips/${encodeURIComponent(id)}`),
    async () => {
      const trips = await readLocalTrips();
      return trips.find((trip) => String(trip.id) === String(id)) || null;
    }
  );
}

export async function createTrip(trip) {
  return fallback(
    () => apiClient.post('/api/trips', trip),
    async () => {
      const trips = await readLocalTrips();
      const localTrip = {
        ...trip,
        id: trip.id || `local-${Date.now()}`,
        savedAt: trip.savedAt || new Date().toISOString(),
      };
      const nextTrips = [localTrip, ...trips];
      await writeLocalTrips(nextTrips);
      return localTrip;
    }
  );
}

export async function updateTrip(id, trip) {
  return fallback(
    () => apiClient.put(`/api/trips/${encodeURIComponent(id)}`, trip),
    async () => {
      const trips = await readLocalTrips();
      const nextTrips = trips.map((item) => (String(item.id) === String(id) ? trip : item));
      await writeLocalTrips(nextTrips);
      return trip;
    }
  );
}

export async function deleteTrip(id) {
  return fallback(
    () => apiClient.delete(`/api/trips/${encodeURIComponent(id)}`),
    async () => {
      const trips = await readLocalTrips();
      await writeLocalTrips(trips.filter((trip) => String(trip.id) !== String(id)));
      return true;
    }
  );
}

export const tripApi = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
};
