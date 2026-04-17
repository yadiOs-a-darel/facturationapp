import { apiClient } from "../../../lib/api-client";
export async function fetchInvoices(params = {}) {
    const { data } = await apiClient.get('/invoices', { params });
    return data;
}
export async function fetchInvoice(id) {
    const { data } = await apiClient.get(`/invoices/${id}`);
    return data;
}
export async function createInvoice(payload) {
    const { data } = await apiClient.post('/invoices', payload);
    return data;
}
export async function updateInvoice(id, payload) {
    const { data } = await apiClient.put(`/invoices/${id}`, payload);
    return data;
}
export async function deleteInvoice(id) {
    await apiClient.delete(`/invoices/${id}`);
}
