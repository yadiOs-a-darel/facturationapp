import { apiClient } from "../../../lib/api-client";
import type { Product, ProductsListResponse, ProductUpsertPayload, ProductsListParams } from '../types';

export async function fetchProducts(params: ProductsListParams = {}): Promise<ProductsListResponse> {
  const { data } = await apiClient.get<ProductsListResponse>('/products', { params });
  return data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(payload: ProductUpsertPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(id: string, payload: ProductUpsertPayload): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}