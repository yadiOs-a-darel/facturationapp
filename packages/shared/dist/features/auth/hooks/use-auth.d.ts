import type { LoginPayload } from "../types";
export declare function useLogin(): import("@tanstack/react-query").UseMutationResult<import("../types").AuthResponse, Error, LoginPayload, unknown>;
export declare function useLogout(): import("@tanstack/react-query").UseMutationResult<void, Error, void, unknown>;
export declare function useSession(): import("@tanstack/react-query").UseQueryResult<{
    user: any;
}, Error>;
