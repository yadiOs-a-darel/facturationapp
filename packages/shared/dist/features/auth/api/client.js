import { apiClient } from "../../../lib/api-client";
export async function login(payload) {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
}
export async function registerTenant(payload) {
    const { data } = await apiClient.post('/auth/register-tenant', payload);
    return data;
}
export async function logout() {
    await apiClient.post('/auth/logout');
}
export async function getSession() {
    const { data } = await apiClient.get('/auth/session');
    return data;
}
