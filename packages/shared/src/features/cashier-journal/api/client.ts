import { apiClient } from '../../../lib/api-client';
import type { CashierDailyResponse } from '../types';

export async function fetchCashierDailyReport(date: string): Promise<CashierDailyResponse> {
  const { data } = await apiClient.get<CashierDailyResponse>('/reports/cashier-daily', {
    params: { date },
  });
  return data;
}

export async function emailCashierDailyReport(date: string, to?: string) {
  const { data } = await apiClient.post<{ success: boolean; sentTo: string }>(
    '/reports/cashier-daily/email',
    { date, ...(to ? { to } : {}) },
  );
  return data;
}
