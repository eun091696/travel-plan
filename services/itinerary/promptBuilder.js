function formatPlaceList(places = []) {
  if (!places.length) return '- 추천 장소 없음';

  return places
    .map((place, index) => {
      const name = place.name || place.placeName || `장소 ${index + 1}`;
      const rating = place.rating ? `, 평점 ${place.rating}` : '';
      const address = place.address ? `, 주소 ${place.address}` : '';
      const description = place.description ? `, 설명 ${place.description}` : '';
      return `- ${name} (${place.category || '장소'}${rating}${address}${description})`;
    })
    .join('\n');
}

function formatWeather(weather) {
  if (!weather) return '날씨 정보 없음';

  return [
    weather.sourceLabel,
    weather.status,
    weather.temperature,
    weather.rainChance ? `강수 가능성 ${weather.rainChance}` : null,
    weather.tip,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function buildItineraryPrompt({
  destination,
  startDate,
  endDate,
  arrivalTime,
  departureTime,
  budget,
  companions,
  style,
  weatherData,
  attractions = [],
  restaurants = [],
}) {
  const destinationName = destination?.name || destination?.destination || '여행지';

  return [
    '너는 여행 일정 생성 전문가다.',
    '아래 입력 정보를 바탕으로 여행 일정을 생성해라.',
    '',
    '[입력 정보]',
    `- 여행지: ${destinationName}`,
    `- 시작 날짜: ${startDate || '미정'}`,
    `- 종료 날짜: ${endDate || startDate || '미정'}`,
    `- 입국/도착 시간: ${arrivalTime || '없음'}`,
    `- 출국/출발 시간: ${departureTime || '없음'}`,
    `- 예산: ${budget || '미정'}`,
    `- 동행인: ${companions || '미정'}`,
    `- 여행 스타일: ${style || '자유 여행'}`,
    `- 날씨 정보: ${formatWeather(weatherData)}`,
    '',
    '[추천 관광지 목록]',
    formatPlaceList(attractions),
    '',
    '[추천 맛집 목록]',
    formatPlaceList(restaurants),
    '',
    '[일정 생성 규칙]',
    '- Day별 일정을 생성한다.',
    '- 입국 시간이 있으면 첫날은 입국 시간 이후부터 일정을 시작한다.',
    '- 출국 시간이 있으면 마지막 날에는 출국 2시간 전 공항 도착 일정을 자동으로 추가한다.',
    '- 날씨가 비 또는 강수 가능성이 높으면 실내 일정과 카페, 쇼핑몰, 박물관 등 실내 장소를 우선한다.',
    '- 예산이 낮으면 무료 또는 저가 장소를 우선한다.',
    '- 여행 스타일에 맞는 장소를 우선한다.',
    '- 일정 사이에는 이동 시간을 고려해 1~2시간 간격으로 배치한다.',
    '- 추천 관광지와 맛집 목록을 우선 활용하되, 동선이 어색하면 보완 장소를 추가할 수 있다.',
    '',
    '[출력 형식]',
    '반드시 JSON 형태로만 반환한다.',
    'JSON 스키마:',
    JSON.stringify(
      {
        destination: destinationName,
        startDate,
        endDate,
        days: [
          {
            day: 1,
            date: startDate,
            title: 'Day 1 title',
            items: [
              {
                time: '10:00',
                placeName: '장소명',
                category: '관광지|맛집|카페|이동|액티비티',
                description: '일정 설명',
                reason: '추천 이유',
                latitude: 0,
                longitude: 0,
              },
            ],
          },
        ],
      },
      null,
      2
    ),
  ].join('\n');
}
