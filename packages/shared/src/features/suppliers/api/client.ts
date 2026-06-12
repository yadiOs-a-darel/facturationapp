import { apiClient } from '../../../lib/api-client';
import type { Supplier, SupplierPayload, SuppliersListParams, SuppliersListResponse } from '../types';

export async function fetchSuppliers(params: SuppliersListParams = {}): Promise<SuppliersListResponse> {
  const { data } = await apiClient.get<SuppliersListResponse>('/suppliers', { params });
  return data;
}

export async function createSupplier(payload: SupplierPayload): Promise<Supplier> {
  const { data } = await apiClient.post('/suppliers', payload);
  return data;
}

export async function updateSupplier(id: string, payload: Partial<SupplierPayload>): Promise<Supplier> {
  const { data } = await apiClient.put(`/suppliers/${id}`, payload);
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`);
}
