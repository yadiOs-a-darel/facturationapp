import { apiClient } from "../../../lib/api-client";
import type { LoginPayload, RegisterTenantPayload, AuthResponse, AuthUser } from "../types";

export interface AuthResult {
  data?: { user: AuthUser };
  error?: Error;
}

export interface ValidateLicensePayload {
  licenseKey: string;
}

export interface ValidateLicenseResponse {
  valid: boolean;
  licenseKey?: string;
  message?: string;
  error?: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function registerTenant(payload: RegisterTenantPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register-tenant", payload);
  return data;
}

export async function validateLicense(payload: ValidateLicensePayload): Promise<ValidateLicenseResponse> {
  const { data } = await apiClient.post<ValidateLicenseResponse>("/auth/validate-license", payload);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    localStorage.removeItem("gestfacturation_token");
  }
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  const { data } = await apiClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    payload,
  );
  return data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> {
  const { data } = await apiClient.post<ResetPasswordResponse>(
    "/auth/reset-password",
    payload,
  );
  return data;
}

export async function validateResetToken(token: string): Promise<{ valid: boolean }> {
  const { data } = await apiClient.get<{ valid: boolean }>(
    "/auth/reset-password/validate",
    { params: { token } },
  );
  return data;
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