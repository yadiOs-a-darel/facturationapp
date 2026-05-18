import { apiClient } from "../../../lib/api-client";
import type { PaymentMethod } from '../types';

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } = await apiClient.get<{ data: PaymentMethod[] }>('/payment-methods');
  return data.data;
}

export async function fetchPaymentMethod(id: string): Promise<PaymentMethod> {
  const { data } = await apiClient.get<PaymentMethod>(`/payment-methods/${id}`);
  return data;
}

export async function createPaymentMethod(payload: Partial<PaymentMethod>): Promise<PaymentMethod> {
  const { data } = await apiClient.post<PaymentMethod>('/payment-methods', payload);
  return data;
}

export async function updatePaymentMethod(id: string, payload: Partial<PaymentMethod>): Promise<PaymentMethod> {
  const { data } = await apiClient.put<PaymentMethod>(`/payment-methods/${id}`, payload);
  return data;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await apiClient.delete(`/payment-methods/${id}`);
}