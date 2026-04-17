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
}
export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
}
export interface AuthResponse {
    user: AuthUser;
    token: string;
}
