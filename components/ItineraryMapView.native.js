import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { getDayColor, getMapDataForPlan, getMapPointsForDay, getSelectedMapDay } from '../services/mapService';

function getNativeRegion(center, points) {
  if (points.length === 0) {
    return { ...center, latitudeDelta: 0.12, longitudeDelta: 0.12 };
  }

  const latitudes = points.map((point) => point.coordinate.latitude);
  const longitudes = points.map((point) => point.coordinate.longitude);
  const minLatitude = Math.min(...latitudes, center.latitude);
  const maxLatitude = Math.max(...latitudes, center.latitude);
  const minLongitude = Math.min(...longitudes, center.longitude);
  const maxLongitude = Math.max(...longitudes, center.longitude);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max(maxLatitude - minLatitude + 0.08, 0.08),
    longitudeDelta: Math.max(maxLongitude - minLongitude + 0.08, 0.08),
  };
}

export default function ItineraryMapView({ plan }) {
  const mapData = useMemo(() => getMapDataForPlan(plan), [plan]);
  const [selectedDayNumber, setSelectedDayNumber] = useState(mapData.days[0]?.day || 1);
  const selectedDayIndex = Math.max(0, mapData.days.findIndex((day) => day.day === selectedDayNumber));
  const selectedDay = getSelectedMapDay(mapData, selectedDayNumber);
  const dayColor = getDayColor(selectedDayIndex);
  const points = useMemo(() => getMapPointsForDay(selectedDay, selectedDayIndex), [selectedDay, selectedDayIndex]);
  const region = useMemo(() => getNativeRegion(mapData.center, points), [mapData.center, points]);

  if (!selectedDay || points.length === 0) {
    return (
      <View testID="itinerary-map-empty" style={styles.emptyMap}>
        <Feather name="map" size={22} color="#91a59d" />
        <Text style={styles.emptyText}>지도에 표시할 일정 장소가 없습니다</Text>
      </View>
    );
  }

  return (
    <View testID="itinerary-map-section" style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>일정 지도</Text>
          <Text style={styles.subtitle}>Day별 장소와 이동 순서를 확인하세요</Text>
        </View>
        <Feather name="map-pin" size={20} color="#176b55" />
      </View>

      <View style={styles.daySelector}>
        {mapData.days.map((day) => {
          const isActive = selectedDayNumber === day.day;
          return (
            <Pressable
              key={`map-day-${day.day}`}
              testID={`map-day-selector-${day.day}`}
              style={[styles.dayButton, isActive && styles.activeDayButton]}
              onPress={() => setSelectedDayNumber(day.day)}
            >
              <Text style={[styles.dayButtonText, isActive && styles.activeDayButtonText]}>Day {day.day}</Text>
            </Pressable>
          );
        })}
      </View>

      <MapView testID="itinerary-map-native" style={styles.nativeMap} initialRegion={region} region={region}>
        {points.length > 1 ? (
          <Polyline coordinates={points.map((point) => point.coordinate)} strokeColor={dayColor} strokeWidth={4} />
        ) : null}
        {points.map((point) => (
          <Marker
            key={`native-pin-${point.id}`}
            coordinate={point.coordinate}
            title={`${point.order}. ${point.time} ${point.placeName}`}
            description={point.description}
            pinColor={dayColor}
          />
        ))}
      </MapView>

      <View style={styles.legendList}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: dayColor }]} />
          <Text style={styles.legendText}>Day {selectedDay.day} 동선</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
    shadowColor: '#245747',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#14231f',
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 3,
    color: '#61736c',
    fontSize: 12,
    fontWeight: '700',
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  dayButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#d4e6de',
  },
  activeDayButton: {
    backgroundColor: '#176b55',
    borderColor: '#176b55',
  },
  dayButtonText: {
    color: '#176b55',
    fontSize: 12,
    fontWeight: '900',
  },
  activeDayButtonText: {
    color: '#ffffff',
  },
  nativeMap: {
    height: 280,
    borderRadius: 8,
    overflow: 'hidden',
  },
  legendList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e4eee9',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: '#40544d',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyMap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  emptyText: {
    marginTop: 8,
    color: '#61736c',
    fontSize: 13,
    fontWeight: '800',
  },
});
