import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import DestinationCard from '../components/DestinationCard';
import ScreenHeader from '../components/ScreenHeader';
import { destinations } from '../data/mockData';

const filterOptions = [
  { key: 'popular', label: '인기 여행지', icon: 'trending-up' },
  { key: 'couple', label: '커플 여행', icon: 'heart' },
  { key: 'food', label: '맛집 여행', icon: 'coffee' },
  { key: 'healing', label: '힐링 여행', icon: 'sun' },
  { key: 'activity', label: '액티비티', icon: 'activity' },
  { key: 'family', label: '가족 여행', icon: 'users' },
];

const koreanAliasesById = {
  tokyo: ['도쿄'],
  osaka: ['오사카'],
  jeju: ['제주', '제주도'],
  danang: ['다낭'],
  bangkok: ['방콕'],
};

function normalizeSearchText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '');
}

function matchesDestination(destination, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const searchableValues = [
    destination.name,
    destination.englishName,
    destination.country,
    ...(destination.aliases || []),
    ...(koreanAliasesById[destination.id] || []),
  ];

  return searchableValues.some((value) => normalizeSearchText(value).includes(normalizedQuery));
}

function matchesFilter(destination, filterKey) {
  if (!filterKey || filterKey === 'popular') return true;

  const styleRecommendations = destination.styleRecommendations || {};

  if (['couple', 'food', 'healing', 'activity'].includes(filterKey)) {
    return Boolean(styleRecommendations[filterKey]);
  }

  if (filterKey === 'family') {
    return ['osaka', 'jeju', 'danang'].includes(destination.id);
  }

  return true;
}

export default function HomeScreen({ onSelectDestination }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const trimmedQuery = searchQuery.trim();

  const filteredDestinations = useMemo(() => {
    return destinations.filter((destination) => {
      return matchesDestination(destination, trimmedQuery) && matchesFilter(destination, selectedFilter);
    });
  }, [trimmedQuery, selectedFilter]);

  const isFiltering = trimmedQuery.length > 0 || Boolean(selectedFilter);
  const selectedFilterLabel = filterOptions.find((filter) => filter.key === selectedFilter)?.label;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Travel Plan" subtitle="가고 싶은 도시를 찾고 나만의 일정을 만들어보세요." icon="navigation" />

      <View style={styles.searchBox}>
        <Feather name="search" size={20} color="#176b55" />
        <TextInput
          testID="region-search-input"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="도쿄, Tokyo, Da Nang 검색"
          placeholderTextColor="#91a59d"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {trimmedQuery ? (
          <Pressable
            testID="clear-search-button"
            accessibilityRole="button"
            accessibilityLabel="검색어 초기화"
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Feather name="x-circle" size={19} color="#91a59d" />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
        {filterOptions.map((filter) => {
          const isActive = selectedFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              testID={`filter-${filter.key}`}
              accessibilityRole="button"
              accessibilityLabel={`${filter.label} 필터`}
              style={[styles.filterButton, isActive && styles.activeFilterButton]}
              onPress={() => setSelectedFilter(isActive ? null : filter.key)}
            >
              <Feather name={filter.icon} size={14} color={isActive ? '#ffffff' : '#176b55'} />
              <Text style={[styles.filterText, isActive && styles.activeFilterText]}>{filter.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isFiltering ? (
        <View style={styles.searchResults}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>검색 결과</Text>
            {selectedFilterLabel ? <Text style={styles.resultFilterLabel}>{selectedFilterLabel}</Text> : null}
          </View>

          {filteredDestinations.length === 0 ? (
            <View testID="empty-search-result" style={styles.emptyResult}>
              <Feather name="search" size={22} color="#91a59d" />
              <Text style={styles.emptyResultText}>검색 결과가 없습니다</Text>
            </View>
          ) : (
            filteredDestinations.map((destination) => (
              <Pressable
                key={destination.id}
                testID={`search-result-${destination.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${destination.name} 상세 보기`}
                style={styles.resultCard}
                onPress={() => onSelectDestination(destination.id)}
              >
                <Image source={{ uri: destination.image }} style={styles.resultImage} />
                <View style={styles.resultCopy}>
                  <Text style={styles.resultName}>{destination.name}</Text>
                  <Text style={styles.resultMeta}>{destination.englishName} · {destination.country}</Text>
                  <Text style={styles.resultTagline} numberOfLines={1}>{destination.tagline}</Text>
                  <View style={styles.resultTags}>
                    {(destination.styleTags || []).slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.resultTag}>
                        <Text style={styles.resultTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#8fa199" />
              </Pressable>
            ))
          )}
        </View>
      ) : null}

      <View style={styles.mapArea}>
        <View style={styles.mapHeader}>
          <View>
            <Text style={styles.mapTitle}>World Map</Text>
            <Text style={styles.mapMeta}>인기 지역을 한눈에 보기</Text>
          </View>
          <View style={styles.mapIcon}>
            <MaterialCommunityIcons name="earth" size={24} color="#176b55" />
          </View>
        </View>
        <View style={styles.mapCanvas}>
          <View style={[styles.land, styles.landOne]} />
          <View style={[styles.land, styles.landTwo]} />
          <View style={[styles.land, styles.landThree]} />
          <View style={[styles.marker, styles.markerTokyo]} />
          <View style={[styles.marker, styles.markerOsaka]} />
          <View style={[styles.marker, styles.markerJeju]} />
          <View style={[styles.marker, styles.markerDanang]} />
          <View style={[styles.marker, styles.markerBangkok]} />
          <Text style={styles.mapText}>Asia Travel Route</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>인기 여행지</Text>
          <Text style={styles.sectionCaption}>이번 시즌 많이 저장한 도시</Text>
        </View>
        <View style={styles.sectionIcon}>
          <Feather name="trending-up" size={18} color="#176b55" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardList}>
        {destinations.map((destination) => (
          <DestinationCard
            key={destination.id}
            destination={destination}
            onPress={() => onSelectDestination(destination.id)}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4fbf8',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 4,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcebe4',
    shadowColor: '#245747',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#14231f',
    fontSize: 15,
  },
  clearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterList: {
    paddingLeft: 20,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 2,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4e6de',
  },
  activeFilterButton: {
    backgroundColor: '#176b55',
    borderColor: '#176b55',
  },
  filterText: {
    marginLeft: 6,
    color: '#176b55',
    fontSize: 13,
    fontWeight: '800',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  searchResults: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
    shadowColor: '#245747',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultTitle: {
    color: '#14231f',
    fontSize: 16,
    fontWeight: '800',
  },
  resultFilterLabel: {
    color: '#176b55',
    fontSize: 12,
    fontWeight: '900',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 104,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e4eee9',
  },
  resultImage: {
    width: 76,
    height: 76,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#dcebe4',
  },
  resultCopy: {
    flex: 1,
    paddingRight: 8,
  },
  resultName: {
    color: '#14231f',
    fontSize: 17,
    fontWeight: '800',
  },
  resultMeta: {
    marginTop: 3,
    color: '#61736c',
    fontSize: 12,
    fontWeight: '700',
  },
  resultTagline: {
    marginTop: 4,
    color: '#7a8c85',
    fontSize: 12,
  },
  resultTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 5,
  },
  resultTag: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#e8f6f0',
  },
  resultTagText: {
    color: '#176b55',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyResult: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e4eee9',
  },
  emptyResultText: {
    marginTop: 8,
    color: '#61736c',
    fontSize: 14,
    fontWeight: '800',
  },
  mapArea: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#cfe7dd',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mapTitle: {
    color: '#14231f',
    fontSize: 19,
    fontWeight: '800',
  },
  mapMeta: {
    marginTop: 3,
    color: '#60746d',
    fontSize: 12,
    fontWeight: '700',
  },
  mapIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  mapCanvas: {
    height: 182,
    borderRadius: 8,
    backgroundColor: '#b7ded5',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  land: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  landOne: {
    width: 150,
    height: 58,
    left: 26,
    top: 38,
    transform: [{ rotate: '-12deg' }],
  },
  landTwo: {
    width: 128,
    height: 64,
    right: 22,
    top: 58,
    transform: [{ rotate: '15deg' }],
  },
  landThree: {
    width: 92,
    height: 42,
    right: 74,
    bottom: 28,
    transform: [{ rotate: '-8deg' }],
  },
  mapText: {
    color: '#245f52',
    fontSize: 16,
    fontWeight: '800',
  },
  marker: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ff8a5b',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  markerTokyo: {
    right: '22%',
    top: '39%',
  },
  markerOsaka: {
    right: '28%',
    top: '48%',
  },
  markerJeju: {
    right: '34%',
    top: '54%',
  },
  markerDanang: {
    right: '30%',
    bottom: '26%',
  },
  markerBangkok: {
    right: '40%',
    bottom: '32%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#14231f',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionCaption: {
    marginTop: 4,
    color: '#6f8079',
    fontSize: 13,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4f4ee',
  },
  cardList: {
    paddingLeft: 20,
    paddingRight: 6,
    paddingBottom: 28,
  },
});
