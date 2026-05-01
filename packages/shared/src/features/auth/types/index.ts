export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterTenantPayload {
  tenantName: string;
  tenantSlug: string;
  adminEmail: string;
  adminPassword: string;
  firstName: string;
  lastName: string;
  licenseKey: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  role?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}