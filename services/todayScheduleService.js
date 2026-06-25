const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseTimeToMinutes(value) {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function formatDuration(minutes) {
  if (minutes <= 0) return '곧 시작';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분 후`;
  if (mins === 0) return `${hours}시간 후`;
  return `${hours}시간 ${mins}분 후`;
}

function getItemEndMinutes(item, nextItem) {
  if (item.minutes === null) return null;
  const defaultEndMinutes = item.minutes + 120;
  if (nextItem?.minutes === null || nextItem?.minutes === undefined) return defaultEndMinutes;
  return Math.min(nextItem.minutes, defaultEndMinutes);
}

export function getTodayTripStatus(plan, now = new Date()) {
  const start = parseDate(plan.startDate);
  const end = parseDate(plan.endDate || plan.startDate);
  if (!start || !end) return { status: 'active', dayIndex: 0 };

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (today < start) return { status: 'before' };
  if (today > end) return { status: 'after' };

  return {
    status: 'active',
    dayIndex: Math.floor((today - start) / DAY_MS),
  };
}

export function getTodayScheduleInfo(plan, completedItems = {}, now = new Date()) {
  const tripStatus = getTodayTripStatus(plan, now);
  if (tripStatus.status !== 'active') return tripStatus;

  const day = (plan.days || [])[tripStatus.dayIndex];
  const items = (day?.items || []).map((item, itemIndex) => {
    const id = `${day.day}-${itemIndex}`;
    return {
      ...item,
      id,
      itemIndex,
      completed: Boolean(completedItems[id]),
      minutes: parseTimeToMinutes(item.time),
    };
  });

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const sortedItems = [...items].sort((a, b) => (a.minutes ?? 9999) - (b.minutes ?? 9999));
  const timedItems = sortedItems.filter((item) => item.minutes !== null);
  const currentItem =
    timedItems.find((item, index) => {
      const endMinutes = getItemEndMinutes(item, timedItems[index + 1]);
      return item.minutes <= currentMinutes && currentMinutes < endMinutes;
    }) || null;
  const nextItem = timedItems.find((item) => item.minutes > currentMinutes) || null;
  const pastItems = sortedItems.filter((item) => {
    if (item.minutes === null) return false;
    if (item.id === currentItem?.id) return false;
    return item.minutes < currentMinutes;
  });
  const remainingItems = sortedItems.filter((item) => item.minutes === null || item.minutes > currentMinutes);
  const minutesToNext = nextItem?.minutes !== null && nextItem ? nextItem.minutes - currentMinutes : null;

  return {
    status: 'active',
    day,
    items: sortedItems,
    currentItem,
    nextItem,
    pastItems,
    remainingItems,
    minutesToNext,
    nextTimeLabel: minutesToNext === null ? '다음 일정이 없습니다' : formatDuration(minutesToNext),
  };
}
