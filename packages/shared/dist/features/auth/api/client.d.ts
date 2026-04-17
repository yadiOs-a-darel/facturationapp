import type { LoginPayload, RegisterTenantPayload, AuthResponse } from '../types';
export declare function login(payload: LoginPayload): Promise<AuthResponse>;
export declare function registerTenant(payload: RegisterTenantPayload): Promise<AuthResponse>;
export declare function logout(): Promise<void>;
export declare function getSession(): Promise<{
    user: any;
}>;
