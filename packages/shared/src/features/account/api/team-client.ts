import { apiClient } from '../../../lib/api-client';

export interface TeamUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface CreateTeamUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: 'ADMIN' | 'CASHIER';
}

export interface UpdateTeamUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  role?: 'ADMIN' | 'CASHIER';
  isActive?: boolean;
  password?: string;
}

export async function fetchTeamUsers() {
  const { data } = await apiClient.get<{ data: TeamUser[] }>('/team');
  return data;
}

export async function createTeamUser(payload: CreateTeamUserPayload) {
  const { data } = await apiClient.post<TeamUser>('/team', payload);
  return data;
}

export async function updateTeamUser(id: string, payload: UpdateTeamUserPayload) {
  const { data } = await apiClient.put<TeamUser>(`/team/${id}`, payload);
  return data;
}

export async function deleteTeamUser(id: string) {
  await apiClient.delete(`/team/${id}`);
}
