import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import InfoCard from '../components/InfoCard';
import ScreenHeader from '../components/ScreenHeader';

export default function RegionDetailScreen({ destination, onBack, onCreateAIPlan }) {
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

      <View style={styles.weatherCard}>
        <View style={styles.weatherIcon}>
          <Feather name="sun" size={24} color="#ffffff" />
        </View>
        <View style={styles.weatherCopy}>
          <Text style={styles.weatherLabel}>오늘의 날씨</Text>
          <Text style={styles.weatherMain}>{destination.weather}</Text>
          <Text style={styles.weatherSub}>추천 시기: {destination.bestSeason}</Text>
        </View>
        <Text style={styles.temperature}>{destination.temperature}</Text>
      </View>

      <InfoCard title="추천 명소" icon="camera">
        {destination.spots.map((spot, index) => (
          <View key={spot} style={styles.listRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.listText}>{spot}</Text>
          </View>
        ))}
      </InfoCard>

      <InfoCard title="맛집 리스트" icon="coffee">
        {destination.restaurants.map((restaurant) => (
          <View key={restaurant} style={styles.restaurantRow}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={17} color="#ff8a5b" />
            <Text style={styles.listText}>{restaurant}</Text>
          </View>
        ))}
      </InfoCard>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="AI 일정 만들기"
        testID="create-ai-plan-button"
        style={styles.aiButton}
        onPress={onCreateAIPlan}
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
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
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
