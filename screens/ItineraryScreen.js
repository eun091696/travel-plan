import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';

function formatSavedDate(value) {
  if (!value) return '생성일 미정';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '생성일 미정';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function getDateRange(plan) {
  if (plan.startDate && plan.endDate) return `${plan.startDate} - ${plan.endDate}`;
  if (plan.duration) return plan.duration;
  return '여행 날짜 미정';
}

export default function ItineraryScreen({ plans, onSelectPlan, isLoading = false, error = '' }) {
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="내 일정" subtitle="저장된 여행 일정을 한눈에 관리하세요." icon="calendar" />

      <View style={styles.list}>
        {isLoading ? (
          <View testID="itinerary-loading" style={styles.stateCard}>
            <Feather name="loader" size={24} color="#176b55" />
            <Text style={styles.stateTitle}>일정을 불러오는 중입니다</Text>
            <Text style={styles.stateText}>백엔드 API 또는 로컬 저장 데이터를 확인하고 있어요.</Text>
          </View>
        ) : error ? (
          <View testID="itinerary-error" style={styles.stateCard}>
            <Feather name="alert-circle" size={24} color="#d45555" />
            <Text style={styles.stateTitle}>일정을 불러오지 못했습니다</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : plans.length === 0 ? (
          <View testID="empty-itinerary" style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather name="map" size={24} color="#176b55" />
            </View>
            <Text style={styles.emptyTitle}>저장된 일정이 없습니다</Text>
            <Text style={styles.emptyText}>AI 일정 결과 화면에서 마음에 드는 일정을 저장해보세요.</Text>
          </View>
        ) : (
          plans.map((plan) => (
            <Pressable
              key={plan.id}
              accessibilityRole="button"
              accessibilityLabel={`${plan.destination} 일정 상세 보기`}
              testID={`saved-plan-card-${plan.id}`}
              style={styles.planCard}
              onPress={() => onSelectPlan(plan.id)}
            >
              <View style={styles.planHeader}>
                <View style={styles.planIcon}>
                  <Feather name="map-pin" size={20} color="#176b55" />
                </View>
                <View style={styles.planTitleBlock}>
                  <Text style={styles.destination}>{plan.destination}</Text>
                  <Text style={styles.country}>{plan.country || '여행지'}</Text>
                </View>
                <Feather name="chevron-right" size={22} color="#9aaba4" />
              </View>

              <View style={styles.metaList}>
                <View style={styles.metaRow}>
                  <Feather name="calendar" size={15} color="#176b55" />
                  <Text style={styles.metaLabel}>여행 날짜</Text>
                  <Text style={styles.metaValue}>{getDateRange(plan)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Feather name="users" size={15} color="#176b55" />
                  <Text style={styles.metaLabel}>동행인</Text>
                  <Text style={styles.metaValue}>{plan.companions || '미정'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Feather name="sliders" size={15} color="#176b55" />
                  <Text style={styles.metaLabel}>여행 스타일</Text>
                  <Text style={styles.metaValue}>{plan.style || '자유 여행'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Feather name="clock" size={15} color="#176b55" />
                  <Text style={styles.metaLabel}>생성일</Text>
                  <Text style={styles.metaValue}>{formatSavedDate(plan.savedAt)}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>Day {(plan.days || []).length} 일정</Text>
                <Text style={styles.footerAction}>상세 보기</Text>
              </View>
            </Pressable>
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
  stateCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  stateTitle: {
    marginTop: 12,
    color: '#14231f',
    fontSize: 17,
    fontWeight: '800',
  },
  stateText: {
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
    alignItems: 'center',
  },
  planIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  metaList: {
    marginTop: 16,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e4eee9',
  },
  metaLabel: {
    width: 82,
    marginLeft: 8,
    color: '#7a8c85',
    fontSize: 12,
    fontWeight: '800',
  },
  metaValue: {
    flex: 1,
    color: '#21342f',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#eef4f1',
  },
  footerText: {
    color: '#61736c',
    fontSize: 13,
    fontWeight: '800',
  },
  footerAction: {
    color: '#176b55',
    fontSize: 13,
    fontWeight: '900',
  },
});
