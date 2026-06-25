const destinationCenters = {
  tokyo: { latitude: 35.6762, longitude: 139.6503 },
  osaka: { latitude: 34.6937, longitude: 135.5023 },
  jeju: { latitude: 33.4996, longitude: 126.5312 },
  danang: { latitude: 16.0544, longitude: 108.2022 },
  bangkok: { latitude: 13.7563, longitude: 100.5018 },
};

const placeCoordinates = {
  tokyo: {
    'tokyo arrival': { latitude: 35.5494, longitude: 139.7798 },
    '도착': { latitude: 35.5494, longitude: 139.7798 },
    '공항': { latitude: 35.5494, longitude: 139.7798 },
    'tsukiji outer market': { latitude: 35.6655, longitude: 139.7707 },
    'ginza kagari': { latitude: 35.672, longitude: 139.7653 },
    'cafe kitsune': { latitude: 35.6656, longitude: 139.7123 },
    'omoide yokocho': { latitude: 35.6938, longitude: 139.6991 },
    'ichiran ramen': { latitude: 35.6921, longitude: 139.7005 },
    'sushi dai': { latitude: 35.6467, longitude: 139.7801 },
  },
  osaka: {
    '도착': { latitude: 34.4347, longitude: 135.2441 },
    '공항': { latitude: 34.4347, longitude: 135.2441 },
    mizuno: { latitude: 34.6687, longitude: 135.5024 },
    'kushikatsu daruma': { latitude: 34.6525, longitude: 135.5063 },
    'kuromon market': { latitude: 34.6654, longitude: 135.5068 },
    ajinoya: { latitude: 34.6685, longitude: 135.5015 },
  },
  jeju: {
    '도착': { latitude: 33.5067, longitude: 126.493 },
    '공항': { latitude: 33.5067, longitude: 126.493 },
  },
  danang: {
    '도착': { latitude: 16.0439, longitude: 108.1994 },
    '공항': { latitude: 16.0439, longitude: 108.1994 },
    'madame lan': { latitude: 16.0732, longitude: 108.2234 },
    'nam danh seafood': { latitude: 16.0946, longitude: 108.2497 },
    'bep cuon da nang': { latitude: 16.0684, longitude: 108.2209 },
    'burger bros': { latitude: 16.0495, longitude: 108.2469 },
  },
  bangkok: {
    '도착': { latitude: 13.69, longitude: 100.7501 },
    '공항': { latitude: 13.69, longitude: 100.7501 },
    thipsamai: { latitude: 13.7527, longitude: 100.5048 },
    'jay fai': { latitude: 13.7527, longitude: 100.5046 },
    'after you': { latitude: 13.7309, longitude: 100.5697 },
    'supanniga eating room': { latitude: 13.7232, longitude: 100.5787 },
  },
};

const fallbackOffsets = [
  { latitude: 0.012, longitude: 0.018 },
  { latitude: -0.01, longitude: 0.016 },
  { latitude: 0.018, longitude: -0.012 },
  { latitude: -0.016, longitude: -0.014 },
  { latitude: 0.006, longitude: -0.022 },
  { latitude: -0.004, longitude: 0.024 },
];

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function getDestinationKey(plan) {
  const candidates = [plan.destinationId, plan.destinationEnglishName, plan.destination];
  const joined = normalize(candidates.filter(Boolean).join(' '));

  if (joined.includes('tokyo')) return 'tokyo';
  if (joined.includes('osaka')) return 'osaka';
  if (joined.includes('jeju')) return 'jeju';
  if (joined.includes('da nang') || joined.includes('danang')) return 'danang';
  if (joined.includes('bangkok')) return 'bangkok';

  return plan.destinationId || 'tokyo';
}

function findKnownCoordinate(destinationKey, placeName) {
  const normalizedPlace = normalize(placeName);
  const coordinates = placeCoordinates[destinationKey] || {};
  const matchedKey = Object.keys(coordinates).find((key) => normalizedPlace.includes(normalize(key)));
  return matchedKey ? coordinates[matchedKey] : null;
}

function getMockCoordinate({ destinationKey, placeName, dayIndex, itemIndex }) {
  const knownCoordinate = findKnownCoordinate(destinationKey, placeName);
  if (knownCoordinate) return knownCoordinate;

  const center = destinationCenters[destinationKey] || destinationCenters.tokyo;
  const offset = fallbackOffsets[(dayIndex * 3 + itemIndex) % fallbackOffsets.length];

  return {
    latitude: center.latitude + offset.latitude,
    longitude: center.longitude + offset.longitude,
  };
}

export function getItineraryMapData(plan) {
  const destinationKey = getDestinationKey(plan);
  const center = destinationCenters[destinationKey] || destinationCenters.tokyo;

  const days = (plan.days || []).map((day, dayIndex) => ({
    day: day.day,
    title: day.title,
    points: (day.items || []).map((item, itemIndex) => ({
      id: `${day.day}-${itemIndex}`,
      day: day.day,
      order: itemIndex + 1,
      time: item.time,
      placeName: item.placeName,
      description: item.description,
      coordinate: getMockCoordinate({
        destinationKey,
        placeName: item.placeName,
        dayIndex,
        itemIndex,
      }),
    })),
  }));

  return { center, days };
}
