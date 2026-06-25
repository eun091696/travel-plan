import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';

function clonePlan(plan) {
  return JSON.parse(JSON.stringify(plan));
}

function makeKey(dayIndex, itemIndex) {
  return `${dayIndex}-${itemIndex}`;
}

function createEmptyItem() {
  return {
    time: '',
    placeName: '',
    description: '',
    icon: 'plus-circle',
  };
}

function confirmDelete(onConfirm) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm('이 일정 항목을 삭제할까요?')) {
      onConfirm();
    }
    return;
  }

  Alert.alert('일정 삭제', '이 일정 항목을 삭제할까요?', [
    { text: '취소', style: 'cancel' },
    { text: '삭제', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function AIPlanResultScreen({ plan, onBack, onSave }) {
  const [editablePlan, setEditablePlan] = useState(plan ? clonePlan(plan) : null);
  const [editingKey, setEditingKey] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [addingDayIndex, setAddingDayIndex] = useState(null);
  const [addDraft, setAddDraft] = useState(createEmptyItem());

  useEffect(() => {
    setEditablePlan(plan ? clonePlan(plan) : null);
    setEditingKey(null);
    setEditingDraft(null);
    setAddingDayIndex(null);
    setAddDraft(createEmptyItem());
  }, [plan]);

  if (!editablePlan) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="AI 일정 결과" subtitle="생성된 일정이 없습니다." onBack={onBack} />
      </View>
    );
  }

  const startEdit = (dayIndex, itemIndex, item) => {
    setAddingDayIndex(null);
    setEditingKey(makeKey(dayIndex, itemIndex));
    setEditingDraft({ ...item });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditingDraft(null);
  };

  const saveEdit = (dayIndex, itemIndex) => {
    setEditablePlan((current) => {
      const nextPlan = clonePlan(current);
      nextPlan.days[dayIndex].items[itemIndex] = {
        ...nextPlan.days[dayIndex].items[itemIndex],
        ...editingDraft,
      };
      return nextPlan;
    });
    cancelEdit();
  };

  const deleteItem = (dayIndex, itemIndex) => {
    confirmDelete(() => {
      setEditablePlan((current) => {
        const nextPlan = clonePlan(current);
        nextPlan.days[dayIndex].items.splice(itemIndex, 1);
        return nextPlan;
      });
      cancelEdit();
    });
  };

  const startAdd = (dayIndex) => {
    setEditingKey(null);
    setEditingDraft(null);
    setAddingDayIndex(dayIndex);
    setAddDraft(createEmptyItem());
  };

  const cancelAdd = () => {
    setAddingDayIndex(null);
    setAddDraft(createEmptyItem());
  };

  const saveAdd = (dayIndex) => {
    setEditablePlan((current) => {
      const nextPlan = clonePlan(current);
      nextPlan.days[dayIndex].items.push({
        ...addDraft,
        time: addDraft.time || '15:00',
        placeName: addDraft.placeName || '새 장소',
        description: addDraft.description || '새 일정 설명',
      });
      return nextPlan;
    });
    cancelAdd();
  };

  const updateEditingDraft = (key, value) => {
    setEditingDraft((current) => ({ ...current, [key]: value }));
  };

  const updateAddDraft = (key, value) => {
    setAddDraft((current) => ({ ...current, [key]: value }));
  };

  const renderEditForm = (dayIndex, itemIndex) => (
    <View style={styles.editPanel}>
      <TextInput
        testID={`edit-time-${dayIndex}-${itemIndex}`}
        style={styles.input}
        value={editingDraft.time}
        onChangeText={(value) => updateEditingDraft('time', value)}
        placeholder="시간 예: 14:30"
        placeholderTextColor="#91a59d"
      />
      <TextInput
        testID={`edit-place-${dayIndex}-${itemIndex}`}
        style={styles.input}
        value={editingDraft.placeName}
        onChangeText={(value) => updateEditingDraft('placeName', value)}
        placeholder="장소명"
        placeholderTextColor="#91a59d"
      />
      <TextInput
        testID={`edit-description-${dayIndex}-${itemIndex}`}
        style={[styles.input, styles.multilineInput]}
        value={editingDraft.description}
        onChangeText={(value) => updateEditingDraft('description', value)}
        placeholder="설명"
        placeholderTextColor="#91a59d"
        multiline
      />
      <View style={styles.editActions}>
        <Pressable testID={`save-edit-${dayIndex}-${itemIndex}`} style={styles.primarySmallButton} onPress={() => saveEdit(dayIndex, itemIndex)}>
          <Text style={styles.primarySmallButtonText}>저장</Text>
        </Pressable>
        <Pressable testID={`cancel-edit-${dayIndex}-${itemIndex}`} style={styles.secondarySmallButton} onPress={cancelEdit}>
          <Text style={styles.secondarySmallButtonText}>취소</Text>
        </Pressable>
        <Pressable testID={`delete-item-${dayIndex}-${itemIndex}`} style={styles.dangerSmallButton} onPress={() => deleteItem(dayIndex, itemIndex)}>
          <Text style={styles.dangerSmallButtonText}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderAddForm = (dayIndex) => (
    <View style={styles.addPanel}>
      <Text style={styles.addPanelTitle}>새 일정 추가</Text>
      <TextInput
        testID={`add-time-${dayIndex}`}
        style={styles.input}
        value={addDraft.time}
        onChangeText={(value) => updateAddDraft('time', value)}
        placeholder="시간 예: 20:00"
        placeholderTextColor="#91a59d"
      />
      <TextInput
        testID={`add-place-${dayIndex}`}
        style={styles.input}
        value={addDraft.placeName}
        onChangeText={(value) => updateAddDraft('placeName', value)}
        placeholder="장소명"
        placeholderTextColor="#91a59d"
      />
      <TextInput
        testID={`add-description-${dayIndex}`}
        style={[styles.input, styles.multilineInput]}
        value={addDraft.description}
        onChangeText={(value) => updateAddDraft('description', value)}
        placeholder="설명"
        placeholderTextColor="#91a59d"
        multiline
      />
      <View style={styles.editActions}>
        <Pressable testID={`save-add-${dayIndex}`} style={styles.primarySmallButton} onPress={() => saveAdd(dayIndex)}>
          <Text style={styles.primarySmallButtonText}>추가 완료</Text>
        </Pressable>
        <Pressable testID={`cancel-add-${dayIndex}`} style={styles.secondarySmallButton} onPress={cancelAdd}>
          <Text style={styles.secondarySmallButtonText}>취소</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="AI 일정 결과" subtitle="필요한 일정만 수정하고 저장하세요." onBack={onBack} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Feather name="map" size={22} color="#176b55" />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.destination}>{editablePlan.destination}</Text>
          <Text style={styles.regionMeta}>
            {[editablePlan.country, editablePlan.weatherLabel].filter(Boolean).join(' · ')}
          </Text>
          <Text style={styles.summary}>{editablePlan.summary}</Text>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>기간</Text>
          <Text style={styles.metaValue}>{editablePlan.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>여행 날짜</Text>
          <Text style={styles.metaValue}>{editablePlan.startDate} - {editablePlan.endDate}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="sliders" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>스타일</Text>
          <Text style={styles.metaValue}>{editablePlan.style || '자유 여행'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="log-in" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>입국</Text>
          <Text style={styles.metaValue}>{editablePlan.arrivalTime || '자유'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="log-out" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>출국</Text>
          <Text style={styles.metaValue}>{editablePlan.departureTime || '자유'}</Text>
        </View>
      </View>

      <View style={styles.timelineList}>
        {editablePlan.days.map((day, dayIndex) => (
          <View key={day.day} testID={`result-day-${day.day}`} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{day.day}</Text>
              </View>
              <View style={styles.dayTitleBlock}>
                <Text style={styles.dayTitle}>Day {day.day}</Text>
                <Text style={styles.daySubtitle}>{day.title}</Text>
              </View>
            </View>

            {day.items.map((item, itemIndex) => {
              const isEditing = editingKey === makeKey(dayIndex, itemIndex);

              return (
                <View key={`${day.day}-${itemIndex}`} style={styles.timelineRow}>
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <View style={styles.line} />
                  </View>
                  <View style={styles.placeIcon}>
                    <Feather name={item.icon || 'map-pin'} size={17} color="#176b55" />
                  </View>
                  <View style={styles.timelineContent}>
                    {isEditing ? (
                      renderEditForm(dayIndex, itemIndex)
                    ) : (
                      <View>
                        <View style={styles.viewHeader}>
                          <Text style={styles.placeName}>{item.placeName}</Text>
                          <Pressable
                            testID={`edit-item-${dayIndex}-${itemIndex}`}
                            style={styles.editButton}
                            onPress={() => startEdit(dayIndex, itemIndex, item)}
                          >
                            <Feather name="edit-2" size={13} color="#176b55" />
                            <Text style={styles.editButtonText}>수정</Text>
                          </Pressable>
                        </View>
                        <Text style={styles.description}>{item.description}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {addingDayIndex === dayIndex ? (
              renderAddForm(dayIndex)
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Day ${day.day} 일정 추가`}
                testID={`add-item-${dayIndex}`}
                style={styles.addButton}
                onPress={() => startAdd(dayIndex)}
              >
                <Feather name="plus" size={16} color="#176b55" />
                <Text style={styles.addButtonText}>일정 추가</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="수정된 일정 저장"
        testID="save-itinerary-button"
        style={styles.saveButton}
        onPress={() => onSave(editablePlan)}
      >
        <Feather name="save" size={19} color="#ffffff" />
        <Text style={styles.saveButtonText}>수정된 일정 저장</Text>
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
  regionMeta: {
    marginTop: 5,
    color: '#176b55',
    fontSize: 12,
    fontWeight: '800',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 6,
  },
  metaItem: {
    flexGrow: 1,
    flexBasis: '31%',
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
  dayTitleBlock: {
    flex: 1,
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
    width: 58,
    alignItems: 'center',
  },
  timeText: {
    width: 54,
    minHeight: 34,
    color: '#14231f',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
  },
  line: {
    width: 2,
    height: 48,
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
  viewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  placeName: {
    flex: 1,
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#cfe7dd',
  },
  editButtonText: {
    marginLeft: 4,
    color: '#176b55',
    fontSize: 12,
    fontWeight: '800',
  },
  editPanel: {
    gap: 8,
  },
  addPanel: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#dcebe4',
    gap: 8,
  },
  addPanelTitle: {
    color: '#14231f',
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    minHeight: 42,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcebe4',
    backgroundColor: '#ffffff',
    color: '#14231f',
    fontSize: 14,
    fontWeight: '700',
  },
  multilineInput: {
    minHeight: 64,
    paddingVertical: 8,
    color: '#61736c',
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  primarySmallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#176b55',
  },
  primarySmallButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  secondarySmallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eef6f2',
    borderWidth: 1,
    borderColor: '#d4e6de',
  },
  secondarySmallButtonText: {
    color: '#176b55',
    fontSize: 12,
    fontWeight: '800',
  },
  dangerSmallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff2f2',
    borderWidth: 1,
    borderColor: '#ffd4d4',
  },
  dangerSmallButtonText: {
    color: '#d45555',
    fontSize: 12,
    fontWeight: '800',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#cfe7dd',
  },
  addButtonText: {
    marginLeft: 6,
    color: '#176b55',
    fontSize: 14,
    fontWeight: '800',
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
