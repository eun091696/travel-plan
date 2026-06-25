import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getDayColor, getMapDataForPlan, getMapPointsForDay, getSelectedMapDay } from '../services/mapService';

function getBounds(points, center) {
  const latitudes = points.map((point) => point.coordinate.latitude).concat(center.latitude);
  const longitudes = points.map((point) => point.coordinate.longitude).concat(center.longitude);

  return {
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes),
  };
}

function projectPoint(coordinate, bounds) {
  const latitudeRange = bounds.maxLatitude - bounds.minLatitude || 0.01;
  const longitudeRange = bounds.maxLongitude - bounds.minLongitude || 0.01;

  return {
    left: `${8 + ((coordinate.longitude - bounds.minLongitude) / longitudeRange) * 84}%`,
    top: `${8 + ((bounds.maxLatitude - coordinate.latitude) / latitudeRange) * 84}%`,
  };
}

function WebRouteLine({ from, to, color }) {
  const fromX = parseFloat(from.left);
  const fromY = parseFloat(from.top);
  const toX = parseFloat(to.left);
  const toY = parseFloat(to.top);
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const width = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  return (
    <View
      style={[
        styles.webLine,
        {
          left: from.left,
          top: from.top,
          width: `${width}%`,
          backgroundColor: color,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
}

function WebMap({ center, selectedDay, points, dayColor }) {
  const bounds = useMemo(() => getBounds(points, center), [center, points]);

  return (
    <View testID="itinerary-map-web" style={styles.webMap}>
      <View style={[styles.webLand, styles.webLandOne]} />
      <View style={[styles.webLand, styles.webLandTwo]} />
      <View style={[styles.webLand, styles.webLandThree]} />

      {selectedDay.points.slice(1).map((point, index) => {
        const previousPoint = selectedDay.points[index];
        return (
          <WebRouteLine
            key={`line-${selectedDay.day}-${point.id}`}
            from={projectPoint(previousPoint.coordinate, bounds)}
            to={projectPoint(point.coordinate, bounds)}
            color={dayColor}
          />
        );
      })}

      {points.map((point) => {
        const position = projectPoint(point.coordinate, bounds);
        return (
          <View
            key={point.id}
            testID={`map-pin-${point.id}`}
            style={[styles.webPin, { left: position.left, top: position.top, backgroundColor: dayColor }]}
          >
            <Text style={styles.webPinText}>{point.order}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ItineraryMapView({ plan }) {
  const mapData = useMemo(() => getMapDataForPlan(plan), [plan]);
  const [selectedDayNumber, setSelectedDayNumber] = useState(mapData.days[0]?.day || 1);
  const selectedDayIndex = Math.max(0, mapData.days.findIndex((day) => day.day === selectedDayNumber));
  const selectedDay = getSelectedMapDay(mapData, selectedDayNumber);
  const dayColor = getDayColor(selectedDayIndex);
  const points = useMemo(() => getMapPointsForDay(selectedDay, selectedDayIndex), [selectedDay, selectedDayIndex]);

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

      <WebMap center={mapData.center} selectedDay={selectedDay} points={points} dayColor={dayColor} />

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
  webMap: {
    height: 280,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#b7ded5',
    borderWidth: 1,
    borderColor: '#d1e9df',
  },
  webLand: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  webLandOne: {
    width: 150,
    height: 58,
    left: 24,
    top: 48,
    transform: [{ rotate: '-12deg' }],
  },
  webLandTwo: {
    width: 138,
    height: 68,
    right: 22,
    top: 76,
    transform: [{ rotate: '14deg' }],
  },
  webLandThree: {
    width: 92,
    height: 42,
    right: 78,
    bottom: 34,
    transform: [{ rotate: '-8deg' }],
  },
  webLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    transformOrigin: '0 50%',
    opacity: 0.72,
  },
  webPin: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  webPinText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
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
