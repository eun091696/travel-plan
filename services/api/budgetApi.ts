import { apiClient } from './apiClient';
import { findLocalTrip } from './localTripStorage';
import { markLocalMode, markServerMode } from '../serverConnectionService';

function localBudgetItemsToApiBudgets(trip) {
  return Object.entries(trip?.budgetItems || {}).map(([category, amount]) => ({
    id: category,
    category,
    title: category,
    plannedAmount: 0,
    actualAmount: Number(amount) || 0,
    memo: '',
  }));
}

async function fallback(action, fn) {
  try {
    const result = await action();
    markServerMode();
    return result;
  } catch (error) {
    if (error?.name === 'AuthRequiredError') {
      throw error;
    }
    console.log('[budgetApi] API unavailable. Using AsyncStorage fallback.', {
      message: error?.message,
    });
    markLocalMode(error);
    return fn();
  }
}

export async function getBudgets(tripId) {
  return fallback(
    () => apiClient.get(`/api/trips/${encodeURIComponent(tripId)}/budgets`),
    async () => localBudgetItemsToApiBudgets(await findLocalTrip(tripId))
  );
}

export async function createBudget(tripId, budget) {
  return fallback(
    () => apiClient.post(`/api/trips/${encodeURIComponent(tripId)}/budgets`, budget),
    async () => budget
  );
}

export async function updateBudget(budgetId, budget) {
  return fallback(
    () => apiClient.put(`/api/budgets/${encodeURIComponent(budgetId)}`, budget),
    async () => ({ ...budget, id: budgetId })
  );
}

export async function deleteBudget(budgetId) {
  return fallback(
    () => apiClient.delete(`/api/budgets/${encodeURIComponent(budgetId)}`),
    async () => true
  );
}

export const budgetApi = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
