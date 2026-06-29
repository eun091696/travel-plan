import { getMockPlacesForItinerary } from './placeService';
import { buildItineraryPrompt } from './itinerary/promptBuilder';

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(value) {
  const date = parseDateValue(value);
  if (!date) return '';
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getTripDates(startDate, endDate) {
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate || startDate);
  if (!start) return [];

  const safeEnd = end && end >= start ? end : start;
  const dayCount = Math.min(Math.floor((safeEnd - start) / DAY_MS) + 1, 14);

  return Array.from({ length: dayCount }, (_, index) => {
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + index);
    return nextDate.toISOString().slice(0, 10);
  });
}

function parseTime(time) {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return null;
  const [hour, minute] = time.split(':').map(Number);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function formatTime(totalMinutes) {
  const boundedMinutes = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59));
  const hour = String(Math.floor(boundedMinutes / 60)).padStart(2, '0');
  const minute = String(boundedMinutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

function addMinutes(time, minutes) {
  const parsed = parseTime(time);
  if (parsed === null) return time;
  return formatTime(parsed + minutes);
}

function subtractTwoHours(time) {
  const parsed = parseTime(time);
  if (parsed === null) return null;
  return formatTime(parsed - 120);
}

function getWeatherLabel(destination, weatherData) {
  if (weatherData?.status || weatherData?.temperature) {
    return [weatherData.status, weatherData.temperature].filter(Boolean).join(' ');
  }

  if (typeof destination.weather === 'string') {
    return [destination.weather, destination.temperature].filter(Boolean).join(' ');
  }

  if (destination.weather) {
    return [destination.weather.status, destination.weather.temperature].filter(Boolean).join(' ');
  }

  return '';
}

function getStyleKey(style = '') {
  const normalized = style.toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('맛집') || normalized.includes('미식') || normalized.includes('food')) return 'food';
  if (normalized.includes('힐링') || normalized.includes('휴양') || normalized.includes('산책') || normalized.includes('healing')) return 'healing';
  if (normalized.includes('액티비티') || normalized.includes('체험') || normalized.includes('투어') || normalized.includes('activity')) return 'activity';
  if (normalized.includes('커플') || normalized.includes('연인') || normalized.includes('couple')) return 'couple';
  return 'default';
}

function getPlacesForStyle(destination, style, placeData) {
  const attractions = placeData?.attractions || [];
  const restaurants = placeData?.restaurants || [];
  const normalizedStyle = getStyleKey(style);

  if (normalizedStyle === 'food' && restaurants.length > 0) return [...restaurants, ...attractions];
  if (attractions.length > 0 || restaurants.length > 0) return [...attractions, ...restaurants];

  const servicePlaces = getMockPlacesForItinerary(destination, style);
  if (servicePlaces.length > 0) return servicePlaces;

  const recommendations = destination.styleRecommendations || {};
  if (recommendations[normalizedStyle]) return recommendations[normalizedStyle];
  if (normalizedStyle === 'food' && destination.restaurants) return destination.restaurants;
  return recommendations.default || destination.attractions || destination.spots || [];
}

function getIconForStyle(style, index) {
  const styleKey = getStyleKey(style);
  const icons = {
    food: ['coffee', 'shopping-bag', 'moon', 'map-pin'],
    healing: ['sun', 'wind', 'map', 'coffee'],
    activity: ['activity', 'navigation', 'camera', 'map-pin'],
    couple: ['heart', 'coffee', 'star', 'moon'],
    default: ['camera', 'coffee', 'map-pin', 'star'],
  };
  const pickedIcons = icons[styleKey] || icons.default;
  return pickedIcons[index % pickedIcons.length];
}

function getDescription(style, companions, budget, index, weatherLabel) {
  const styleKey = getStyleKey(style);
  const weatherPrefix = weatherLabel ? `${weatherLabel} 날씨에 맞춘 ` : '';
  const descriptions = {
    food: [
      `${weatherPrefix}${budget} 예산에 맞춘 지역 맛집 코스`,
      `${companions}와 함께 가기 좋은 카페와 로컬 음식 일정`,
      '대표 분위기를 느끼며 즐기는 로컬 미식 일정',
    ],
    healing: [
      `${weatherPrefix}천천히 걷고 쉬어가는 힐링 코스`,
      `${companions}와 여유롭게 머무는 산책 일정`,
      '컨디션과 이동 동선을 고려한 자연 중심 코스',
    ],
    activity: [
      `${weatherPrefix}직접 체험하고 움직이는 액티비티 코스`,
      '이동 시간을 고려한 반나절 투어 일정',
      `${companions}와 함께 즐기기 좋은 야외 활동`,
    ],
    couple: [
      `${weatherPrefix}사진 남기기 좋은 커플 여행 코스`,
      '감성 카페와 전망을 함께 즐기는 일정',
      '하루를 마무리하기 좋은 야경 중심 코스',
    ],
    default: [
      `${companions}와 함께 둘러보기 좋은 대표 코스`,
      `${budget} 예산을 고려한 균형 잡힌 여행 일정`,
      `${weatherPrefix}이동 부담을 줄인 핵심 여행 코스`,
    ],
  };

  const pickedDescriptions = descriptions[styleKey] || descriptions.default;
  return pickedDescriptions[index % pickedDescriptions.length];
}

function buildDayItems({ destination, dateIndex, isFirstDay, isLastDay, input, style, budget, companions, airportArrivalTime, placeData, weatherLabel }) {
  const places = getPlacesForStyle(destination, style, placeData);
  const arrivalMinutes = parseTime(input.arrivalTime);
  const airportMinutes = parseTime(airportArrivalTime);
  const startTime = isFirstDay && arrivalMinutes !== null ? formatTime(arrivalMinutes + 90) : '10:00';
  const cutoffMinutes = isLastDay && airportMinutes !== null ? airportMinutes : 21 * 60;
  const baseTimes = [startTime, addMinutes(startTime, 150), addMinutes(startTime, 330), addMinutes(startTime, 510)];
  const items = [];

  if (isFirstDay && arrivalMinutes !== null) {
    items.push({
      time: input.arrivalTime,
      placeName: `${destination.name} 도착`,
      description: '입국 수속과 숙소 이동 시간을 고려한 시작 일정',
      icon: 'navigation',
    });
  }

  baseTimes.forEach((time, index) => {
    const minutes = parseTime(time);
    if (minutes === null || minutes >= cutoffMinutes) return;

    const place = places[(dateIndex * 3 + index) % places.length];
    const placeName = typeof place === 'string' ? place : place?.name || `${destination.name} 추천 장소`;
    items.push({
      time,
      placeName,
      description: (typeof place === 'object' && place?.description) || getDescription(style, companions, budget, index, weatherLabel),
      icon: getIconForStyle(style, index),
      category: typeof place === 'object' ? place.category : undefined,
      latitude: typeof place === 'object' ? place.latitude : undefined,
      longitude: typeof place === 'object' ? place.longitude : undefined,
    });
  });

  if (isLastDay && airportArrivalTime) {
    items.push({
      time: airportArrivalTime,
      placeName: '공항 도착',
      description: `출국 시간 ${input.departureTime} 기준 2시간 전 공항 도착`,
      icon: 'briefcase',
    });
  }

  return items.sort((a, b) => (parseTime(a.time) || 0) - (parseTime(b.time) || 0));
}

export const mockItineraryProvider = {
  async generate(input) {
    const destination = input.destination;
    const prompt = buildItineraryPrompt({
      destination,
      startDate: input.startDate,
      endDate: input.endDate,
      arrivalTime: input.arrivalTime,
      departureTime: input.departureTime,
      budget: input.budget,
      companions: input.companions,
      style: input.style,
      weatherData: input.weatherData,
      attractions: input.placeData?.attractions || [],
      restaurants: input.placeData?.restaurants || [],
    });
    console.log('[mockItineraryProvider] itinerary prompt', prompt);

    const dates = getTripDates(input.startDate, input.endDate);
    const tripDates = dates.length > 0 ? dates : [new Date().toISOString().slice(0, 10)];
    const budget = input.budget || '예산 미정';
    const companions = input.companions || '동행인 미정';
    const style = input.style || '자유 여행';
    const duration = `${formatDateLabel(tripDates[0])} - ${formatDateLabel(tripDates[tripDates.length - 1])} · ${tripDates.length}일`;
    const airportArrivalTime = subtractTwoHours(input.departureTime);
    const weatherLabel = getWeatherLabel(destination, input.weatherData);

    const days = tripDates.map((date, index) => ({
      day: index + 1,
      date,
      title: `${formatDateLabel(date)} ${destination.name} Day ${index + 1}`,
      items: buildDayItems({
        destination,
        dateIndex: index,
        isFirstDay: index === 0,
        isLastDay: index === tripDates.length - 1,
        input,
        style,
        budget,
        companions,
        airportArrivalTime,
        placeData: input.placeData,
        weatherLabel,
      }),
    }));

    return {
      id: `plan-${Date.now()}`,
      destinationId: destination.id,
      destination: destination.name,
      destinationEnglishName: destination.englishName,
      destinationImage: destination.image,
      country: destination.country,
      weather: destination.weather,
      weatherLabel,
      duration,
      startDate: input.startDate,
      endDate: input.endDate,
      arrivalTime: input.arrivalTime,
      departureTime: input.departureTime,
      budget,
      companions,
      style,
      summary: `${duration} 동안 ${destination.name}을 ${style} 스타일로 즐기는 mock 일정${weatherLabel ? ` · ${weatherLabel}` : ''}`,
      days,
      savedAt: null,
    };
  },
};
