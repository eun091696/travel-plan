export const budgetCategories = [
  { key: 'flight', label: '항공권', icon: 'navigation' },
  { key: 'stay', label: '숙소', icon: 'home' },
  { key: 'food', label: '식비', icon: 'coffee' },
  { key: 'transport', label: '교통', icon: 'truck' },
  { key: 'activity', label: '관광/액티비티', icon: 'camera' },
  { key: 'shopping', label: '쇼핑', icon: 'shopping-bag' },
  { key: 'etc', label: '기타', icon: 'more-horizontal' },
];

export function parseMoney(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value || '').replace(/,/g, '').trim();
  if (!raw) return 0;

  const number = Number(raw.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(number)) return 0;

  if (raw.includes('만원')) return number * 10000;
  if (raw.includes('천원')) return number * 1000;
  return number;
}

export function formatMoney(value) {
  const amount = Math.max(0, Math.round(Number(value) || 0));
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function formatNumberInput(value) {
  const amount = Math.max(0, Math.round(Number(value) || 0));
  return amount > 0 ? amount.toLocaleString('ko-KR') : '';
}

export function getInitialBudget(plan) {
  const savedBudget = parseMoney(plan.totalBudget);
  if (savedBudget > 0) return savedBudget;
  return parseMoney(plan.budget);
}

export function hydrateBudget(plan) {
  const categoryAmounts = budgetCategories.reduce((acc, category) => {
    acc[category.key] = parseMoney(plan.budgetItems?.[category.key]);
    return acc;
  }, {});

  return {
    totalBudget: getInitialBudget(plan),
    items: categoryAmounts,
  };
}

export function calculateBudgetSummary(totalBudget, items) {
  const totalSpent = Object.values(items || {}).reduce((sum, value) => sum + parseMoney(value), 0);
  const remaining = totalBudget - totalSpent;
  const usageRate = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;

  return {
    totalSpent,
    remaining,
    usageRate,
    isOverBudget: totalBudget > 0 && totalSpent > totalBudget,
  };
}
