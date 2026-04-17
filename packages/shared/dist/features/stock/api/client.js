import { apiClient } from "../../../lib/api-client";
export async function fetchStockMovements(params = {}) {
    const { data } = await apiClient.get('/stock/movements', { params });
    return data;
}
export async function fetchStockAlerts() {
    const { data } = await apiClient.get('/stock/alerts');
    return data;
}
