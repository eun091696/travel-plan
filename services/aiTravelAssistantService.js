function summarizeDays(plan) {
  return (plan.days || [])
    .map((day) => {
      const places = (day.items || []).map((item) => item.placeName).filter(Boolean).slice(0, 4);
      return `Day ${day.day}: ${places.join(', ')}`;
    })
    .join(' / ');
}

export function buildTravelAssistantContext(plan) {
  return {
    destination: plan.destination,
    country: plan.country,
    style: plan.style || '자유 여행',
    duration: plan.duration,
    weather: plan.weatherLabel || '',
    itinerarySummary: summarizeDays(plan),
    days: plan.days || [],
  };
}

function includesAny(value, keywords) {
  const normalized = String(value || '').toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

export async function getMockAssistantResponse({ question, context }) {
  const destination = context.destination || '여행지';
  const style = context.style || '자유 여행';
  const firstDay = context.days?.[0];
  const firstPlace = firstDay?.items?.find((item) => item.placeName)?.placeName;

  if (includesAny(question, ['맛집', 'restaurant', 'food', '근처'])) {
    return `${destination} 일정 기준으로는 현재 동선 근처에서 식사 시간을 크게 늘리지 않는 맛집을 추천할게요. ${firstPlace ? `${firstPlace} 이후에는` : '첫 일정 이후에는'} 로컬 맛집이나 카페를 1시간 정도 넣으면 좋아요. ${style} 스타일을 유지하려면 이동 시간이 짧은 곳을 우선으로 고르는 게 좋습니다.`;
  }

  if (includesAny(question, ['비', '우천', 'rain'])) {
    return `비 오는 날에는 ${destination}의 야외 일정은 실내 명소, 카페, 쇼핑 동선으로 바꾸는 게 좋아요. 현재 일정에서 이동이 많은 구간은 줄이고, Day별로 2~3개의 실내 장소만 남기면 훨씬 편합니다.`;
  }

  if (includesAny(question, ['야경', 'night', 'view'])) {
    return `${destination}에서는 저녁 시간대에 전망대나 강변 산책 코스를 넣으면 좋아요. 일정 마지막 활동 뒤에 19:00 전후로 야경 명소를 배치하면 식사 후 이동도 자연스럽습니다.`;
  }

  if (includesAny(question, ['커플', '데이트', 'couple'])) {
    return `${destination} 커플 코스라면 감성 카페, 전망 좋은 산책지, 저녁 야경 순서가 잘 맞아요. 현재 ${style} 스타일을 살리면서 무리하지 않게 Day 1 저녁에 데이트 코스를 넣는 구성을 추천합니다.`;
  }

  return `${destination} ${context.duration || ''} 일정과 ${style} 스타일을 기준으로 답변할게요. 현재 일정은 ${context.itinerarySummary || '아직 요약할 장소가 많지 않습니다'}. 원하는 분위기나 시간대를 더 알려주면 mock 기준으로 더 구체적인 대안을 제안할 수 있어요.`;
}

// Later replacement point:
// export async function getAssistantResponse({ question, context }) {
//   return openAIClient.responses.create({ ...context, input: question });
// }
