const baseChecklist = ['여권', '충전기', '보조배터리', '유심/eSIM', '환전', '상비약'];

const destinationChecklist = {
  tokyo: ['JR패스', '교통카드', '동전 지갑'],
  osaka: ['JR패스', '교통카드', '편한 신발'],
  danang: ['달러 환전', '선크림', '얇은 겉옷'],
  bangkok: ['바트 환전', '선크림', '얇은 겉옷'],
  jeju: ['렌터카 예약', '운전면허증', '바람막이'],
};

function normalize(value) {
  return String(value || '').toLowerCase();
}

function getDestinationKey(plan) {
  const value = normalize([plan.destinationId, plan.destinationEnglishName, plan.destination, plan.country].filter(Boolean).join(' '));
  if (value.includes('tokyo')) return 'tokyo';
  if (value.includes('osaka')) return 'osaka';
  if (value.includes('danang') || value.includes('da nang') || value.includes('베트남')) return 'danang';
  if (value.includes('bangkok')) return 'bangkok';
  if (value.includes('jeju') || value.includes('제주')) return 'jeju';
  return plan.destinationId || 'tokyo';
}

function makeChecklistItem(label, index, checked = false) {
  return {
    id: `check-${normalize(label).replace(/[^a-z0-9가-힣]+/g, '-') || index}`,
    label,
    checked,
  };
}

export function getDefaultChecklist(plan) {
  const destinationKey = getDestinationKey(plan);
  const labels = [...baseChecklist, ...(destinationChecklist[destinationKey] || [])];
  const uniqueLabels = Array.from(new Set(labels));
  return uniqueLabels.map((label, index) => makeChecklistItem(label, index));
}

export function hydrateChecklist(plan) {
  if (Array.isArray(plan.checklist) && plan.checklist.length > 0) {
    return plan.checklist;
  }

  return getDefaultChecklist(plan);
}

export function createChecklistItem(label) {
  return {
    id: `custom-${Date.now()}`,
    label,
    checked: false,
  };
}
