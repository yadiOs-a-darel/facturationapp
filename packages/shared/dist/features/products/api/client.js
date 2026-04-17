import { apiClient } from "../../../lib/api-client";
export async function fetchProducts(params = {}) {
    const { data } = await apiClient.get('/products', { params });
    return data;
}
export async function fetchProduct(id) {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
}
export async function createProduct(payload) {
    const { data } = await apiClient.post('/products', payload);
    return data;
}
export async function updateProduct(id, payload) {
    const { data } = await apiClient.put(`/products/${id}`, payload);
    return data;
}
export async function deleteProduct(id) {
    await apiClient.delete(`/products/${id}`);
}
