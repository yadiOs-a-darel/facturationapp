import { apiClient } from "../../../lib/api-client";
import type { LoginPayload, RegisterTenantPayload, AuthResponse, AuthUser } from "../types";

export interface AuthResult {
  data?: { user: AuthUser };
  error?: Error;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function registerTenant(payload: RegisterTenantPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register-tenant", payload);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    localStorage.removeItem("gestfacturation_token");
  }
}

export async function getSession(): Promise<AuthResult> {
  const token = localStorage.getItem("gestfacturation_token");
  if (!token) {
    return { error: new Error("No token") };
  }
  try {
    const { data } = await apiClient.get<AuthResponse>("/auth/session");
    return { data: { user: data.user } };
  } catch (error) {
    return { error: error as Error };
  }
}