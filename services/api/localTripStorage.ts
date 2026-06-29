import AsyncStorage from '@react-native-async-storage/async-storage';

export const SAVED_TRIPS_KEY = 'travel-plan:saved-plans';

export async function readLocalTrips() {
  const storedTrips = await AsyncStorage.getItem(SAVED_TRIPS_KEY);
  return storedTrips ? JSON.parse(storedTrips) : [];
}

export async function writeLocalTrips(trips) {
  await AsyncStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
  return trips;
}

export async function findLocalTrip(id) {
  const trips = await readLocalTrips();
  return trips.find((trip) => String(trip.id) === String(id)) || null;
}

export async function upsertLocalTrip(trip) {
  const trips = await readLocalTrips();
  const exists = trips.some((item) => String(item.id) === String(trip.id));
  const nextTrips = exists
    ? trips.map((item) => (String(item.id) === String(trip.id) ? trip : item))
    : [trip, ...trips];
  await writeLocalTrips(nextTrips);
  return trip;
}
