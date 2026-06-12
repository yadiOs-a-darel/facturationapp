import { apiClient } from '../../../lib/api-client';
import type { Expense, ExpensePayload, ExpensesListParams, ExpensesListResponse } from '../types';

export async function fetchExpenses(params: ExpensesListParams = {}): Promise<ExpensesListResponse> {
  const { data } = await apiClient.get<ExpensesListResponse>('/expenses', { params });
  return data;
}

export async function createExpense(payload: ExpensePayload): Promise<Expense> {
  const { data } = await apiClient.post('/expenses', payload);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}
