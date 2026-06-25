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

function getWeatherLabel(region) {
  if (typeof region.weather === 'string') {
    return [region.weather, region.temperature].filter(Boolean).join(' ');
  }

  if (region.weather) {
    return [region.weather.status, region.weather.temperature].filter(Boolean).join(' ');
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

function getPlacesForStyle(region, style) {
  const styleKey = getStyleKey(style);
  const recommendations = region.styleRecommendations || {};

  if (recommendations[styleKey]) return recommendations[styleKey];
  if (styleKey === 'food' && region.restaurants) return region.restaurants;
  return recommendations.default || region.attractions || region.spots || [];
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

function buildDayItems({ region, dateIndex, isFirstDay, isLastDay, form, style, budget, companions, airportArrivalTime }) {
  const places = getPlacesForStyle(region, style);
  const weatherLabel = getWeatherLabel(region);
  const arrivalMinutes = parseTime(form.arrivalTime);
  const airportMinutes = parseTime(airportArrivalTime);
  const startTime = isFirstDay && arrivalMinutes !== null ? formatTime(arrivalMinutes + 90) : '10:00';
  const cutoffMinutes = isLastDay && airportMinutes !== null ? airportMinutes : 21 * 60;
  const baseTimes = [startTime, addMinutes(startTime, 150), addMinutes(startTime, 330), addMinutes(startTime, 510)];
  const items = [];

  if (isFirstDay && arrivalMinutes !== null) {
    items.push({
      time: form.arrivalTime,
      placeName: `${region.name} 도착`,
      description: '입국 수속과 숙소 이동 시간을 고려한 시작 일정',
      icon: 'navigation',
    });
  }

  baseTimes.forEach((time, index) => {
    const minutes = parseTime(time);
    if (minutes === null || minutes >= cutoffMinutes) return;

    const placeName = places[(dateIndex * 3 + index) % places.length] || `${region.name} 추천 장소`;
    items.push({
      time,
      placeName,
      description: getDescription(style, companions, budget, index, weatherLabel),
      icon: getIconForStyle(style, index),
    });
  });

  if (isLastDay && airportArrivalTime) {
    items.push({
      time: airportArrivalTime,
      placeName: '공항 도착',
      description: `출국 시간 ${form.departureTime} 기준 2시간 전 공항 도착`,
      icon: 'briefcase',
    });
  }

  return items.sort((a, b) => (parseTime(a.time) || 0) - (parseTime(b.time) || 0));
}

export function generateItinerary(region, form) {
  const dates = getTripDates(form.startDate, form.endDate);
  const tripDates = dates.length > 0 ? dates : [new Date().toISOString().slice(0, 10)];
  const budget = form.budget || '예산 미정';
  const companions = form.companions || '동행인 미정';
  const style = form.style || '자유 여행';
  const duration = `${formatDateLabel(tripDates[0])} - ${formatDateLabel(tripDates[tripDates.length - 1])} · ${tripDates.length}일`;
  const airportArrivalTime = subtractTwoHours(form.departureTime);
  const weatherLabel = getWeatherLabel(region);

  const days = tripDates.map((date, index) => ({
    day: index + 1,
    date,
    title: `${formatDateLabel(date)} ${region.name} Day ${index + 1}`,
    items: buildDayItems({
      region,
      dateIndex: index,
      isFirstDay: index === 0,
      isLastDay: index === tripDates.length - 1,
      form,
      style,
      budget,
      companions,
      airportArrivalTime,
    }),
  }));

  return {
    id: `plan-${Date.now()}`,
    destinationId: region.id,
    destination: region.name,
    destinationEnglishName: region.englishName,
    destinationImage: region.image,
    country: region.country,
    weather: region.weather,
    weatherLabel,
    duration,
    startDate: form.startDate,
    endDate: form.endDate,
    arrivalTime: form.arrivalTime,
    departureTime: form.departureTime,
    budget,
    companions,
    style,
    summary: `${duration} 동안 ${region.name}을 ${style} 스타일로 즐기는 mock 일정${weatherLabel ? ` · ${weatherLabel}` : ''}`,
    days,
    savedAt: null,
  };
}
