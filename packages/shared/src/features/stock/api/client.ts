import { apiClient } from "../../../lib/api-client";
import type {
  StockMovementsResponse,
  StockAlertsResponse,
  StockMovementsParams,
  StockAdjustmentPayload,
  CurrentStockResponse,
} from '../types';

export async function fetchStockMovements(params: StockMovementsParams = {}): Promise<StockMovementsResponse> {
  const { data } = await apiClient.get<StockMovementsResponse>('/stock/movements', { params });
  return data;
}

export async function fetchStockAlerts(): Promise<StockAlertsResponse> {
  const { data } = await apiClient.get<StockAlertsResponse>('/stock/alerts');
  return data;
}

export async function adjustStock(payload: StockAdjustmentPayload): Promise<{ message: string; newStock: number }> {
  const { data } = await apiClient.post<{ message: string; newStock: number }>('/stock/adjust', payload);
  return data;
}

export async function getCurrentStock(productId: string): Promise<CurrentStockResponse> {
  const { data } = await apiClient.get<CurrentStockResponse>(`/stock/${productId}`);
  return data;
}
