import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_MINUTES = 30;
const MINUTE_MS = 60 * 1000;

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function isNotificationSupported() {
  return Platform.OS !== 'web';
}

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function parseTime(value) {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

function getTripDateForDay(plan, dayIndex) {
  const startDate = parseDate(plan.startDate);
  if (!startDate) return null;
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + dayIndex);
  return date;
}

export function getScheduleNotificationDate(plan, dayIndex, item) {
  const date = getTripDateForDay(plan, dayIndex);
  const time = parseTime(item?.time);
  if (!date || !time) return null;

  date.setHours(time.hour, time.minute, 0, 0);
  return new Date(date.getTime() - REMINDER_MINUTES * MINUTE_MS);
}

export function getScheduleItemKey(day, itemIndex) {
  return `${day?.day}-${itemIndex}`;
}

export async function requestNotificationPermissions() {
  if (!isNotificationSupported()) {
    return { granted: false, reason: 'web' };
  }

  const current = await Notifications.getPermissionsAsync();
  const finalStatus = current.granted ? current : await Notifications.requestPermissionsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('travel-plan-itinerary', {
      name: 'Travel Plan 일정 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return { granted: finalStatus.granted, reason: finalStatus.granted ? null : 'denied' };
}

export async function cancelScheduleNotification(notificationId) {
  if (!isNotificationSupported() || !notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('Failed to cancel schedule notification.', error);
  }
}

export async function scheduleItineraryItemNotification({ plan, dayIndex, itemIndex, item, previousNotificationId }) {
  if (previousNotificationId) {
    await cancelScheduleNotification(previousNotificationId);
  }

  if (!isNotificationSupported()) {
    return { scheduled: false, notificationId: null, reason: 'web' };
  }

  const triggerDate = getScheduleNotificationDate(plan, dayIndex, item);
  if (!triggerDate || triggerDate <= new Date()) {
    return { scheduled: false, notificationId: null, reason: 'past' };
  }

  const day = plan.days?.[dayIndex];
  const itemId = getScheduleItemKey(day, itemIndex);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '다음 여행 일정 30분 전',
      body: `${item.time} · ${item.placeName}`,
      data: {
        planId: plan.id,
        itemId,
        destination: plan.destination,
      },
    },
    trigger: triggerDate,
  });

  return {
    scheduled: true,
    notificationId,
    scheduledAt: triggerDate.toISOString(),
    reason: null,
  };
}

export async function cancelAllPlanNotifications(plan) {
  const settings = plan?.notificationSettings || {};
  await Promise.all(Object.values(settings).map((setting) => cancelScheduleNotification(setting.notificationId)));
}

export async function rescheduleEnabledNotifications(plan) {
  const settings = plan?.notificationSettings || {};
  const nextSettings = {};

  for (const [itemId, setting] of Object.entries(settings)) {
    if (setting.notificationId) {
      await cancelScheduleNotification(setting.notificationId);
    }

    if (!setting.enabled) {
      nextSettings[itemId] = { ...setting, notificationId: null, scheduledAt: null };
      continue;
    }

    const [dayNumber, itemIndexText] = itemId.split('-');
    const itemIndex = Number(itemIndexText);
    const dayIndex = (plan.days || []).findIndex((day) => String(day.day) === dayNumber);
    const item = plan.days?.[dayIndex]?.items?.[itemIndex];

    if (dayIndex < 0 || !item) {
      nextSettings[itemId] = { ...setting, enabled: false, notificationId: null, scheduledAt: null };
      continue;
    }

    const result = await scheduleItineraryItemNotification({
      plan,
      dayIndex,
      itemIndex,
      item,
    });

    nextSettings[itemId] = {
      ...setting,
      enabled: result.scheduled,
      notificationId: result.notificationId,
      scheduledAt: result.scheduledAt || null,
      reason: result.reason,
    };
  }

  return {
    ...plan,
    notificationSettings: nextSettings,
  };
}
