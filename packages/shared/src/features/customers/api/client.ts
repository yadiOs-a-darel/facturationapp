import { apiClient } from "../../../lib/api-client";
import type { Customer, CustomersListResponse, CustomerUpsertPayload, CustomersListParams } from "../types";

export async function fetchCustomers(params: CustomersListParams = {}): Promise<CustomersListResponse> {
  const { data } = await apiClient.get<CustomersListResponse>('/customers', { params });
  return data;
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const { data } = await apiClient.get<Customer>(`/customers/${id}`);
  return data;
}

export async function createCustomer(payload: CustomerUpsertPayload): Promise<Customer> {
  const { data } = await apiClient.post<Customer>('/customers', payload);
  return data;
}

export async function updateCustomer(id: string, payload: CustomerUpsertPayload): Promise<Customer> {
  const { data } = await apiClient.put<Customer>(`/customers/${id}`, payload);
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}