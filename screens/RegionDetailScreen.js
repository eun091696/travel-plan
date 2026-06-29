import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import InfoCard from '../components/InfoCard';
import ScreenHeader from '../components/ScreenHeader';
import WeatherCard from '../components/WeatherCard';
import { getRegionPlaceGroups } from '../services/placeService';
import { getWeatherForTrip } from '../services/weatherService';

export default function RegionDetailScreen({ destination, onBack, onCreateAIPlan }) {
  const [weatherState, setWeatherState] = useState({ loading: true, data: null, error: null });
  const [placeState, setPlaceState] = useState({ loading: true, attractions: [], restaurants: [], error: null });

  useEffect(() => {
    let mounted = true;

    const loadScreenData = async () => {
      setWeatherState({ loading: true, data: null, error: null });
      setPlaceState({ loading: true, attractions: [], restaurants: [], error: null });

      const [weatherData, placeData] = await Promise.all([
        getWeatherForTrip({ destination, date: new Date() }),
        getRegionPlaceGroups({ destination, limit: 5 }),
      ]);

      if (mounted) {
        setWeatherState({
          loading: false,
          data: weatherData,
          error: weatherData.type === 'fallback' ? weatherData.error : null,
        });
        setPlaceState({
          loading: false,
          attractions: placeData.attractions,
          restaurants: placeData.restaurants,
          error: placeData.error,
        });
      }
    };

    loadScreenData();

    return () => {
      mounted = false;
    };
  }, [destination]);

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <ScreenHeader title={destination.name} subtitle={`${destination.country} · ${destination.tagline}`} onBack={onBack} />

      <ImageBackground source={{ uri: destination.image }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={styles.locationPill}>
            <Feather name="map-pin" size={14} color="#ffffff" />
            <Text style={styles.locationText}>{destination.country}</Text>
          </View>
          <Text style={styles.heroTitle}>{destination.name}</Text>
          <View style={styles.tagRow}>
            {(destination.styleTags || []).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>

      <WeatherCard weather={weatherState.data} loading={weatherState.loading} error={weatherState.error} />

      <InfoCard title="추천 관광지 TOP 5" icon="camera">
        {placeState.loading ? <Text style={styles.stateText}>장소 정보를 불러오는 중입니다</Text> : null}
        {placeState.error ? <Text style={styles.errorText}>{placeState.error}</Text> : null}
        {!placeState.loading && placeState.attractions.map((place, index) => (
          <View key={place.id} style={styles.placeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
            <View style={styles.placeCopy}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeMeta}>{place.category} · 평점 {place.rating} · {place.address}</Text>
              <Text style={styles.placeDescription}>{place.description}</Text>
            </View>
          </View>
        ))}
      </InfoCard>

      <InfoCard title="맛집 TOP 5" icon="coffee">
        {placeState.loading ? <Text style={styles.stateText}>맛집 정보를 불러오는 중입니다</Text> : null}
        {placeState.error ? <Text style={styles.errorText}>{placeState.error}</Text> : null}
        {!placeState.loading && placeState.restaurants.map((place) => (
          <View key={place.id} style={styles.restaurantRow}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={17} color="#ff8a5b" />
            <View style={styles.placeCopy}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeMeta}>{place.category} · 평점 {place.rating} · {place.address}</Text>
              <Text style={styles.placeDescription}>{place.description}</Text>
            </View>
          </View>
        ))}
      </InfoCard>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="AI 일정 만들기"
        testID="create-ai-plan-button"
        style={styles.aiButton}
        onPress={() => onCreateAIPlan(destination)}
      >
        <Feather name="star" size={19} color="#ffffff" />
        <Text style={styles.aiButtonText}>AI 일정 만들기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4fbf8',
  },
  hero: {
    height: 218,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#d9e7e1',
  },
  heroImage: {
    borderRadius: 8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 33, 28, 0.38)',
  },
  heroContent: {
    padding: 18,
  },
  locationPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  locationText: {
    marginLeft: 5,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  heroTitle: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    marginRight: 7,
    marginBottom: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  tagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#176b55',
    shadowColor: '#176b55',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  weatherIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  weatherCopy: {
    flex: 1,
  },
  weatherLabel: {
    color: '#bfe6da',
    fontSize: 13,
    fontWeight: '700',
  },
  weatherMain: {
    marginTop: 5,
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  weatherSub: {
    marginTop: 5,
    color: '#d9f1ea',
    fontSize: 13,
  },
  temperature: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4f4ee',
  },
  badgeText: {
    color: '#176b55',
    fontSize: 13,
    fontWeight: '800',
  },
  listText: {
    flex: 1,
    marginLeft: 10,
    color: '#263833',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
  },
  placeCopy: {
    flex: 1,
    marginLeft: 10,
  },
  placeName: {
    color: '#263833',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '900',
  },
  placeMeta: {
    marginTop: 3,
    color: '#61736c',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  placeDescription: {
    marginTop: 4,
    color: '#52655e',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  stateText: {
    color: '#61736c',
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    marginBottom: 10,
    color: '#d45555',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
  },
  aiButton: {
    flexDirection: 'row',
    height: 56,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 28,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#176b55',
    shadowColor: '#176b55',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  aiButtonText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
