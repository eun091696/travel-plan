import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ItineraryMapView from '../components/ItineraryMapView';
import ScreenHeader from '../components/ScreenHeader';
import { buildTravelAssistantContext, getMockAssistantResponse } from '../services/aiTravelAssistantService';
import { budgetCategories, calculateBudgetSummary, formatMoney, formatNumberInput, hydrateBudget, parseMoney } from '../services/budgetService';
import { createChecklistItem, hydrateChecklist } from '../services/checklistService';
import { getAlternativePlaces, getPlaceDetail } from '../services/mockPlaceService';
import { getTodayScheduleInfo } from '../services/todayScheduleService';

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

function confirmAction({ title, message, confirmText, onConfirm }) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm(message)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: '취소', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}

function formatSavedDate(value) {
  if (!value) return '생성일 미정';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '생성일 미정';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export default function ItineraryDetailScreen({ plan, onBack, onSave, onSyncPlan, onDeletePlan }) {
  const [editablePlan, setEditablePlan] = useState(plan ? clonePlan(plan) : null);
  const [editingKey, setEditingKey] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [addingDayIndex, setAddingDayIndex] = useState(null);
  const [addDraft, setAddDraft] = useState(createEmptyItem());
  const [showMap, setShowMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [activeMorePanel, setActiveMorePanel] = useState(null);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [checklistItems, setChecklistItems] = useState([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      text: '궁금한 여행 질문을 남겨주세요. 현재 여행지와 일정 정보를 바탕으로 mock 답변을 드릴게요.',
    },
  ]);
  const [budgetState, setBudgetState] = useState({ totalBudget: 0, items: {} });
  const [completedScheduleItems, setCompletedScheduleItems] = useState({});

  useEffect(() => {
    const nextPlan = plan ? clonePlan(plan) : null;
    if (nextPlan) {
      nextPlan.checklist = hydrateChecklist(nextPlan);
    }
    setEditablePlan(nextPlan);
    setChecklistItems(nextPlan ? hydrateChecklist(nextPlan) : []);
    setBudgetState(nextPlan ? hydrateBudget(nextPlan) : { totalBudget: 0, items: {} });
    setCompletedScheduleItems(nextPlan?.completedScheduleItems || {});
    setEditingKey(null);
    setEditingDraft(null);
    setAddingDayIndex(null);
    setAddDraft(createEmptyItem());
    setShowMap(false);
    setSelectedPlace(null);
    setShowAlternatives(false);
    setActiveTab('schedule');
    setMoreMenuOpen(false);
    setActiveMorePanel(null);
    setNewChecklistText('');
    setAssistantInput('');
    setAssistantMessages([
      {
        id: 'assistant-welcome',
        role: 'assistant',
        text: '궁금한 여행 질문을 남겨주세요. 현재 여행지와 일정 정보를 바탕으로 mock 답변을 드릴게요.',
      },
    ]);
  }, [plan?.id]);

  if (!editablePlan) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="일정 상세" subtitle="선택한 저장 일정이 없습니다." onBack={onBack} />
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
    confirmAction({
      title: '일정 삭제',
      message: '이 일정 항목을 삭제할까요?',
      confirmText: '삭제',
      onConfirm: () => {
        setEditablePlan((current) => {
          const nextPlan = clonePlan(current);
          nextPlan.days[dayIndex].items.splice(itemIndex, 1);
          return nextPlan;
        });
        cancelEdit();
      },
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

  const deleteWholePlan = () => {
    confirmAction({
      title: '전체 일정 삭제',
      message: '저장된 여행 일정을 전체 삭제할까요?',
      confirmText: '전체 삭제',
      onConfirm: () => onDeletePlan(editablePlan.id),
    });
  };

  const syncChecklist = (nextChecklist) => {
    const nextPlan = {
      ...clonePlan(editablePlan),
      checklist: nextChecklist,
    };
    setChecklistItems(nextChecklist);
    setEditablePlan(nextPlan);
    if (onSyncPlan) {
      onSyncPlan(nextPlan);
    }
  };

  const toggleChecklistItem = (itemId) => {
    const nextChecklist = checklistItems.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    syncChecklist(nextChecklist);
  };

  const addChecklistItem = () => {
    const webInputValue =
      Platform.OS === 'web' && typeof document !== 'undefined'
        ? document.querySelector('[data-testid="checklist-input"]')?.value
        : '';
    const label = (webInputValue || newChecklistText).trim();
    if (!label) return;

    syncChecklist([...checklistItems, createChecklistItem(label)]);
    setNewChecklistText('');
  };

  const syncBudget = (nextBudgetState) => {
    const nextPlan = {
      ...clonePlan(editablePlan),
      totalBudget: nextBudgetState.totalBudget,
      budgetItems: nextBudgetState.items,
    };
    setBudgetState(nextBudgetState);
    setEditablePlan(nextPlan);
    if (onSyncPlan) {
      onSyncPlan(nextPlan);
    }
  };

  const updateBudgetItem = (categoryKey, value) => {
    const nextBudgetState = {
      ...budgetState,
      items: {
        ...budgetState.items,
        [categoryKey]: value,
      },
    };
    syncBudget(nextBudgetState);
  };

  const updateTotalBudget = (value) => {
    syncBudget({
      ...budgetState,
      totalBudget: parseMoney(value),
    });
  };

  const toggleTodayScheduleItem = (itemId) => {
    const nextCompleted = {
      ...completedScheduleItems,
      [itemId]: !completedScheduleItems[itemId],
    };
    const nextPlan = {
      ...clonePlan(editablePlan),
      completedScheduleItems: nextCompleted,
    };
    setCompletedScheduleItems(nextCompleted);
    setEditablePlan(nextPlan);
    if (onSyncPlan) {
      onSyncPlan(nextPlan);
    }
  };

  const openPlaceDetail = (dayIndex, itemIndex, item) => {
    setSelectedPlace({
      dayIndex,
      itemIndex,
      item,
      detail: getPlaceDetail(editablePlan, item),
    });
    setShowAlternatives(false);
  };

  const closePlaceDetail = () => {
    setSelectedPlace(null);
    setShowAlternatives(false);
  };

  const selectAlternativePlace = (place) => {
    if (!selectedPlace) return;

    setEditablePlan((current) => {
      const nextPlan = clonePlan(current);
      const item = nextPlan.days[selectedPlace.dayIndex].items[selectedPlace.itemIndex];
      nextPlan.days[selectedPlace.dayIndex].items[selectedPlace.itemIndex] = {
        ...item,
        placeName: place.name,
        description: place.description,
        icon: place.icon || item.icon,
      };
      return nextPlan;
    });

    setSelectedPlace((current) => ({
      ...current,
      item: {
        ...current.item,
        placeName: place.name,
        description: place.description,
        icon: place.icon || current.item.icon,
      },
      detail: place,
    }));
    setShowAlternatives(false);
  };

  const renderPlaceModal = () => {
    if (!selectedPlace) return null;

    const alternatives = getAlternativePlaces(editablePlan, selectedPlace.item);

    return (
      <Modal visible transparent animationType="fade" onRequestClose={closePlaceDetail}>
        <View style={styles.modalOverlay}>
          <View testID="place-detail-modal" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>{selectedPlace.detail.category}</Text>
                <Text style={styles.modalTitle}>{selectedPlace.detail.name}</Text>
              </View>
              <Pressable testID="close-place-modal" style={styles.modalCloseButton} onPress={closePlaceDetail}>
                <Feather name="x" size={20} color="#61736c" />
              </Pressable>
            </View>

            <View style={styles.placeInfoGrid}>
              <View style={styles.placeInfoItem}>
                <Text style={styles.placeInfoLabel}>예상 소요시간</Text>
                <Text style={styles.placeInfoValue}>{selectedPlace.detail.duration}</Text>
              </View>
              <View style={styles.placeInfoItem}>
                <Text style={styles.placeInfoLabel}>카테고리</Text>
                <Text style={styles.placeInfoValue}>{selectedPlace.detail.category}</Text>
              </View>
            </View>

            <Text style={styles.modalSectionTitle}>설명</Text>
            <Text style={styles.modalText}>{selectedPlace.detail.description}</Text>

            <Text style={styles.modalSectionTitle}>추천 이유</Text>
            <Text style={styles.modalText}>{selectedPlace.detail.reason}</Text>

            <Pressable
              testID="show-alternative-places-button"
              style={[styles.alternativeButton, alternatives.length === 0 && styles.disabledAlternativeButton]}
              onPress={() => alternatives.length > 0 && setShowAlternatives((current) => !current)}
            >
              <Feather name="shuffle" size={16} color={alternatives.length === 0 ? '#91a59d' : '#176b55'} />
              <Text style={[styles.alternativeButtonText, alternatives.length === 0 && styles.disabledAlternativeButtonText]}>
                다른 장소 추천
              </Text>
            </Pressable>

            {showAlternatives ? (
              <View style={styles.alternativeList}>
                {alternatives.map((place, index) => (
                  <Pressable
                    key={`${place.name}-${index}`}
                    testID={`alternative-place-${index}`}
                    style={styles.alternativeCard}
                    onPress={() => selectAlternativePlace(place)}
                  >
                    <View style={styles.alternativeIcon}>
                      <Feather name={place.icon || 'map-pin'} size={16} color="#176b55" />
                    </View>
                    <View style={styles.alternativeCopy}>
                      <Text style={styles.alternativeName}>{place.name}</Text>
                      <Text style={styles.alternativeDescription}>{place.description}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    );
  };

  const renderChecklist = () => {
    const checklist = checklistItems;
    const checkedCount = checklist.filter((item) => item.checked).length;

    return (
      <View testID="checklist-tab-panel" style={styles.checklistPanel}>
        <View style={styles.checklistSummary}>
          <View>
            <Text style={styles.checklistTitle}>여행 체크리스트</Text>
            <Text style={styles.checklistSubtitle}>{checkedCount}/{checklist.length}개 완료</Text>
          </View>
          <Feather name="check-square" size={22} color="#176b55" />
        </View>

        <View style={styles.checklistAddRow}>
          <TextInput
            testID="checklist-input"
            style={styles.checklistInput}
            value={newChecklistText}
            onChangeText={setNewChecklistText}
            onChange={(event) => setNewChecklistText(event.nativeEvent?.text || event.target?.value || '')}
            onSubmitEditing={addChecklistItem}
            placeholder="준비물 추가"
            placeholderTextColor="#91a59d"
          />
          <Pressable
            testID="add-checklist-item-button"
            accessibilityRole="button"
            style={styles.checklistAddButton}
            onPress={addChecklistItem}
          >
            <Feather name="plus" size={18} color="#ffffff" />
            <Text style={styles.checklistAddButtonText}>추가</Text>
          </Pressable>
        </View>

        <View style={styles.checklistItems}>
          {checklist.map((item, index) => (
            <Pressable
              key={item.id}
              testID={`checklist-row-${index}`}
              style={styles.checklistItem}
              onPress={() => toggleChecklistItem(item.id)}
            >
              <View style={[styles.checkbox, item.checked && styles.checkedBox]}>
                {item.checked ? <Feather name="check" size={14} color="#ffffff" /> : null}
              </View>
              <Text testID={`checklist-label-${index}`} style={[styles.checklistLabel, item.checked && styles.checkedChecklistLabel]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const sendAssistantQuestion = async (questionOverride) => {
    const question = (questionOverride || assistantInput).trim();
    if (!question) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
    };
    const context = buildTravelAssistantContext(editablePlan);
    const answer = await getMockAssistantResponse({ question, context });
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: answer,
    };

    setAssistantMessages((current) => [...current, userMessage, assistantMessage]);
    setAssistantInput('');
  };

  const renderAssistant = () => {
    const suggestions = ['근처 맛집 추천', '비 오는 날 일정 변경', '야경 명소 추천', '커플 데이트 코스 추천'];

    return (
      <View testID="assistant-tab-panel" style={styles.assistantPanel}>
        <View style={styles.assistantContextCard}>
          <Text style={styles.assistantContextTitle}>AI 컨텍스트</Text>
          <Text style={styles.assistantContextText}>
            {editablePlan.destination} · {editablePlan.duration} · {editablePlan.style || '자유 여행'}
          </Text>
        </View>

        <View style={styles.suggestionList}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              testID={`assistant-suggestion-${suggestion}`}
              style={styles.suggestionChip}
              onPress={() => sendAssistantQuestion(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.chatList}>
          {assistantMessages.map((message) => (
            <View
              key={message.id}
              style={[styles.chatBubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}
            >
              <Text style={[styles.chatText, message.role === 'user' && styles.userChatText]}>{message.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chatInputRow}>
          <TextInput
            testID="assistant-chat-input"
            style={styles.chatInput}
            value={assistantInput}
            onChangeText={setAssistantInput}
            placeholder="질문을 입력하세요"
            placeholderTextColor="#91a59d"
            onSubmitEditing={() => sendAssistantQuestion()}
          />
          <Pressable testID="assistant-send-button" style={styles.chatSendButton} onPress={() => sendAssistantQuestion()}>
            <Feather name="send" size={17} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderBudget = () => {
    const summary = calculateBudgetSummary(budgetState.totalBudget, budgetState.items);
    const progressPercent = `${Math.round(summary.usageRate * 100)}%`;

    return (
      <View testID="budget-tab-panel" style={styles.budgetPanel}>
        <View style={styles.budgetHeroCard}>
          <View style={styles.budgetHeroHeader}>
            <View>
              <Text style={styles.budgetTitle}>여행 예산</Text>
              <Text style={styles.budgetSubtitle}>총 예산과 카테고리별 사용 금액을 관리하세요</Text>
            </View>
            <Feather name="pie-chart" size={22} color="#176b55" />
          </View>

          <View style={styles.totalBudgetInputBox}>
            <Text style={styles.budgetInputLabel}>총 예산</Text>
            <TextInput
              testID="total-budget-input"
              style={styles.totalBudgetInput}
              value={formatNumberInput(budgetState.totalBudget)}
              onChangeText={updateTotalBudget}
              placeholder="예: 1,500,000"
              placeholderTextColor="#91a59d"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, summary.isOverBudget && styles.overBudgetFill, { width: progressPercent }]} />
          </View>
          <Text style={styles.progressLabel}>사용률 {Math.round(summary.usageRate * 100)}%</Text>

          {summary.isOverBudget ? (
            <View testID="budget-warning" style={styles.budgetWarning}>
              <Feather name="alert-triangle" size={16} color="#d45555" />
              <Text style={styles.budgetWarningText}>예산을 초과했습니다</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.budgetSummaryGrid}>
          <View style={styles.budgetSummaryCard}>
            <Text style={styles.budgetSummaryLabel}>총 사용 금액</Text>
            <Text testID="total-spent-value" style={styles.budgetSummaryValue}>{formatMoney(summary.totalSpent)}</Text>
          </View>
          <View style={styles.budgetSummaryCard}>
            <Text style={styles.budgetSummaryLabel}>남은 예산</Text>
            <Text style={[styles.budgetSummaryValue, summary.remaining < 0 && styles.negativeBudgetValue]}>
              {summary.remaining < 0 ? `-${formatMoney(Math.abs(summary.remaining))}` : formatMoney(summary.remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.budgetCategoryList}>
          {budgetCategories.map((category) => (
            <View key={category.key} style={styles.budgetCategoryCard}>
              <View style={styles.budgetCategoryIcon}>
                <Feather name={category.icon} size={17} color="#176b55" />
              </View>
              <View style={styles.budgetCategoryCopy}>
                <Text style={styles.budgetCategoryLabel}>{category.label}</Text>
                <Text style={styles.budgetCategoryMeta}>사용 금액</Text>
              </View>
              <TextInput
                testID={`budget-input-${category.key}`}
                style={styles.budgetCategoryInput}
                value={formatNumberInput(budgetState.items?.[category.key])}
                onChangeText={(value) => updateBudgetItem(category.key, parseMoney(value))}
                placeholder="0"
                placeholderTextColor="#91a59d"
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTodayItemCard = (item, label, highlighted = false) => (
    <Pressable
      key={`${label}-${item.id}`}
      testID={`today-item-${item.id}`}
      style={[styles.todayItemCard, highlighted && styles.highlightTodayItem, item.completed && styles.completedTodayItem]}
      onPress={() => toggleTodayScheduleItem(item.id)}
    >
      <View style={[styles.todayCheckBox, item.completed && styles.todayCheckedBox]}>
        {item.completed ? <Feather name="check" size={14} color="#ffffff" /> : null}
      </View>
      <View style={styles.todayItemCopy}>
        <Text style={styles.todayItemLabel}>{label}</Text>
        <Text style={[styles.todayPlaceName, item.completed && styles.completedText]}>{item.time} · {item.placeName}</Text>
        <Text style={[styles.todayDescription, item.completed && styles.completedText]}>{item.description}</Text>
      </View>
    </Pressable>
  );

  const renderTodaySchedule = () => {
    const todayInfo = getTodayScheduleInfo(editablePlan, completedScheduleItems);

    if (todayInfo.status === 'before') {
      return (
        <View testID="today-schedule-panel" style={styles.todayPanel}>
          <View style={styles.todayEmptyCard}>
            <Feather name="clock" size={24} color="#176b55" />
            <Text style={styles.todayEmptyTitle}>아직 여행 전입니다</Text>
          </View>
        </View>
      );
    }

    if (todayInfo.status === 'after') {
      return (
        <View testID="today-schedule-panel" style={styles.todayPanel}>
          <View style={styles.todayEmptyCard}>
            <Feather name="check-circle" size={24} color="#176b55" />
            <Text style={styles.todayEmptyTitle}>여행이 종료되었습니다</Text>
          </View>
        </View>
      );
    }

    return (
      <View testID="today-schedule-panel" style={styles.todayPanel}>
        <View style={styles.todayHeroCard}>
          <View>
            <Text style={styles.todayTitle}>오늘 일정</Text>
            <Text style={styles.todaySubtitle}>Day {todayInfo.day?.day || 1} · 다음 일정까지 {todayInfo.nextTimeLabel}</Text>
          </View>
          <Feather name="sun" size={22} color="#176b55" />
        </View>

        {todayInfo.currentItem ? renderTodayItemCard(todayInfo.currentItem, '현재 진행 중', true) : (
          <View style={styles.todayInfoCard}>
            <Text style={styles.todayInfoText}>현재 진행 중인 일정이 없습니다</Text>
          </View>
        )}

        {todayInfo.nextItem ? renderTodayItemCard(todayInfo.nextItem, '다음 일정', true) : (
          <View style={styles.todayInfoCard}>
            <Text style={styles.todayInfoText}>다음 일정이 없습니다</Text>
          </View>
        )}

        <View style={styles.remainingSection}>
          <Text style={styles.remainingTitle}>남은 일정</Text>
          {todayInfo.remainingItems.length === 0 ? (
            <Text style={styles.remainingEmpty}>남은 일정이 없습니다</Text>
          ) : (
            todayInfo.remainingItems.map((item) => renderTodayItemCard(item, '남은 일정'))
          )}
        </View>
      </View>
    );
  };

  const openMorePanel = (panel) => {
    setMoreMenuOpen(false);
    setActiveMorePanel(panel);
  };

  const closeMorePanel = () => {
    setActiveMorePanel(null);
  };

  const renderMoreMenu = () => {
    if (!moreMenuOpen) return null;

    const menuItems = [
      { key: 'checklist', label: '체크리스트', icon: 'check-square', testID: 'more-menu-checklist' },
      { key: 'budget', label: '예산', icon: 'credit-card', testID: 'more-menu-budget' },
      { key: 'assistant', label: 'AI 여행 도우미', icon: 'message-circle', testID: 'more-menu-assistant' },
    ];

    return (
      <View testID="more-menu-popover" style={styles.moreMenu}>
        {menuItems.map((item) => (
          <Pressable key={item.key} testID={item.testID} style={styles.moreMenuItem} onPress={() => openMorePanel(item.key)}>
            <Feather name={item.icon} size={17} color="#176b55" />
            <Text style={styles.moreMenuText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderMorePanel = () => {
    if (!activeMorePanel) return null;

    const titles = {
      checklist: '체크리스트',
      budget: '예산',
      assistant: 'AI 여행 도우미',
    };

    return (
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={closeMorePanel} />
        <View testID="more-panel-sheet" style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{titles[activeMorePanel]}</Text>
            <Pressable testID="close-more-panel" style={styles.sheetCloseButton} onPress={closeMorePanel}>
              <Feather name="x" size={20} color="#61736c" />
            </Pressable>
          </View>
          <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
            {activeMorePanel === 'checklist' ? renderChecklist() : null}
            {activeMorePanel === 'budget' ? renderBudget() : null}
            {activeMorePanel === 'assistant' ? renderAssistant() : null}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderEditForm = (dayIndex, itemIndex) => (
    <View style={styles.editPanel}>
      <TextInput
        testID={`detail-edit-time-${dayIndex}-${itemIndex}`}
        style={styles.input}
        value={editingDraft.time}
        onChangeText={(value) => updateEditingDraft('time', value)}
        placeholder="시간 예: 14:30"
        placeholderTextColor="#91a59d"
      />
      <TextInput
        testID={`detail-edit-place-${dayIndex}-${itemIndex}`}
        style={styles.input}
        value={editingDraft.placeName}
        onChangeText={(value) => updateEditingDraft('placeName', value)}
        placeholder="장소명"
        placeholderTextColor="#91a59d"
      />
      <TextInput
        testID={`detail-edit-description-${dayIndex}-${itemIndex}`}
        style={[styles.input, styles.multilineInput]}
        value={editingDraft.description}
        onChangeText={(value) => updateEditingDraft('description', value)}
        placeholder="설명"
        placeholderTextColor="#91a59d"
        multiline
      />
      <View style={styles.editActions}>
        <Pressable testID={`detail-save-edit-${dayIndex}-${itemIndex}`} style={styles.primarySmallButton} onPress={() => saveEdit(dayIndex, itemIndex)}>
          <Text style={styles.primarySmallButtonText}>저장</Text>
        </Pressable>
        <Pressable testID={`detail-cancel-edit-${dayIndex}-${itemIndex}`} style={styles.secondarySmallButton} onPress={cancelEdit}>
          <Text style={styles.secondarySmallButtonText}>취소</Text>
        </Pressable>
        <Pressable testID={`detail-delete-item-${dayIndex}-${itemIndex}`} style={styles.dangerSmallButton} onPress={() => deleteItem(dayIndex, itemIndex)}>
          <Text style={styles.dangerSmallButtonText}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderAddForm = (dayIndex) => (
    <View style={styles.addPanel}>
      <Text style={styles.addPanelTitle}>새 일정 추가</Text>
      <TextInput
        testID={`detail-add-time-${dayIndex}`}
        style={styles.input}
        value={addDraft.time}
        onChangeText={(value) => updateAddDraft('time', value)}
        placeholder="시간 예: 20:00"
        placeholderTextColor="#91a59d"
      />
      <TextInput
        testID={`detail-add-place-${dayIndex}`}
        style={styles.input}
        value={addDraft.placeName}
        onChangeText={(value) => updateAddDraft('placeName', value)}
        placeholder="장소명"
        placeholderTextColor="#91a59d"
      />
      <TextInput
        testID={`detail-add-description-${dayIndex}`}
        style={[styles.input, styles.multilineInput]}
        value={addDraft.description}
        onChangeText={(value) => updateAddDraft('description', value)}
        placeholder="설명"
        placeholderTextColor="#91a59d"
        multiline
      />
      <View style={styles.editActions}>
        <Pressable testID={`detail-save-add-${dayIndex}`} style={styles.primarySmallButton} onPress={() => saveAdd(dayIndex)}>
          <Text style={styles.primarySmallButtonText}>추가 완료</Text>
        </Pressable>
        <Pressable testID={`detail-cancel-add-${dayIndex}`} style={styles.secondarySmallButton} onPress={cancelAdd}>
          <Text style={styles.secondarySmallButtonText}>취소</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="일정 상세" subtitle="저장된 여행 일정을 수정하고 관리하세요." onBack={onBack} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Feather name="map" size={22} color="#176b55" />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.destination}>{editablePlan.destination}</Text>
          <Text style={styles.summary}>{editablePlan.summary}</Text>
          <Text style={styles.savedDate}>생성일 {formatSavedDate(editablePlan.savedAt)}</Text>
        </View>
        <Pressable
          testID="more-menu-button"
          accessibilityRole="button"
          accessibilityLabel="더보기"
          style={styles.moreButton}
          onPress={() => setMoreMenuOpen((current) => !current)}
        >
          <Text style={styles.moreButtonText}>⋮</Text>
        </Pressable>
      </View>
      {renderMoreMenu()}

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>기간</Text>
          <Text style={styles.metaValue}>{editablePlan.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="users" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>동행</Text>
          <Text style={styles.metaValue}>{editablePlan.companions || '미정'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="sliders" size={16} color="#176b55" />
          <Text style={styles.metaLabel}>스타일</Text>
          <Text style={styles.metaValue}>{editablePlan.style || '자유 여행'}</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <Pressable
          testID="detail-tab-schedule"
          style={[styles.tabButton, activeTab === 'schedule' && styles.activeTabButton]}
          onPress={() => setActiveTab('schedule')}
        >
          <Feather name="calendar" size={15} color={activeTab === 'schedule' ? '#ffffff' : '#176b55'} />
          <Text style={[styles.tabButtonText, activeTab === 'schedule' && styles.activeTabButtonText]}>일정</Text>
        </Pressable>
        <Pressable
          testID="detail-tab-today"
          style={[styles.tabButton, activeTab === 'today' && styles.activeTabButton]}
          onPress={() => setActiveTab('today')}
        >
          <Feather name="sun" size={15} color={activeTab === 'today' ? '#ffffff' : '#176b55'} />
          <Text style={[styles.tabButtonText, activeTab === 'today' && styles.activeTabButtonText]}>오늘 일정</Text>
        </Pressable>
        <Pressable
          testID="detail-tab-map"
          style={[styles.tabButton, activeTab === 'map' && styles.activeTabButton]}
          onPress={() => setActiveTab('map')}
        >
          <Feather name="map" size={15} color={activeTab === 'map' ? '#ffffff' : '#176b55'} />
          <Text style={[styles.tabButtonText, activeTab === 'map' && styles.activeTabButtonText]}>지도</Text>
        </Pressable>
      </View>
      {activeTab === 'schedule' ? (
        <>
      <View style={styles.timelineList}>
        {editablePlan.days.map((day, dayIndex) => (
          <View key={day.day} testID={`detail-day-${day.day}`} style={styles.dayCard}>
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
                          <Pressable
                            testID={`place-detail-trigger-${dayIndex}-${itemIndex}`}
                            style={styles.placeDetailButton}
                            onPress={() => openPlaceDetail(dayIndex, itemIndex, item)}
                          >
                            <Text testID={`detail-item-place-${dayIndex}-${itemIndex}`} style={styles.placeName}>
                              {item.placeName}
                            </Text>
                            <Text style={styles.placeDetailHint}>장소 상세 보기</Text>
                          </Pressable>
                          <Pressable
                            testID={`detail-edit-item-${dayIndex}-${itemIndex}`}
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
              <Pressable testID={`detail-add-item-${dayIndex}`} style={styles.addButton} onPress={() => startAdd(dayIndex)}>
                <Feather name="plus" size={16} color="#176b55" />
                <Text style={styles.addButtonText}>일정 추가</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
        </>
      ) : activeTab === 'today' ? (
        renderTodaySchedule()
      ) : activeTab === 'map' ? (
        <ItineraryMapView plan={editablePlan} />
      ) : (
        <ItineraryMapView plan={editablePlan} />
      )}

      <View style={styles.bottomActions}>
        <Pressable testID="detail-save-itinerary-button" style={styles.saveButton} onPress={() => onSave(editablePlan)}>
          <Feather name="save" size={19} color="#ffffff" />
          <Text style={styles.saveButtonText}>변경사항 저장</Text>
        </Pressable>
        <Pressable testID="delete-plan-button" style={styles.deletePlanButton} onPress={deleteWholePlan}>
          <Feather name="trash-2" size={18} color="#d45555" />
          <Text style={styles.deletePlanButtonText}>일정 전체 삭제</Text>
        </Pressable>
      </View>
      </ScrollView>
      {renderPlaceModal()}
      {renderMorePanel()}
    </View>
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
  savedDate: {
    marginTop: 8,
    color: '#176b55',
    fontSize: 12,
    fontWeight: '800',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#f0f8f4',
    borderWidth: 1,
    borderColor: '#d7ebe2',
  },
  moreButtonText: {
    color: '#176b55',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 25,
  },
  moreMenu: {
    marginHorizontal: 20,
    marginTop: -4,
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
    shadowColor: '#245747',
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  moreMenuItem: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  moreMenuText: {
    marginLeft: 10,
    color: '#14231f',
    fontSize: 15,
    fontWeight: '900',
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20, 35, 31, 0.28)',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  bottomSheet: {
    zIndex: 2,
    width: '100%',
    maxHeight: '86%',
    paddingTop: 10,
    paddingBottom: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f4fbf8',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    marginBottom: 10,
    backgroundColor: '#c7dbd2',
  },
  sheetHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sheetTitle: {
    color: '#14231f',
    fontSize: 20,
    fontWeight: '900',
  },
  sheetCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  sheetContent: {
    paddingBottom: 18,
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#176b55',
  },
  tabButtonText: {
    marginLeft: 6,
    color: '#176b55',
    fontSize: 14,
    fontWeight: '900',
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 24,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#cfe7dd',
  },
  activeMapButton: {
    backgroundColor: '#176b55',
    borderColor: '#176b55',
  },
  mapButtonText: {
    marginLeft: 7,
    color: '#176b55',
    fontSize: 15,
    fontWeight: '900',
  },
  activeMapButtonText: {
    color: '#ffffff',
  },
  checklistPanel: {
    marginHorizontal: 20,
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
  checklistSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  checklistTitle: {
    color: '#14231f',
    fontSize: 18,
    fontWeight: '900',
  },
  checklistSubtitle: {
    marginTop: 4,
    color: '#61736c',
    fontSize: 13,
    fontWeight: '800',
  },
  checklistAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  checklistInput: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcebe4',
    backgroundColor: '#f7fbf9',
    color: '#14231f',
    fontSize: 14,
    fontWeight: '700',
  },
  checklistAddButton: {
    flexDirection: 'row',
    minWidth: 74,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#176b55',
  },
  checklistAddButtonText: {
    marginLeft: 5,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  checklistItems: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e4eee9',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#b8d4c9',
    backgroundColor: '#ffffff',
  },
  checkedBox: {
    backgroundColor: '#176b55',
    borderColor: '#176b55',
  },
  checklistLabel: {
    flex: 1,
    color: '#14231f',
    fontSize: 15,
    fontWeight: '800',
  },
  checkedChecklistLabel: {
    color: '#8aa099',
    textDecorationLine: 'line-through',
  },
  budgetPanel: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  budgetHeroCard: {
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
  budgetHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  budgetTitle: {
    color: '#14231f',
    fontSize: 18,
    fontWeight: '900',
  },
  budgetSubtitle: {
    marginTop: 4,
    color: '#61736c',
    fontSize: 12,
    fontWeight: '700',
  },
  totalBudgetInputBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e4eee9',
  },
  budgetInputLabel: {
    color: '#61736c',
    fontSize: 12,
    fontWeight: '900',
  },
  totalBudgetInput: {
    marginTop: 6,
    color: '#14231f',
    fontSize: 20,
    fontWeight: '900',
  },
  progressTrack: {
    height: 12,
    marginTop: 14,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#e4eee9',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#176b55',
  },
  overBudgetFill: {
    backgroundColor: '#d45555',
  },
  progressLabel: {
    marginTop: 7,
    color: '#61736c',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  budgetWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff2f2',
    borderWidth: 1,
    borderColor: '#ffd4d4',
  },
  budgetWarningText: {
    marginLeft: 7,
    color: '#d45555',
    fontSize: 13,
    fontWeight: '900',
  },
  budgetSummaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  budgetSummaryCard: {
    flex: 1,
    minHeight: 74,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#d1e9df',
  },
  budgetSummaryLabel: {
    color: '#61736c',
    fontSize: 11,
    fontWeight: '900',
  },
  budgetSummaryValue: {
    marginTop: 8,
    color: '#14231f',
    fontSize: 16,
    fontWeight: '900',
  },
  negativeBudgetValue: {
    color: '#d45555',
  },
  budgetCategoryList: {
    gap: 8,
    marginTop: 10,
  },
  budgetCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 66,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  budgetCategoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#e8f6f0',
  },
  budgetCategoryCopy: {
    flex: 1,
  },
  budgetCategoryLabel: {
    color: '#14231f',
    fontSize: 14,
    fontWeight: '900',
  },
  budgetCategoryMeta: {
    marginTop: 3,
    color: '#7a8c85',
    fontSize: 11,
    fontWeight: '800',
  },
  budgetCategoryInput: {
    width: 108,
    minHeight: 42,
    paddingHorizontal: 10,
    borderRadius: 8,
    textAlign: 'right',
    color: '#14231f',
    fontSize: 14,
    fontWeight: '900',
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#dcebe4',
  },
  todayPanel: {
    marginHorizontal: 20,
    marginTop: 12,
    gap: 10,
  },
  todayHeroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  todayTitle: {
    color: '#14231f',
    fontSize: 18,
    fontWeight: '900',
  },
  todaySubtitle: {
    marginTop: 5,
    color: '#61736c',
    fontSize: 13,
    fontWeight: '800',
  },
  todayItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  highlightTodayItem: {
    borderColor: '#cfe7dd',
    backgroundColor: '#f7fbf9',
  },
  completedTodayItem: {
    opacity: 0.46,
  },
  todayCheckBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    borderWidth: 2,
    borderColor: '#b8d4c9',
    backgroundColor: '#ffffff',
  },
  todayCheckedBox: {
    backgroundColor: '#176b55',
    borderColor: '#176b55',
  },
  todayItemCopy: {
    flex: 1,
  },
  todayItemLabel: {
    color: '#176b55',
    fontSize: 11,
    fontWeight: '900',
  },
  todayPlaceName: {
    marginTop: 4,
    color: '#14231f',
    fontSize: 15,
    fontWeight: '900',
  },
  todayDescription: {
    marginTop: 4,
    color: '#61736c',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  todayInfoCard: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e4eee9',
  },
  todayInfoText: {
    color: '#61736c',
    fontSize: 13,
    fontWeight: '800',
  },
  remainingSection: {
    gap: 8,
    marginTop: 2,
  },
  remainingTitle: {
    color: '#14231f',
    fontSize: 16,
    fontWeight: '900',
  },
  remainingEmpty: {
    color: '#61736c',
    fontSize: 13,
    fontWeight: '800',
  },
  todayEmptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  todayEmptyTitle: {
    marginTop: 10,
    color: '#14231f',
    fontSize: 18,
    fontWeight: '900',
  },
  assistantPanel: {
    marginHorizontal: 20,
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
  assistantContextCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#d1e9df',
  },
  assistantContextTitle: {
    color: '#176b55',
    fontSize: 12,
    fontWeight: '900',
  },
  assistantContextText: {
    marginTop: 5,
    color: '#14231f',
    fontSize: 13,
    fontWeight: '800',
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#d4e6de',
  },
  suggestionText: {
    color: '#176b55',
    fontSize: 12,
    fontWeight: '900',
  },
  chatList: {
    gap: 10,
    marginTop: 14,
  },
  chatBubble: {
    maxWidth: '88%',
    padding: 12,
    borderRadius: 8,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f7f4',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#176b55',
  },
  chatText: {
    color: '#40544d',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  userChatText: {
    color: '#ffffff',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  chatInput: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#dcebe4',
    backgroundColor: '#f7fbf9',
    color: '#14231f',
    fontSize: 14,
    fontWeight: '700',
  },
  chatSendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#176b55',
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
  placeDetailButton: {
    flex: 1,
    paddingRight: 4,
  },
  placeName: {
    flex: 1,
    color: '#14231f',
    fontSize: 15,
    fontWeight: '800',
  },
  placeDetailHint: {
    marginTop: 3,
    color: '#176b55',
    fontSize: 11,
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
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 10,
  },
  saveButton: {
    flexDirection: 'row',
    height: 56,
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
  deletePlanButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff2f2',
    borderWidth: 1,
    borderColor: '#ffd4d4',
  },
  deletePlanButtonText: {
    marginLeft: 7,
    color: '#d45555',
    fontSize: 15,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(20, 35, 31, 0.42)',
  },
  modalCard: {
    maxHeight: '86%',
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalEyebrow: {
    color: '#176b55',
    fontSize: 12,
    fontWeight: '900',
  },
  modalTitle: {
    marginTop: 4,
    color: '#14231f',
    fontSize: 22,
    fontWeight: '900',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f7f4',
  },
  placeInfoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  placeInfoItem: {
    flex: 1,
    padding: 11,
    borderRadius: 8,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#d1e9df',
  },
  placeInfoLabel: {
    color: '#6f827a',
    fontSize: 11,
    fontWeight: '800',
  },
  placeInfoValue: {
    marginTop: 5,
    color: '#14231f',
    fontSize: 13,
    fontWeight: '900',
  },
  modalSectionTitle: {
    marginTop: 16,
    color: '#14231f',
    fontSize: 14,
    fontWeight: '900',
  },
  modalText: {
    marginTop: 6,
    color: '#61736c',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    marginTop: 18,
    borderRadius: 23,
    backgroundColor: '#e8f6f0',
    borderWidth: 1,
    borderColor: '#cfe7dd',
  },
  disabledAlternativeButton: {
    backgroundColor: '#f3f6f5',
    borderColor: '#e0ebe6',
  },
  alternativeButtonText: {
    marginLeft: 7,
    color: '#176b55',
    fontSize: 14,
    fontWeight: '900',
  },
  disabledAlternativeButtonText: {
    color: '#91a59d',
  },
  alternativeList: {
    marginTop: 12,
    gap: 8,
  },
  alternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 8,
    backgroundColor: '#f7fbf9',
    borderWidth: 1,
    borderColor: '#e4eee9',
  },
  alternativeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#e8f6f0',
  },
  alternativeCopy: {
    flex: 1,
  },
  alternativeName: {
    color: '#14231f',
    fontSize: 14,
    fontWeight: '900',
  },
  alternativeDescription: {
    marginTop: 4,
    color: '#61736c',
    fontSize: 12,
    lineHeight: 17,
  },
});

