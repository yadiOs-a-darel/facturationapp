import type { LoginPayload, RegisterTenantPayload, AuthResponse, AuthUser } from "../types";
export interface AuthResult {
    data?: {
        user: AuthUser;
    };
    error?: Error;
}
export declare function login(payload: LoginPayload): Promise<AuthResponse>;
export declare function registerTenant(payload: RegisterTenantPayload): Promise<AuthResponse>;
export declare function logout(): Promise<void>;
export declare function getSession(): Promise<AuthResult>;
