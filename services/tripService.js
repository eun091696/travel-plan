import { tripApi } from './api/tripApi';
import { budgetApi } from './api/budgetApi';
import { checklistApi } from './api/checklistApi';
import { itineraryApi } from './api/itineraryApi';
import { upsertLocalTrip } from './api/localTripStorage';

function parseAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const number = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(number) ? number : 0;
}

function toTripRequest(plan) {
  return {
    title: plan.title || `${plan.destination || 'Travel'} 여행`,
    destination: plan.destination || plan.destinationName || '여행지',
    startDate: plan.startDate,
    endDate: plan.endDate,
    arrivalDateTime: plan.arrivalDateTime || null,
    departureDateTime: plan.departureDateTime || null,
    totalBudget: parseAmount(plan.totalBudget || plan.budget),
    companion: plan.companions || plan.companion || '',
    travelStyle: plan.style || plan.travelStyle || '',
  };
}

function mergeTripResponse(apiTrip, fallbackPlan = {}) {
  if (!apiTrip) return fallbackPlan;

  return {
    ...fallbackPlan,
    id: apiTrip.id ?? fallbackPlan.id,
    userId: apiTrip.userId || fallbackPlan.userId,
    title: apiTrip.title || fallbackPlan.title,
    destination: apiTrip.destination || fallbackPlan.destination,
    startDate: apiTrip.startDate || fallbackPlan.startDate,
    endDate: apiTrip.endDate || fallbackPlan.endDate,
    arrivalDateTime: apiTrip.arrivalDateTime || fallbackPlan.arrivalDateTime,
    departureDateTime: apiTrip.departureDateTime || fallbackPlan.departureDateTime,
    totalBudget: apiTrip.totalBudget ?? apiTrip.budget ?? fallbackPlan.totalBudget,
    budget: apiTrip.budget ?? apiTrip.totalBudget ?? fallbackPlan.budget,
    companions: apiTrip.companion || fallbackPlan.companions,
    companion: apiTrip.companion || fallbackPlan.companion,
    style: apiTrip.travelStyle || fallbackPlan.style,
    travelStyle: apiTrip.travelStyle || fallbackPlan.travelStyle,
    savedAt: fallbackPlan.savedAt || apiTrip.createdAt,
    updatedAt: apiTrip.updatedAt || fallbackPlan.updatedAt,
  };
}

function mapItineraryDays(days, fallbackDays = []) {
  if (!Array.isArray(days) || days.length === 0) return fallbackDays || [];

  return days.map((day) => ({
    id: day.id,
    day: day.dayNumber,
    date: day.date,
    items: (day.items || []).map((item, index) => ({
      id: item.id ? `itinerary-${item.id}` : `${day.dayNumber}-${index}`,
      backendId: item.id,
      time: item.time,
      title: item.title,
      placeName: item.placeName || item.title,
      description: item.description,
      category: item.category,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      sortOrder: item.sortOrder ?? index,
      completed: Boolean(item.isCompleted),
      icon: 'map-pin',
    })),
  }));
}

function mapBudgetDetails(budgets, fallbackItems = {}, fallbackIds = {}) {
  if (!Array.isArray(budgets) || budgets.length === 0) {
    return {
      items: fallbackItems || {},
      ids: fallbackIds || {},
    };
  }

  return budgets.reduce(
    (result, budget) => {
      result.items[budget.category] = budget.actualAmount ?? budget.plannedAmount ?? 0;
      result.ids[budget.category] = budget.id;
      return result;
    },
    { items: {}, ids: {} }
  );
}

function mapChecklists(checklists, fallbackChecklist = []) {
  if (!Array.isArray(checklists) || checklists.length === 0) return fallbackChecklist || [];

  return checklists.map((item) => ({
    id: item.id ? `checklist-${item.id}` : item.title,
    backendId: item.id,
    label: item.title,
    category: item.category,
    checked: Boolean(item.isChecked),
  }));
}

function toItineraryItemRequest(day, item, index) {
  return {
    dayNumber: day.day,
    date: day.date || null,
    time: item.time || '09:00',
    title: item.title || item.placeName || '일정',
    description: item.description || '',
    category: item.category || '관광지',
    placeName: item.placeName || item.title || '장소',
    address: item.address || '',
    latitude: item.latitude,
    longitude: item.longitude,
    sortOrder: item.sortOrder ?? index,
    isCompleted: Boolean(item.completed || item.isCompleted),
  };
}

async function loadTripDetails(plan) {
  if (!plan?.id) return plan;

  const [itinerary, budgets, checklists] = await Promise.all([
    itineraryApi.getItinerary(plan.id),
    budgetApi.getBudgets(plan.id),
    checklistApi.getChecklists(plan.id),
  ]);
  const budgetDetails = mapBudgetDetails(budgets, plan.budgetItems, plan.budgetEntryIds);

  return {
    ...plan,
    days: mapItineraryDays(itinerary, plan.days),
    budgetItems: budgetDetails.items,
    budgetEntryIds: budgetDetails.ids,
    checklist: mapChecklists(checklists, plan.checklist),
  };
}

async function syncTripDetails(plan) {
  const tripId = plan.id;

  const itineraryTasks = (plan.days || []).flatMap((day) =>
    (day.items || []).map((item, index) => {
      const request = toItineraryItemRequest(day, item, index);
      return item.backendId
        ? itineraryApi.updateItineraryItem(item.backendId, request)
        : itineraryApi.createItineraryItem(tripId, request);
    })
  );

  const budgetTasks = Object.entries(plan.budgetItems || {})
    .filter(([, amount]) => parseAmount(amount) > 0)
    .map(([category, amount]) => {
      const request = {
        category,
        title: category,
        plannedAmount: 0,
        actualAmount: parseAmount(amount),
        memo: '',
      };
      return plan.budgetEntryIds?.[category]
        ? budgetApi.updateBudget(plan.budgetEntryIds[category], request)
        : budgetApi.createBudget(tripId, request);
    });

  const checklistTasks = (plan.checklist || []).map((item) =>
    item.backendId
      ? checklistApi.updateChecklistItem(item.backendId, {
          title: item.label || item.title,
          category: item.category || '기본',
          isChecked: Boolean(item.checked),
        })
      : checklistApi.createChecklistItem(tripId, {
          title: item.label || item.title,
          category: item.category || '기본',
          isChecked: Boolean(item.checked),
        })
  );

  await upsertLocalTrip(plan);
  await Promise.allSettled([...itineraryTasks, ...budgetTasks, ...checklistTasks]);
  const hydratedPlan = await loadTripDetails(plan);
  await upsertLocalTrip(hydratedPlan);
  return hydratedPlan;
}

export const tripService = {
  getTrips: async () => {
    const trips = await tripApi.getTrips();
    return Promise.all((trips || []).map(async (trip) => loadTripDetails(mergeTripResponse(trip, trip))));
  },
  getTripById: async (id) => {
    const trip = await tripApi.getTripById(id);
    return trip ? loadTripDetails(mergeTripResponse(trip, trip)) : null;
  },
  createTrip: async (trip) => {
    const createdTrip = await tripApi.createTrip({ ...trip, ...toTripRequest(trip) });
    const mergedPlan = mergeTripResponse(createdTrip, trip);
    return syncTripDetails(mergedPlan);
  },
  updateTrip: async (id, trip) => {
    const updatedTrip = await tripApi.updateTrip(id, { ...trip, ...toTripRequest(trip) });
    const mergedPlan = mergeTripResponse(updatedTrip, trip);
    return syncTripDetails(mergedPlan);
  },
  deleteTrip: (id) => tripApi.deleteTrip(id),
  loadTripDetails,
};
