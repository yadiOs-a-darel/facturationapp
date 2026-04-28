export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
export declare class ApiRequestError extends Error {
    status: number;
    code: string;
    details?: Record<string, unknown>;
    constructor(status: number, error: ApiError);
}
export declare const api: {
    get<T>(url: string, params?: Record<string, string | number | undefined>): Promise<T>;
    post<T>(url: string, body?: unknown): Promise<T>;
    put<T>(url: string, body: unknown): Promise<T>;
    patch<T>(url: string, body: unknown): Promise<T>;
    delete(url: string): Promise<void>;
};
