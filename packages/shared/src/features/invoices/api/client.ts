import { apiClient } from "../../../lib/api-client";
import type { Invoice, InvoicesListResponse, InvoiceUpsertPayload, InvoicesListParams } from '../types';

export async function fetchInvoices(params: InvoicesListParams = {}): Promise<InvoicesListResponse> {
  const { data } = await apiClient.get<InvoicesListResponse>('/invoices', { params });
  return data;
}

export async function fetchInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.get<Invoice>(`/invoices/${id}`);
  return data;
}

export async function createInvoice(payload: InvoiceUpsertPayload): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>('/invoices', payload);
  return data;
}

export async function updateInvoice(id: string, payload: InvoiceUpsertPayload): Promise<Invoice> {
  const { data } = await apiClient.put<Invoice>(`/invoices/${id}`, payload);
  return data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await apiClient.delete(`/invoices/${id}`);
}