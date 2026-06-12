import { apiClient } from "../../../lib/api-client";
import type {
  Invoice,
  InvoiceDetail,
  InvoicesListResponse,
  InvoiceUpsertPayload,
  InvoicesListParams,
  RecordPaymentPayload,
} from '../types';

export async function fetchInvoices(params: InvoicesListParams = {}): Promise<InvoicesListResponse> {
  const { data } = await apiClient.get<InvoicesListResponse>('/invoices', { params });
  return data;
}

export async function fetchInvoice(id: string): Promise<InvoiceDetail> {
  const { data } = await apiClient.get<InvoiceDetail>(`/invoices/${id}`);
  return data;
}

export async function cancelInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>(`/invoices/${id}/cancel`);
  return data;
}

export async function recordPayment(id: string, payload: RecordPaymentPayload): Promise<unknown> {
  const { data } = await apiClient.post(`/invoices/${id}/payments`, payload);
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

export async function sendInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>(`/invoices/${id}/send`);
  return data;
}

export async function convertToInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>(`/invoices/${id}/convert`);
  return data;
}

export async function createCreditNote(id: string): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>(`/invoices/${id}/credit-note`);
  return data;
}

export async function sendInvoiceEmail(id: string): Promise<{ success: boolean; sentTo: string }> {
  const { data } = await apiClient.post(`/invoices/${id}/send-email`);
  return data;
}