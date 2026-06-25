import { getMonthlyClimate, getDestinationClimateKey } from './climateService';

const OPEN_WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPEN_WEATHER_GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const DAY_MS = 24 * 60 * 60 * 1000;

const destinationCoordinates = {
  tokyo: { latitude: 35.6762, longitude: 139.6503 },
  osaka: { latitude: 34.6937, longitude: 135.5023 },
  jeju: { latitude: 33.4996, longitude: 126.5312 },
  danang: { latitude: 16.0544, longitude: 108.2022 },
  bangkok: { latitude: 13.7563, longitude: 100.5018 },
};

function getApiKey() {
  return process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY?.trim();
}

function isMissingApiKey(apiKey) {
  return !apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY_HERE' || apiKey === 'your_openweather_api_key';
}

function getFriendlyWeatherError(error) {
  if (!error) return null;
  if (String(error).includes('OPENWEATHER_API_KEY')) return 'OpenWeather API 키를 설정해주세요';
  if (String(error).includes('API 키')) return 'OpenWeather API 키를 설정해주세요';
  return error;
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getDaysUntil(date) {
  return Math.floor((startOfDay(date) - startOfDay(new Date())) / DAY_MS);
}

function getTravelDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getFallbackWeather(destination, error = null) {
  const weather = destination?.weather;
  const status = typeof weather === 'string' ? weather : weather?.status;
  const temperature = destination?.temperature || weather?.temperature;
  const friendlyError = getFriendlyWeatherError(error);

  return {
    type: 'fallback',
    sourceLabel: 'mock 날씨 데이터',
    title: '기본 날씨 정보',
    status: status || '날씨 정보 준비 중',
    temperature: temperature || '',
    humidity: weather?.humidity,
    notice: friendlyError || '실제 날씨 API 호출에 실패해 기존 mock 날씨를 표시합니다.',
    error: friendlyError,
  };
}

function getDestinationQuery(destination) {
  return destination?.englishName || destination?.destinationEnglishName || destination?.name || destination?.destination;
}

function getKnownCoordinates(destination) {
  if (destination?.coordinates) return destination.coordinates;
  if (destination?.latitude && destination?.longitude) {
    return { latitude: destination.latitude, longitude: destination.longitude };
  }

  const key = getDestinationClimateKey(destination);
  return destinationCoordinates[key];
}

async function resolveCoordinates({ destination, coordinates, apiKey }) {
  if (coordinates?.latitude && coordinates?.longitude) return coordinates;

  const knownCoordinates = getKnownCoordinates(destination);
  if (knownCoordinates) return knownCoordinates;

  const query = getDestinationQuery(destination);
  if (!query) throw new Error('날씨 조회를 위한 지역명이 없습니다.');

  const response = await fetch(`${OPEN_WEATHER_GEO_URL}?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`);
  if (!response.ok) throw new Error('OpenWeatherMap 지오코딩 조회에 실패했습니다.');

  const data = await response.json();
  if (!data?.[0]) throw new Error('지역 좌표를 찾을 수 없습니다.');

  return {
    latitude: data[0].lat,
    longitude: data[0].lon,
  };
}

function pickForecastItem(list, travelDate) {
  const target = startOfDay(travelDate).getTime();
  const sameDayItems = (list || []).filter((item) => startOfDay(new Date(item.dt * 1000)).getTime() === target);
  if (sameDayItems.length === 0) return list?.[0] || null;

  return sameDayItems.reduce((closest, item) => {
    const hour = new Date(item.dt * 1000).getHours();
    const currentDistance = Math.abs(hour - 12);
    const closestDistance = Math.abs(new Date(closest.dt * 1000).getHours() - 12);
    return currentDistance < closestDistance ? item : closest;
  }, sameDayItems[0]);
}

function mapForecastResponse(data, travelDate) {
  const item = pickForecastItem(data.list, travelDate);
  if (!item) throw new Error('예보 데이터가 비어 있습니다.');

  const weather = item.weather?.[0];
  const minTemp = Math.round(item.main?.temp_min);
  const maxTemp = Math.round(item.main?.temp_max);
  const rainChance = Math.round((item.pop || 0) * 100);

  return {
    type: 'forecast',
    sourceLabel: '실제 날씨 예보',
    title: '실제 날씨 예보',
    status: weather?.description || weather?.main || '예보 정보',
    temperature: `${Math.round(item.main?.temp)}°C`,
    minTemp,
    maxTemp,
    rainChance: `${rainChance}%`,
    humidity: item.main?.humidity ? `${item.main.humidity}%` : null,
    packing: rainChance >= 40 ? ['접이식 우산', '방수 신발'] : ['편한 신발', '가벼운 겉옷'],
    tip: rainChance >= 40 ? '비 예보가 있어 실내 일정 대안을 준비하세요.' : '야외 일정을 넣기 좋은 예보입니다.',
    forecastAt: item.dt_txt,
  };
}

async function fetchOpenWeatherForecast({ destination, coordinates, date }) {
  const apiKey = getApiKey();
  if (isMissingApiKey(apiKey)) throw new Error('OpenWeather API 키를 설정해주세요.');

  const resolvedCoordinates = await resolveCoordinates({ destination, coordinates, apiKey });
  const url = `${OPEN_WEATHER_BASE_URL}/forecast?lat=${resolvedCoordinates.latitude}&lon=${resolvedCoordinates.longitude}&units=metric&lang=kr&appid=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('OpenWeatherMap 예보 조회에 실패했습니다.');
  }

  const data = await response.json();
  return mapForecastResponse(data, date);
}

export async function getWeatherForTrip({ destination, date, coordinates }) {
  const travelDate = getTravelDate(date);
  const daysUntil = getDaysUntil(travelDate);

  if (daysUntil >= 0 && daysUntil <= 7) {
    try {
      return await fetchOpenWeatherForecast({ destination, coordinates, date: travelDate });
    } catch (error) {
      return getFallbackWeather(destination, error.message);
    }
  }

  return getMonthlyClimate({ destination, date: travelDate });
}
