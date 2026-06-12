import { apiClient } from '../../../lib/api-client';
import type { PasswordUpdatePayload, ProfileUpdatePayload, UserProfile } from '../types';

export async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>('/users/me');
  return data;
}

export async function updateMyProfile(payload: ProfileUpdatePayload): Promise<UserProfile> {
  const { data } = await apiClient.put<UserProfile>('/users/me', payload);
  return data;
}

export async function updateMyPassword(payload: PasswordUpdatePayload): Promise<void> {
  await apiClient.put('/users/me/password', payload);
}
