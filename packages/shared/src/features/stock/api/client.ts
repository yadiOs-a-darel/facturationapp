import { apiClient } from "../../../lib/api-client";
import type { StockMovementsResponse, StockAlertsResponse, StockMovementsParams } from '../types';

export async function fetchStockMovements(params: StockMovementsParams = {}): Promise<StockMovementsResponse> {
  const { data } = await apiClient.get<StockMovementsResponse>('/stock/movements', { params });
  return data;
}

export async function fetchStockAlerts(): Promise<StockAlertsResponse> {
  const { data } = await apiClient.get<StockAlertsResponse>('/stock/alerts');
  return data;
}