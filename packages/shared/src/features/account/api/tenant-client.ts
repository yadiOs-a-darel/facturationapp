import { apiClient } from '../../../lib/api-client';
import type { Tenant, TenantUpdatePayload } from '../types';

export async function fetchMyTenant(): Promise<Tenant> {
  const { data } = await apiClient.get<Tenant>('/tenants/me');
  return data;
}

export async function updateMyTenant(payload: TenantUpdatePayload): Promise<Tenant> {
  const { data } = await apiClient.put<Tenant>('/tenants/me', payload);
  return data;
}

export async function uploadMyTenantLogo(file: File): Promise<Tenant> {
  const formData = new FormData();
  formData.append('logo', file);
  const { data } = await apiClient.post<Tenant>('/tenants/me/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
