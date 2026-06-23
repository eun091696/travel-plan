import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';

export default function AIPlanResultScreen({ plan, onBack, onSave }) {
  if (!plan) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="AI 일정 결과" subtitle="생성된 일정이 없습니다." onBack={onBack} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="AI 일정 결과" subtitle="생성된 일정을 확인하고 저장하세요." onBack={onBack} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Feather name="map" size={22} color="#176b55" />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.destination}>{plan.destination}</Text>
          <Text style={styles.summary}>{plan.summary}</Text>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>기간</Text>
          <Text style={styles.metaValue}>{plan.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="log-in" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>입국</Text>
          <Text style={styles.metaValue}>{plan.arrivalTime || '자유'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="log-out" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>출국</Text>
          <Text style={styles.metaValue}>{plan.departureTime || '자유'}</Text>
        </View>
      </View>

      <View style={styles.timelineList}>
        {plan.days.map((day) => (
          <View key={day.day} testID={`result-day-${day.day}`} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{day.day}</Text>
              </View>
              <View>
                <Text style={styles.dayTitle}>Day {day.day}</Text>
                <Text style={styles.daySubtitle}>{day.title}</Text>
              </View>
            </View>

            {day.items.map((item) => (
              <View key={`${day.day}-${item.time}-${item.placeName}`} style={styles.timelineRow}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <View style={styles.line} />
                </View>
                <View style={styles.placeIcon}>
                  <Feather name={item.icon || 'map-pin'} size={17} color="#176b55" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.placeName}>{item.placeName}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="생성된 일정 저장"
        testID="save-itinerary-button"
        style={styles.saveButton}
        onPress={onSave}
      >
        <Feather name="save" size={19} color="#ffffff" />
        <Text style={styles.saveButtonText}>일정 저장</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4fbf8',
  },
  summaryCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
    shadowColor: '#245747',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#e8f6f0',
  },
  summaryCopy: {
    flex: 1,
  },
  destination: {
    color: '#14231f',
    fontSize: 22,
    fontWeight: '800',
  },
  summary: {
    marginTop: 6,
    color: '#61736c',
    fontSize: 14,
    lineHeight: 21,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 6,
  },
  metaItem: {
    flex: 1,
    minHeight: 76,
    padding: 11,
    borderRadius: 8,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#d1e9df',
  },
  metaLabel: {
    marginTop: 6,
    color: '#6f827a',
    fontSize: 11,
    fontWeight: '800',
  },
  metaValue: {
    marginTop: 4,
    color: '#14231f',
    fontSize: 13,
    fontWeight: '800',
  },
  timelineList: {
    paddingHorizontal: 20,
  },
  dayCard: {
    marginTop: 12,
    padding: 16,
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
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#176b55',
  },
  dayBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  dayTitle: {
    color: '#176b55',
    fontSize: 18,
    fontWeight: '800',
  },
  daySubtitle: {
    marginTop: 2,
    color: '#40544d',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  timeColumn: {
    width: 52,
    alignItems: 'center',
  },
  timeText: {
    color: '#71827b',
    fontSize: 12,
    fontWeight: '800',
  },
  line: {
    width: 2,
    height: 42,
    marginTop: 7,
    borderRadius: 1,
    backgroundColor: '#dcebe4',
  },
  placeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    backgroundColor: '#e8f6f0',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef4f1',
  },
  placeName: {
    color: '#14231f',
    fontSize: 15,
    fontWeight: '800',
  },
  description: {
    marginTop: 5,
    color: '#61736c',
    fontSize: 13,
    lineHeight: 19,
  },
  saveButton: {
    flexDirection: 'row',
    height: 56,
    marginHorizontal: 20,
    marginTop: 18,
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
  saveButtonText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
