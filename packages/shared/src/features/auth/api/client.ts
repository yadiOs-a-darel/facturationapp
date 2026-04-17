import { apiClient } from "../../../lib/api-client";
import type { LoginPayload, RegisterTenantPayload, AuthResponse } from '../types';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function registerTenant(payload: RegisterTenantPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register-tenant', payload);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getSession() {
  const { data } = await apiClient.get<{ user: any }>('/auth/session');
  return data;
}