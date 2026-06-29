import { mockPlaceData } from '../data/mockPlaceData';

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function getDestinationPlaceKey(destination) {
  const joined = normalize([
    destination?.id,
    destination?.destinationId,
    destination?.englishName,
    destination?.destinationEnglishName,
    destination?.name,
    destination?.destination,
  ].filter(Boolean).join(' '));

  if (joined.includes('tokyo') || joined.includes('도쿄')) return 'tokyo';
  if (joined.includes('osaka') || joined.includes('오사카')) return 'osaka';
  if (joined.includes('jeju') || joined.includes('제주')) return 'jeju';
  if (joined.includes('da nang') || joined.includes('danang') || joined.includes('다낭')) return 'danang';
  if (joined.includes('bangkok') || joined.includes('방콕')) return 'bangkok';
  return destination?.id || destination?.destinationId || 'tokyo';
}

function getMockPlaces(destination, category, limit = 5) {
  const destinationKey = getDestinationPlaceKey(destination);
  const places = mockPlaceData[destinationKey]?.[category] || mockPlaceData.tokyo[category] || [];
  return places.slice(0, limit);
}

async function fetchPlacesFromProvider({ destination, coordinates, category, limit }) {
  // Future provider seam:
  // - Google Places: Text Search / Nearby Search
  // - Kakao Local: keyword/category search
  // - Naver Local: local search
  // Keep the normalized return shape identical to mockPlaceData.
  const query = destination?.englishName || destination?.destinationEnglishName || destination?.name || destination?.destination;
  const encodedQuery = encodeURIComponent(query || '');
  console.log('[placeService] external provider is not configured yet. Falling back to mock data.', {
    category,
    limit,
    query: encodedQuery,
    coordinates,
  });
  throw new Error('Place provider is not configured.');
}

export async function getPlacesByRegion({ destination, coordinates, category = 'attractions', limit = 5 }) {
  try {
    return {
      source: 'api',
      places: await fetchPlacesFromProvider({ destination, coordinates, category, limit }),
      error: null,
    };
  } catch (error) {
    console.log('[placeService] place lookup failed. Using mockPlaceData fallback.', {
      message: error?.message,
      category,
      destination: destination?.name || destination?.destination || destination?.englishName,
    });
    return {
      source: 'mock',
      places: getMockPlaces(destination, category, limit),
      error: '장소 정보를 불러오지 못해 임시 데이터를 표시합니다',
    };
  }
}

export async function getRegionPlaceGroups({ destination, coordinates, limit = 5 }) {
  const [attractions, restaurants] = await Promise.all([
    getPlacesByRegion({ destination, coordinates, category: 'attractions', limit }),
    getPlacesByRegion({ destination, coordinates, category: 'restaurants', limit }),
  ]);

  return {
    attractions: attractions.places,
    restaurants: restaurants.places,
    source: attractions.source === 'api' || restaurants.source === 'api' ? 'api' : 'mock',
    error: attractions.error || restaurants.error,
  };
}

export function getMockPlacesForItinerary(destination, style = 'default') {
  const attractions = getMockPlaces(destination, 'attractions', 5);
  const restaurants = getMockPlaces(destination, 'restaurants', 5);
  const normalizedStyle = normalize(style);

  if (normalizedStyle.includes('맛집') || normalizedStyle.includes('미식') || normalizedStyle.includes('food')) {
    return [...restaurants, ...attractions];
  }

  if (normalizedStyle.includes('커플') || normalizedStyle.includes('couple')) {
    return [...attractions.slice(0, 2), ...restaurants.slice(-2), ...attractions.slice(2)];
  }

  if (normalizedStyle.includes('힐링') || normalizedStyle.includes('휴양') || normalizedStyle.includes('healing')) {
    return attractions.filter((place) => /공원|해변|숲|정원|산책|Beach|Park/i.test(place.name + place.description)).concat(attractions, restaurants);
  }

  return [...attractions, ...restaurants];
}
