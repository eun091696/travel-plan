import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';

const textFields = [
  { key: 'arrivalTime', label: '입국/도착 시간', placeholder: '선택 입력 예: 12:30', icon: 'log-in', testID: 'arrival-time-input' },
  { key: 'departureTime', label: '출국/출발 시간', placeholder: '선택 입력 예: 18:00', icon: 'log-out', testID: 'departure-time-input' },
  { key: 'budget', label: '예산', placeholder: '예: 120만원', icon: 'credit-card', testID: 'budget-input' },
  { key: 'companions', label: '동행인', placeholder: '예: 혼자, 친구, 가족, 연인', icon: 'users', testID: 'companions-input' },
  { key: 'style', label: '여행 스타일', placeholder: '예: 맛집 중심, 휴양, 박물관 투어', icon: 'sliders', testID: 'style-input' },
];

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value) {
  if (!value) return '선택 안 함';
  const [year, month, day] = value.split('-');
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function getMonthCells(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const cells = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, monthIndex, day);
    cells.push({
      value: toDateValue(date),
      day,
      weekday: weekdays[date.getDay()],
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function AIPlanScreen({ destination, onBack, onSubmit, isLoading = false, error = '' }) {
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);
  const [visibleYear, setVisibleYear] = useState(today.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth());
  const [selecting, setSelecting] = useState('startDate');
  const [form, setForm] = useState({
    startDate: toDateValue(today),
    endDate: toDateValue(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
    arrivalTime: '',
    departureTime: '',
    budget: '',
    companions: '',
    style: '',
  });

  const calendarCells = useMemo(() => getMonthCells(visibleYear, visibleMonth), [visibleYear, visibleMonth]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const moveMonth = (amount) => {
    const nextDate = new Date(visibleYear, visibleMonth + amount, 1);
    setVisibleYear(nextDate.getFullYear());
    setVisibleMonth(nextDate.getMonth());
  };

  const moveYear = (amount) => {
    setVisibleYear((current) => current + amount);
  };

  const selectDate = (value) => {
    setForm((current) => {
      if (selecting === 'startDate') {
        return {
          ...current,
          startDate: value,
          endDate: current.endDate && current.endDate >= value ? current.endDate : value,
        };
      }

      return {
        ...current,
        endDate: value >= current.startDate ? value : current.startDate,
      };
    });
    setSelecting(selecting === 'startDate' ? 'endDate' : 'startDate');
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="AI 일정 만들기"
        subtitle={`${destination.name} 여행 날짜와 조건을 입력해주세요.`}
        onBack={onBack}
      />

      <View style={styles.guideCard}>
        <View style={styles.guideIcon}>
          <Feather name="calendar" size={20} color="#176b55" />
        </View>
        <View style={styles.guideCopy}>
          <Text testID="ai-plan-destination-name" style={styles.guideTitle}>{destination.name} 맞춤 일정</Text>
          <Text style={styles.regionMeta}>{destination.country} · {destination.weather} · {destination.temperature}</Text>
          <Text style={styles.guideText}>년, 월, 일을 선택하고 도착/출발 시간을 일정에 반영하세요.</Text>
        </View>
      </View>

      <View style={styles.dateCard}>
        <Text style={styles.cardTitle}>여행 날짜</Text>
        <View style={styles.dateSummaryRow}>
          <Pressable
            testID="select-start-date-mode"
            style={[styles.dateSummary, selecting === 'startDate' && styles.activeDateSummary]}
            onPress={() => setSelecting('startDate')}
          >
            <Text style={styles.dateSummaryLabel}>시작 날짜</Text>
            <Text style={styles.dateSummaryValue}>{formatDateLabel(form.startDate)}</Text>
          </Pressable>
          <Pressable
            testID="select-end-date-mode"
            style={[styles.dateSummary, selecting === 'endDate' && styles.activeDateSummary]}
            onPress={() => setSelecting('endDate')}
          >
            <Text style={styles.dateSummaryLabel}>종료 날짜</Text>
            <Text style={styles.dateSummaryValue}>{formatDateLabel(form.endDate)}</Text>
          </Pressable>
        </View>

        <View style={styles.calendarToolbar}>
          <Pressable testID="calendar-prev-year" style={styles.calendarNavButton} onPress={() => moveYear(-1)}>
            <Feather name="chevrons-left" size={18} color="#176b55" />
          </Pressable>
          <Pressable testID="calendar-prev-month" style={styles.calendarNavButton} onPress={() => moveMonth(-1)}>
            <Feather name="chevron-left" size={18} color="#176b55" />
          </Pressable>
          <Text testID="calendar-current-month" style={styles.calendarTitle}>
            {visibleYear}년 {visibleMonth + 1}월
          </Text>
          <Pressable testID="calendar-next-month" style={styles.calendarNavButton} onPress={() => moveMonth(1)}>
            <Feather name="chevron-right" size={18} color="#176b55" />
          </Pressable>
          <Pressable testID="calendar-next-year" style={styles.calendarNavButton} onPress={() => moveYear(1)}>
            <Feather name="chevrons-right" size={18} color="#176b55" />
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {weekdays.map((weekday) => (
            <Text key={weekday} style={styles.weekdayHeader}>{weekday}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarCells.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={styles.emptyDay} />;
            }

            const isSelected = date.value === form.startDate || date.value === form.endDate;
            const isInRange = date.value > form.startDate && date.value < form.endDate;

            return (
              <Pressable
                key={date.value}
                testID={`calendar-day-${date.value}`}
                style={[styles.calendarDay, isInRange && styles.rangeDay, isSelected && styles.selectedDay]}
                onPress={() => selectDate(date.value)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{date.day}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.formCard}>
        {textFields.map((field) => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <View style={[styles.inputBox, field.key === 'style' && styles.multilineBox]}>
              <Feather name={field.icon} size={18} color="#176b55" />
              <TextInput
                testID={field.testID}
                style={[styles.input, field.key === 'style' && styles.multilineInput]}
                value={form[field.key]}
                onChangeText={(value) => updateField(field.key, value)}
                placeholder={field.placeholder}
                placeholderTextColor="#91a59d"
                multiline={field.key === 'style'}
                keyboardType={field.key.includes('Time') ? 'numbers-and-punctuation' : 'default'}
              />
            </View>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="일정 생성"
        testID="generate-itinerary-button"
        disabled={isLoading}
        style={[styles.submitButton, isLoading && styles.disabledSubmitButton]}
        onPress={() => onSubmit(form)}
      >
        <Feather name={isLoading ? 'loader' : 'send'} size={19} color="#ffffff" />
        <Text style={styles.submitButtonText}>{isLoading ? 'AI 일정 생성 중' : '일정 생성'}</Text>
      </Pressable>
      {error ? (
        <View style={styles.errorCard}>
          <Feather name="alert-circle" size={17} color="#d45555" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4fbf8',
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#cfe7dd',
  },
  guideIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#ffffff',
  },
  guideCopy: {
    flex: 1,
  },
  guideTitle: {
    color: '#14231f',
    fontSize: 16,
    fontWeight: '800',
  },
  regionMeta: {
    marginTop: 4,
    color: '#176b55',
    fontSize: 12,
    fontWeight: '800',
  },
  guideText: {
    marginTop: 4,
    color: '#61736c',
    fontSize: 13,
    lineHeight: 19,
  },
  dateCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  cardTitle: {
    color: '#14231f',
    fontSize: 17,
    fontWeight: '800',
  },
  dateSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  dateSummary: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  activeDateSummary: {
    borderColor: '#176b55',
    backgroundColor: '#e8f6f0',
  },
  dateSummaryLabel: {
    color: '#71827b',
    fontSize: 12,
    fontWeight: '800',
  },
  dateSummaryValue: {
    marginTop: 5,
    color: '#14231f',
    fontSize: 14,
    fontWeight: '800',
  },
  calendarToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  calendarNavButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#d1e9df',
  },
  calendarTitle: {
    flex: 1,
    color: '#14231f',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 6,
  },
  weekdayHeader: {
    flex: 1,
    color: '#7a8c85',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: '14.285%',
    minHeight: 44,
  },
  calendarDay: {
    width: '14.285%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rangeDay: {
    backgroundColor: '#edf8f3',
  },
  selectedDay: {
    backgroundColor: '#176b55',
    borderColor: '#176b55',
  },
  dayText: {
    color: '#14231f',
    fontSize: 14,
    fontWeight: '800',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  formCard: {
    marginHorizontal: 20,
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
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#243732',
    fontSize: 14,
    fontWeight: '800',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#dce8e3',
  },
  multilineBox: {
    minHeight: 96,
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#14231f',
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  submitButton: {
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
  disabledSubmitButton: {
    opacity: 0.68,
  },
  submitButtonText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff1f0',
    borderWidth: 1,
    borderColor: '#ffd7d3',
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: '#d45555',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
});
