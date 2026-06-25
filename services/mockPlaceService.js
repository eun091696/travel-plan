const fallbackPlaces = {
  restaurant: [
    {
      name: 'Local Table',
      category: '맛집',
      description: '지역 식재료와 대표 메뉴를 가볍게 즐길 수 있는 맛집입니다.',
      duration: '1시간 20분',
      reason: '식사 동선과 다음 일정 이동 시간을 함께 고려한 대체 맛집입니다.',
      icon: 'coffee',
    },
    {
      name: 'Market Kitchen',
      category: '맛집',
      description: '현지 시장 분위기와 인기 메뉴를 함께 경험할 수 있는 장소입니다.',
      duration: '1시간',
      reason: '짧은 체류 시간에도 지역 미식 분위기를 느끼기 좋습니다.',
      icon: 'shopping-bag',
    },
  ],
  cafe: [
    {
      name: 'Slow Moment Cafe',
      category: '카페',
      description: '여행 중 잠깐 쉬어가기 좋은 조용한 감성 카페입니다.',
      duration: '50분',
      reason: '이동 중 휴식과 사진 촬영을 함께 하기 좋아 추천합니다.',
      icon: 'coffee',
    },
    {
      name: 'View Point Coffee',
      category: '카페',
      description: '전망이 좋은 좌석과 디저트가 있는 카페입니다.',
      duration: '1시간',
      reason: '커플 여행이나 힐링 일정에 잘 어울리는 대체 장소입니다.',
      icon: 'coffee',
    },
  ],
  attraction: [
    {
      name: 'City View Spot',
      category: '관광지',
      description: '도시의 분위기를 한눈에 볼 수 있는 대표 전망 명소입니다.',
      duration: '1시간 30분',
      reason: '첫 방문자에게 만족도가 높은 핵심 관광지입니다.',
      icon: 'camera',
    },
    {
      name: 'Old Town Walk',
      category: '관광지',
      description: '거리 산책과 사진 촬영을 함께 즐길 수 있는 코스입니다.',
      duration: '1시간 10분',
      reason: '이동 부담이 적고 주변 일정과 연결하기 쉽습니다.',
      icon: 'map-pin',
    },
  ],
  activity: [
    {
      name: 'Local Experience Tour',
      category: '액티비티',
      description: '지역 문화를 직접 체험하는 짧은 투어 프로그램입니다.',
      duration: '2시간',
      reason: '일정에 활력을 더하고 기억에 남는 경험을 만들기 좋습니다.',
      icon: 'activity',
    },
    {
      name: 'Outdoor Route',
      category: '액티비티',
      description: '날씨가 좋을 때 즐기기 좋은 야외 이동형 코스입니다.',
      duration: '1시간 40분',
      reason: '동행인과 함께 움직이며 여행감을 느끼기 좋습니다.',
      icon: 'navigation',
    },
  ],
  transit: [
    {
      name: 'Airport Transfer',
      category: '이동',
      description: '공항과 숙소 사이 이동을 여유 있게 잡은 일정입니다.',
      duration: '1시간',
      reason: '출입국 시간을 안정적으로 맞추기 위한 이동 일정입니다.',
      icon: 'briefcase',
    },
  ],
};

const destinationPlaces = {
  tokyo: {
    restaurant: ['Ginza Kagari', 'Sushi Dai', 'Ichiran Ramen', 'Tsukiji Outer Market'],
    cafe: ['Cafe Kitsune', 'Aoyama Flower Market Tea House', 'Blue Bottle Aoyama'],
    attraction: ['Tokyo Tower', 'Asakusa', 'Shinjuku Gyoen', 'Odaiba Marine Park'],
    activity: ['Akihabara Tour', 'Sumida River Cruise', 'TeamLab Planets'],
  },
  osaka: {
    restaurant: ['Mizuno', 'Kushikatsu Daruma', 'Ajinoya', 'Kuromon Market'],
    cafe: ['Brooklyn Roasting Company', 'LiLo Coffee Roasters', 'Nakanoshima Cafe'],
    attraction: ['Dotonbori', 'Osaka Castle', 'Umeda Sky Building'],
    activity: ['Universal Studios Japan', 'Osaka Aqua Bus', 'Kaiyukan Aquarium'],
  },
  jeju: {
    restaurant: ['Jeju Black Pork Street', 'Myeongjin Jeonbok', 'Dongmun Market'],
    cafe: ['Cafe Aewol Monsant', 'One and Only', 'Bomnal Cafe'],
    attraction: ['Seongsan Ilchulbong', 'Hyeopjae Beach', 'Camellia Hill'],
    activity: ['Hallasan Trail', 'Udo Bike Tour', 'Olle Trail'],
  },
  danang: {
    restaurant: ['Madame Lan', 'Nam Danh Seafood', 'Bep Cuon Da Nang'],
    cafe: ['Cong Caphe', 'Wonderlust Cafe', '43 Factory Coffee Roaster'],
    attraction: ['My Khe Beach', 'Ba Na Hills', 'Dragon Bridge'],
    activity: ['Hoi An Night Tour', 'Han River Cruise', 'Basket Boat Tour'],
  },
  bangkok: {
    restaurant: ['Thipsamai', 'Jay Fai', 'Supanniga Eating Room'],
    cafe: ['After You', 'Factory Coffee', 'The Mustang Blu'],
    attraction: ['Grand Palace', 'Wat Arun', 'ICONSIAM'],
    activity: ['Floating Market Tour', 'Chao Phraya Cruise', 'Muay Thai Class'],
  },
};

function normalize(value) {
  return String(value || '').toLowerCase();
}

function getDestinationKey(plan) {
  const value = normalize([plan.destinationId, plan.destinationEnglishName, plan.destination].filter(Boolean).join(' '));
  if (value.includes('tokyo')) return 'tokyo';
  if (value.includes('osaka')) return 'osaka';
  if (value.includes('jeju')) return 'jeju';
  if (value.includes('danang') || value.includes('da nang')) return 'danang';
  if (value.includes('bangkok')) return 'bangkok';
  return plan.destinationId || 'tokyo';
}

export function getPlaceCategory(item) {
  const value = normalize(`${item.placeName} ${item.description} ${item.icon}`);
  if (value.includes('airport') || value.includes('공항') || value.includes('도착') || value.includes('briefcase') || value.includes('navigation')) return 'transit';
  if (value.includes('cafe') || value.includes('coffee') || value.includes('카페')) return 'cafe';
  if (value.includes('food') || value.includes('restaurant') || value.includes('ramen') || value.includes('sushi') || value.includes('market') || value.includes('맛집') || value.includes('미식')) return 'restaurant';
  if (value.includes('tour') || value.includes('activity') || value.includes('cruise') || value.includes('trail') || value.includes('액티비티') || value.includes('체험')) return 'activity';
  return 'attraction';
}

function getCategoryLabel(category) {
  const labels = {
    restaurant: '맛집',
    cafe: '카페',
    attraction: '관광지',
    activity: '액티비티',
    transit: '이동',
  };
  return labels[category] || '관광지';
}

function buildPlace(name, category, index = 0) {
  const template = fallbackPlaces[category]?.[index % fallbackPlaces[category].length] || fallbackPlaces.attraction[0];
  return {
    ...template,
    name,
    category: getCategoryLabel(category),
  };
}

export function getPlaceDetail(plan, item) {
  const category = getPlaceCategory(item);
  return {
    ...buildPlace(item.placeName, category),
    description: item.description || buildPlace(item.placeName, category).description,
    reason: `${plan.destination || '여행지'} 일정의 ${getCategoryLabel(category)} 흐름에 맞는 장소입니다.`,
  };
}

export function getAlternativePlaces(plan, item) {
  const category = getPlaceCategory(item);
  if (category === 'transit') return [];

  const destinationKey = getDestinationKey(plan);
  const names = destinationPlaces[destinationKey]?.[category] || fallbackPlaces[category].map((place) => place.name);
  const currentName = normalize(item.placeName);

  return names
    .filter((name) => normalize(name) !== currentName)
    .slice(0, 4)
    .map((name, index) => buildPlace(name, category, index));
}
