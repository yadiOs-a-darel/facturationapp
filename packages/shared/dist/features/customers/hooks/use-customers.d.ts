import type { CustomerUpsertPayload, CustomersListParams } from "../types";
export declare const customerKeys: {
    detail: (id: string) => readonly ["customers", "detail", string];
    all: readonly ["customers"];
    list: <T>(params?: T) => readonly ["customers", "list", T | undefined];
};
export declare function useCustomers(params?: CustomersListParams): import("@tanstack/react-query").UseQueryResult<import("../types").CustomersListResponse, Error>;
export declare function useCustomer(id: string | undefined): import("@tanstack/react-query").UseQueryResult<import("../types").Customer, Error>;
export declare function useCreateCustomer(): import("@tanstack/react-query").UseMutationResult<import("../types").Customer, Error, CustomerUpsertPayload, unknown>;
export declare function useUpdateCustomer(id: string): import("@tanstack/react-query").UseMutationResult<import("../types").Customer, Error, CustomerUpsertPayload, unknown>;
export declare function useDeleteCustomer(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
