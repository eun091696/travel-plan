export const mockPlaceData = {
  tokyo: {
    attractions: [
      { id: 'tokyo-attraction-1', name: '시부야 스카이', category: '관광지', rating: 4.7, address: '2-24-12 Shibuya, Tokyo', description: '도쿄 도심과 야경을 한눈에 볼 수 있는 전망 명소입니다.', latitude: 35.658, longitude: 139.7016, imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989' },
      { id: 'tokyo-attraction-2', name: '센소지', category: '관광지', rating: 4.6, address: 'Asakusa, Taito City, Tokyo', description: '전통 상점가와 사찰 분위기를 함께 즐기는 대표 코스입니다.', latitude: 35.7148, longitude: 139.7967, imageUrl: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3' },
      { id: 'tokyo-attraction-3', name: '신주쿠 교엔', category: '관광지', rating: 4.6, address: '11 Naitomachi, Shinjuku City, Tokyo', description: '도심 속 산책과 피크닉을 즐기기 좋은 큰 정원입니다.', latitude: 35.6852, longitude: 139.7101, imageUrl: 'https://images.unsplash.com/photo-1554797589-7241bb691973' },
      { id: 'tokyo-attraction-4', name: '도쿄타워', category: '관광지', rating: 4.5, address: '4 Chome-2-8 Shibakoen, Tokyo', description: '도쿄의 클래식한 전망과 야경을 즐길 수 있는 랜드마크입니다.', latitude: 35.6586, longitude: 139.7454, imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc' },
      { id: 'tokyo-attraction-5', name: '오다이바 해변공원', category: '관광지', rating: 4.4, address: 'Odaiba, Minato City, Tokyo', description: '바다 산책과 석양, 야경을 함께 보기 좋은 코스입니다.', latitude: 35.6301, longitude: 139.7757, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26' },
    ],
    restaurants: [
      { id: 'tokyo-food-1', name: 'Ginza Kagari', category: '맛집', rating: 4.5, address: 'Ginza, Chuo City, Tokyo', description: '진한 닭 육수 라멘으로 유명한 도쿄 인기 맛집입니다.', latitude: 35.672, longitude: 139.7653, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624' },
      { id: 'tokyo-food-2', name: 'Sushi Dai', category: '맛집', rating: 4.6, address: 'Toyosu Market, Tokyo', description: '신선한 재료의 스시를 경험하기 좋은 시장 맛집입니다.', latitude: 35.6467, longitude: 139.7801, imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' },
      { id: 'tokyo-food-3', name: 'Ichiran Ramen', category: '맛집', rating: 4.3, address: 'Shinjuku, Tokyo', description: '혼밥에도 편한 좌석과 돈코츠 라멘으로 유명한 체인입니다.', latitude: 35.6921, longitude: 139.7005, imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e' },
      { id: 'tokyo-food-4', name: 'Tsukiji Outer Market', category: '맛집', rating: 4.4, address: 'Tsukiji, Chuo City, Tokyo', description: '해산물과 길거리 음식을 다양하게 맛볼 수 있는 시장입니다.', latitude: 35.6655, longitude: 139.7707, imageUrl: 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a' },
      { id: 'tokyo-food-5', name: 'Cafe Kitsune', category: '카페', rating: 4.2, address: 'Aoyama, Tokyo', description: '감각적인 분위기의 디저트와 커피를 즐길 수 있는 카페입니다.', latitude: 35.6656, longitude: 139.7123, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93' },
    ],
  },
  osaka: {
    attractions: [
      { id: 'osaka-attraction-1', name: '도톤보리', category: '관광지', rating: 4.5, address: 'Dotonbori, Chuo Ward, Osaka', description: '네온사인과 먹거리가 가득한 오사카 대표 거리입니다.', latitude: 34.6687, longitude: 135.5013, imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549' },
      { id: 'osaka-attraction-2', name: '오사카성', category: '관광지', rating: 4.4, address: '1-1 Osakajo, Chuo Ward, Osaka', description: '역사와 공원 산책을 함께 즐길 수 있는 랜드마크입니다.', latitude: 34.6873, longitude: 135.5262, imageUrl: 'https://images.unsplash.com/photo-1590253230532-a67f6bc61c9e' },
      { id: 'osaka-attraction-3', name: '우메다 스카이빌딩', category: '관광지', rating: 4.4, address: 'Umeda, Osaka', description: '도심 전망과 야경을 즐기기 좋은 전망대입니다.', latitude: 34.7054, longitude: 135.49, imageUrl: 'https://images.unsplash.com/photo-1592305761797-9c7591f1cb15' },
      { id: 'osaka-attraction-4', name: '유니버설 스튜디오 재팬', category: '관광지', rating: 4.6, address: 'Konohana Ward, Osaka', description: '가족과 친구 여행에 어울리는 대형 테마파크입니다.', latitude: 34.6654, longitude: 135.4323, imageUrl: 'https://images.unsplash.com/photo-1587302044134-2f277d2cb756' },
      { id: 'osaka-attraction-5', name: '신세카이', category: '관광지', rating: 4.2, address: 'Naniwa Ward, Osaka', description: '레트로한 거리 분위기와 먹거리를 함께 즐길 수 있습니다.', latitude: 34.6525, longitude: 135.5063, imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9' },
    ],
    restaurants: [
      { id: 'osaka-food-1', name: 'Mizuno', category: '맛집', rating: 4.4, address: 'Dotonbori, Osaka', description: '오코노미야키로 유명한 오사카 대표 맛집입니다.', latitude: 34.6687, longitude: 135.5024, imageUrl: 'https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db' },
      { id: 'osaka-food-2', name: 'Kushikatsu Daruma', category: '맛집', rating: 4.3, address: 'Shinsekai, Osaka', description: '바삭한 쿠시카츠를 가볍게 즐기기 좋은 로컬 맛집입니다.', latitude: 34.6525, longitude: 135.5063, imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754' },
      { id: 'osaka-food-3', name: 'Ajinoya', category: '맛집', rating: 4.4, address: 'Namba, Osaka', description: '현지 분위기의 오코노미야키와 야키소바를 맛볼 수 있습니다.', latitude: 34.6685, longitude: 135.5015, imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec' },
      { id: 'osaka-food-4', name: 'Kuromon Market', category: '맛집', rating: 4.2, address: 'Nipponbashi, Osaka', description: '해산물과 길거리 간식을 한 번에 둘러보기 좋은 시장입니다.', latitude: 34.6654, longitude: 135.5068, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
      { id: 'osaka-food-5', name: 'Harukoma Sushi', category: '맛집', rating: 4.3, address: 'Tenjinbashi, Osaka', description: '합리적인 가격의 스시를 즐기기 좋은 인기 식당입니다.', latitude: 34.7075, longitude: 135.5111, imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' },
    ],
  },
  jeju: {
    attractions: [
      { id: 'jeju-attraction-1', name: '성산일출봉', category: '관광지', rating: 4.6, address: '성산읍, 서귀포시', description: '일출과 바다 전망으로 유명한 제주 대표 자연 명소입니다.', latitude: 33.4581, longitude: 126.9425, imageUrl: 'https://images.unsplash.com/photo-1599027619757-6d8f203f7c9a' },
      { id: 'jeju-attraction-2', name: '협재해수욕장', category: '관광지', rating: 4.5, address: '한림읍, 제주시', description: '맑은 바다와 모래사장이 아름다운 해변입니다.', latitude: 33.3936, longitude: 126.2393, imageUrl: 'https://images.unsplash.com/photo-1579169825453-8d4b4653cc30' },
      { id: 'jeju-attraction-3', name: '한라산', category: '관광지', rating: 4.7, address: '제주특별자치도', description: '계절마다 다른 풍경을 만나는 대표 트레킹 코스입니다.', latitude: 33.3617, longitude: 126.5292, imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7' },
      { id: 'jeju-attraction-4', name: '카멜리아 힐', category: '관광지', rating: 4.2, address: '안덕면, 서귀포시', description: '꽃과 정원을 천천히 산책하기 좋은 힐링 명소입니다.', latitude: 33.289, longitude: 126.369, imageUrl: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7' },
      { id: 'jeju-attraction-5', name: '비자림', category: '관광지', rating: 4.5, address: '구좌읍, 제주시', description: '숲길을 걸으며 조용히 쉬기 좋은 자연 코스입니다.', latitude: 33.4914, longitude: 126.8113, imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b' },
    ],
    restaurants: [
      { id: 'jeju-food-1', name: '오는정김밥', category: '맛집', rating: 4.2, address: '서귀포시', description: '간단한 이동식 식사로 인기 있는 제주 김밥 맛집입니다.', latitude: 33.2523, longitude: 126.56, imageUrl: 'https://images.unsplash.com/photo-1584278858536-52532423b9ea' },
      { id: 'jeju-food-2', name: '자매국수', category: '맛집', rating: 4.1, address: '제주시', description: '고기국수로 잘 알려진 제주 로컬 식당입니다.', latitude: 33.5008, longitude: 126.5288, imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa' },
      { id: 'jeju-food-3', name: '명진전복', category: '맛집', rating: 4.4, address: '구좌읍, 제주시', description: '전복돌솥밥과 해산물 메뉴가 인기인 식당입니다.', latitude: 33.5326, longitude: 126.8506, imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2' },
      { id: 'jeju-food-4', name: '숙성도', category: '맛집', rating: 4.5, address: '제주시', description: '흑돼지 구이를 즐기기 좋은 인기 고깃집입니다.', latitude: 33.4859, longitude: 126.4901, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
      { id: 'jeju-food-5', name: '동문시장 야시장', category: '맛집', rating: 4.2, address: '제주시', description: '간식과 로컬 먹거리를 다양하게 맛볼 수 있는 시장입니다.', latitude: 33.5122, longitude: 126.526, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
    ],
  },
  danang: {
    attractions: [
      { id: 'danang-attraction-1', name: '미케비치', category: '관광지', rating: 4.6, address: 'My Khe Beach, Da Nang', description: '긴 해변과 리조트 접근성이 좋은 다낭 대표 해변입니다.', latitude: 16.0544, longitude: 108.2476, imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b' },
      { id: 'danang-attraction-2', name: '바나힐', category: '관광지', rating: 4.4, address: 'Hoa Vang, Da Nang', description: '골든브릿지와 케이블카로 유명한 근교 투어 명소입니다.', latitude: 15.9955, longitude: 107.996, imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482' },
      { id: 'danang-attraction-3', name: '용다리', category: '관광지', rating: 4.3, address: 'Dragon Bridge, Da Nang', description: '야간 조명과 강변 산책을 함께 즐기는 랜드마크입니다.', latitude: 16.0615, longitude: 108.2272, imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b' },
      { id: 'danang-attraction-4', name: '호이안 올드타운', category: '관광지', rating: 4.6, address: 'Hoi An, Quang Nam', description: '등불과 옛 거리 분위기가 매력적인 근교 코스입니다.', latitude: 15.8801, longitude: 108.338, imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b' },
      { id: 'danang-attraction-5', name: '오행산', category: '관광지', rating: 4.3, address: 'Ngu Hanh Son, Da Nang', description: '동굴과 전망을 함께 볼 수 있는 반나절 코스입니다.', latitude: 16.0036, longitude: 108.264, imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592' },
    ],
    restaurants: [
      { id: 'danang-food-1', name: 'Madame Lan', category: '맛집', rating: 4.4, address: 'Bach Dang, Da Nang', description: '베트남 가정식과 로컬 메뉴를 깔끔하게 즐기는 식당입니다.', latitude: 16.0732, longitude: 108.2234, imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae' },
      { id: 'danang-food-2', name: 'Nam Danh Seafood', category: '맛집', rating: 4.3, address: 'Da Nang', description: '해산물을 합리적으로 즐길 수 있는 로컬 맛집입니다.', latitude: 16.0946, longitude: 108.2497, imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae' },
      { id: 'danang-food-3', name: 'Bep Cuon Da Nang', category: '맛집', rating: 4.4, address: 'Da Nang', description: '쌈과 베트남식 롤 메뉴가 인기인 식당입니다.', latitude: 16.0684, longitude: 108.2209, imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853' },
      { id: 'danang-food-4', name: 'Burger Bros', category: '맛집', rating: 4.5, address: 'An Thuong, Da Nang', description: '가볍게 들르기 좋은 수제버거 맛집입니다.', latitude: 16.0495, longitude: 108.2469, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
      { id: 'danang-food-5', name: 'Cong Caphe', category: '카페', rating: 4.2, address: 'Da Nang', description: '코코넛 커피와 레트로한 분위기가 인기인 카페입니다.', latitude: 16.0678, longitude: 108.224, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93' },
    ],
  },
  bangkok: {
    attractions: [
      { id: 'bangkok-attraction-1', name: '왕궁', category: '관광지', rating: 4.5, address: 'Phra Nakhon, Bangkok', description: '방콕 역사와 화려한 건축을 볼 수 있는 대표 명소입니다.', latitude: 13.7501, longitude: 100.4913, imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365' },
      { id: 'bangkok-attraction-2', name: '왓 아룬', category: '관광지', rating: 4.6, address: 'Bangkok Yai, Bangkok', description: '강변 석양과 야경이 아름다운 사원입니다.', latitude: 13.7437, longitude: 100.4889, imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed' },
      { id: 'bangkok-attraction-3', name: '짜뚜짝 시장', category: '관광지', rating: 4.4, address: 'Chatuchak, Bangkok', description: '쇼핑과 간식을 함께 즐기는 대형 주말 시장입니다.', latitude: 13.7997, longitude: 100.5502, imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
      { id: 'bangkok-attraction-4', name: '아이콘시암', category: '관광지', rating: 4.6, address: 'Khlong San, Bangkok', description: '쇼핑, 식사, 강변 야경을 한 번에 즐길 수 있습니다.', latitude: 13.7266, longitude: 100.5107, imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
      { id: 'bangkok-attraction-5', name: '룸피니 공원', category: '관광지', rating: 4.4, address: 'Pathum Wan, Bangkok', description: '도심 속 산책과 휴식을 위한 공원 코스입니다.', latitude: 13.7308, longitude: 100.5418, imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee' },
    ],
    restaurants: [
      { id: 'bangkok-food-1', name: 'Thipsamai', category: '맛집', rating: 4.2, address: 'Maha Chai Rd, Bangkok', description: '팟타이로 유명한 방콕 대표 맛집입니다.', latitude: 13.7527, longitude: 100.5048, imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e' },
      { id: 'bangkok-food-2', name: 'Jay Fai', category: '맛집', rating: 4.1, address: 'Maha Chai Rd, Bangkok', description: '크랩 오믈렛으로 유명한 미쉐린 스트리트 푸드입니다.', latitude: 13.7527, longitude: 100.5046, imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae' },
      { id: 'bangkok-food-3', name: 'After You', category: '카페', rating: 4.5, address: 'Bangkok', description: '빙수와 디저트로 유명한 태국 인기 카페입니다.', latitude: 13.7309, longitude: 100.5697, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777' },
      { id: 'bangkok-food-4', name: 'Supanniga Eating Room', category: '맛집', rating: 4.4, address: 'Thong Lo, Bangkok', description: '태국 가정식을 세련된 분위기에서 즐길 수 있습니다.', latitude: 13.7232, longitude: 100.5787, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
      { id: 'bangkok-food-5', name: '쩟페어 야시장', category: '맛집', rating: 4.3, address: 'Rama IX, Bangkok', description: '저녁 시간 다양한 길거리 음식을 즐기기 좋은 야시장입니다.', latitude: 13.758, longitude: 100.566, imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a' },
    ],
  },
};
