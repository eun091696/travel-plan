import { mockClimateData, monthlyClimateData } from '../data/monthlyClimateData';

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function getDestinationClimateKey(destination) {
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
  return 'tokyo';
}

export function getMonthlyClimate({ destination, date }) {
  const climateKey = getDestinationClimateKey(destination);
  const travelDate = date ? new Date(date) : new Date();
  const month = travelDate.getMonth() + 1;
  const climate = monthlyClimateData[climateKey]?.[month] || monthlyClimateData[climateKey]?.default || mockClimateData.tokyo.default;

  return {
    type: 'climate',
    sourceLabel: '월별 평균 날씨 기준입니다',
    title: `${month}월 평균 날씨`,
    status: `${climate.minTemp}°C - ${climate.maxTemp}°C`,
    temperature: `${climate.maxTemp}°C`,
    minTemp: climate.minTemp,
    maxTemp: climate.maxTemp,
    rainChance: climate.rainChance,
    packing: climate.packing,
    tip: climate.tip,
    notice: '여행일이 가까워지면 실제 날씨 예보로 자동 대체됩니다.',
  };
}
