import { apiClient } from "../../../lib/api-client";
export async function fetchCustomers(params = {}) {
    const { data } = await apiClient.get('/customers', { params });
    return data;
}
export async function fetchCustomer(id) {
    const { data } = await apiClient.get(`/customers/${id}`);
    return data;
}
export async function createCustomer(payload) {
    const { data } = await apiClient.post('/customers', payload);
    return data;
}
export async function updateCustomer(id, payload) {
    const { data } = await apiClient.put(`/customers/${id}`, payload);
    return data;
}
export async function deleteCustomer(id) {
    await apiClient.delete(`/customers/${id}`);
}
