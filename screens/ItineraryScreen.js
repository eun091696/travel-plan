import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';

export default function ItineraryScreen({ plans }) {
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="내 일정" subtitle="저장된 여행 일정을 카드로 확인하세요." icon="calendar" />

      <View style={styles.list}>
        {plans.length === 0 ? (
          <View testID="empty-itinerary" style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather name="map" size={24} color="#176b55" />
            </View>
            <Text style={styles.emptyTitle}>저장된 일정이 없습니다</Text>
            <Text style={styles.emptyText}>AI 일정 결과 화면에서 마음에 드는 일정을 저장해보세요.</Text>
          </View>
        ) : (
          plans.map((plan) => (
            <View key={plan.id} testID={`itinerary-card-${plan.id}`} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.planIcon}>
                  <Feather name="map-pin" size={20} color="#176b55" />
                </View>
                <View style={styles.planTitleBlock}>
                  <Text style={styles.destination}>{plan.destination}</Text>
                  <Text style={styles.country}>{plan.country}</Text>
                </View>
                <View style={styles.durationPill}>
                  <Text style={styles.durationText}>{plan.duration || '미정'}</Text>
                </View>
              </View>

              <Text style={styles.summary}>{plan.summary}</Text>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Feather name="credit-card" size={15} color="#176b55" />
                  <Text style={styles.metaLabel}>예산</Text>
                  <Text style={styles.metaValue}>{plan.budget || '미정'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="users" size={15} color="#176b55" />
                  <Text style={styles.metaLabel}>동행</Text>
                  <Text style={styles.metaValue}>{plan.companions || '미정'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="sliders" size={15} color="#176b55" />
                  <Text style={styles.metaLabel}>스타일</Text>
                  <Text style={styles.metaValue}>{plan.style || '자유 여행'}</Text>
                </View>
              </View>

              <View style={styles.dayList}>
                {(plan.days || []).map((day) => (
                  <View key={`${plan.id}-${day.day}`} testID={`day-${day.day}`} style={styles.dayCard}>
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
                          <View style={styles.timelineDot} />
                        </View>
                        <View style={styles.itemIcon}>
                          <Feather name={item.icon || 'map-pin'} size={16} color="#176b55" />
                        </View>
                        <View style={styles.timelineContent}>
                          <Text style={styles.activity}>{item.placeName}</Text>
                          <Text style={styles.note}>{item.description}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4fbf8',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: '#e8f6f0',
  },
  emptyTitle: {
    color: '#14231f',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    color: '#61736c',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  planCard: {
    marginBottom: 14,
    padding: 18,
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
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#e8f6f0',
  },
  planTitleBlock: {
    flex: 1,
    paddingRight: 10,
  },
  destination: {
    color: '#14231f',
    fontSize: 22,
    fontWeight: '800',
  },
  country: {
    marginTop: 4,
    color: '#71827b',
    fontSize: 13,
    fontWeight: '700',
  },
  durationPill: {
    minWidth: 74,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#e4f4ee',
  },
  durationText: {
    color: '#176b55',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '800',
  },
  summary: {
    marginTop: 14,
    color: '#344943',
    fontSize: 15,
    lineHeight: 22,
  },
  metaGrid: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  metaItem: {
    flex: 1,
    minHeight: 72,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e4eee9',
  },
  metaLabel: {
    marginTop: 6,
    color: '#7a8c85',
    fontSize: 11,
    fontWeight: '800',
  },
  metaValue: {
    marginTop: 4,
    color: '#21342f',
    fontSize: 13,
    fontWeight: '800',
  },
  dayList: {
    marginTop: 18,
  },
  dayCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e0ebe6',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    fontSize: 17,
    fontWeight: '800',
  },
  daySubtitle: {
    marginTop: 3,
    color: '#40544d',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  timeColumn: {
    width: 54,
    alignItems: 'center',
  },
  timeText: {
    color: '#71827b',
    fontSize: 12,
    fontWeight: '800',
  },
  timelineDot: {
    width: 8,
    height: 8,
    marginTop: 8,
    borderRadius: 4,
    backgroundColor: '#ff8a5b',
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#e8f6f0',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e4ece8',
  },
  activity: {
    color: '#14231f',
    fontSize: 15,
    fontWeight: '800',
  },
  note: {
    marginTop: 4,
    color: '#61736c',
    fontSize: 13,
    lineHeight: 19,
  },
});
