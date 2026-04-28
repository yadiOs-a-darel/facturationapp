import { apiClient } from "../../../lib/api-client";
export async function fetchStockMovements(params = {}) {
    const { data } = await apiClient.get('/stock/movements', { params });
    return data;
}
export async function fetchStockAlerts() {
    const { data } = await apiClient.get('/stock/alerts');
    return data;
}
export async function adjustStock(payload) {
    const { data } = await apiClient.post('/stock/adjust', payload);
    return data;
}
export async function getCurrentStock(productId) {
    const { data } = await apiClient.get(`/stock/${productId}`);
    return data;
}
