export const monthlyClimateData = {
  tokyo: {
    default: { minTemp: 12, maxTemp: 21, rainChance: '보통', packing: ['가벼운 겉옷', '접이식 우산'], tip: '일교차가 있어 얇은 옷을 여러 겹 준비하면 좋아요.' },
    1: { minTemp: 2, maxTemp: 10, rainChance: '낮음', packing: ['따뜻한 코트', '목도리'], tip: '맑은 날이 많지만 아침저녁은 꽤 쌀쌀합니다.' },
    7: { minTemp: 23, maxTemp: 30, rainChance: '보통', packing: ['통풍 좋은 옷', '양산', '물병'], tip: '습도가 높아 실내 휴식 동선을 섞어두면 편합니다.' },
  },
  osaka: {
    default: { minTemp: 13, maxTemp: 23, rainChance: '보통', packing: ['편한 신발', '얇은 겉옷'], tip: '도보 이동이 많아 신발을 편하게 준비하세요.' },
    8: { minTemp: 25, maxTemp: 33, rainChance: '보통', packing: ['여름 옷', '휴대용 선풍기'], tip: '낮에는 더우니 오전과 저녁 일정 중심이 좋습니다.' },
  },
  jeju: {
    default: { minTemp: 14, maxTemp: 22, rainChance: '보통', packing: ['바람막이', '운동화'], tip: '바람이 강한 날이 많아 해안 코스는 여유 있게 잡으세요.' },
    7: { minTemp: 23, maxTemp: 29, rainChance: '보통', packing: ['수영복', '선크림', '바람막이'], tip: '해변과 오름 일정을 날씨에 따라 바꾸기 쉽게 구성하세요.' },
  },
  danang: {
    default: { minTemp: 24, maxTemp: 31, rainChance: '보통', packing: ['얇은 옷', '샌들', '선크림'], tip: '해변 일정은 오전이나 해질녘이 쾌적합니다.' },
    10: { minTemp: 23, maxTemp: 29, rainChance: '높음', packing: ['우비', '방수 가방'], tip: '우기에는 실내 카페와 마사지 일정을 함께 준비하세요.' },
  },
  bangkok: {
    default: { minTemp: 25, maxTemp: 33, rainChance: '보통', packing: ['통풍 좋은 옷', '모자', '물병'], tip: '한낮 더위를 피해 쇼핑몰과 사원 일정을 분산하세요.' },
    9: { minTemp: 25, maxTemp: 32, rainChance: '높음', packing: ['우산', '방수 샌들'], tip: '스콜 가능성이 있어 이동 시간을 넉넉히 잡는 편이 좋습니다.' },
  },
};

export const mockClimateData = monthlyClimateData;
