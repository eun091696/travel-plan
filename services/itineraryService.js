import { defaultAiItineraryProvider } from './aiItineraryProvider';
import { getRegionPlaceGroups } from './placeService';
import { getWeatherForTrip } from './weatherService';

export async function generateItinerary({
  destination,
  startDate,
  endDate,
  arrivalTime,
  departureTime,
  budget,
  companions,
  style,
  placeData,
  weatherData,
  provider = defaultAiItineraryProvider,
}) {
  const resolvedPlaceData =
    placeData ||
    (await getRegionPlaceGroups({
      destination,
      limit: 5,
    }));

  const resolvedWeatherData =
    weatherData ||
    (await getWeatherForTrip({
      destination,
      date: startDate,
    }));

  return provider.generate({
    destination,
    startDate,
    endDate,
    arrivalTime,
    departureTime,
    budget,
    companions,
    style,
    placeData: resolvedPlaceData,
    weatherData: resolvedWeatherData,
  });
}

export const itineraryService = {
  generateItinerary,
};
