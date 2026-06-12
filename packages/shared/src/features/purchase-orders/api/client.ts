import { apiClient } from '../../../lib/api-client';
import type {
  PurchaseOrder,
  PurchaseOrderPayload,
  PurchaseOrdersListParams,
  PurchaseOrdersListResponse,
} from '../types';

export async function fetchPurchaseOrders(
  params: PurchaseOrdersListParams = {},
): Promise<PurchaseOrdersListResponse> {
  const { data } = await apiClient.get<PurchaseOrdersListResponse>('/purchase-orders', { params });
  return data;
}

export async function createPurchaseOrder(payload: PurchaseOrderPayload) {
  const { data } = await apiClient.post('/purchase-orders', payload);
  return data;
}

export async function receivePurchaseOrder(id: string) {
  const { data } = await apiClient.post(`/purchase-orders/${id}/receive`);
  return data;
}
