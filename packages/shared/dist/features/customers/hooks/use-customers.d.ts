import type { CustomersListParams } from "../types";
export declare const customerKeys: {
    detail: (id: string) => readonly ["customers", "detail", string];
    all: readonly ["customers"];
    list: <T>(params?: T) => readonly ["customers", "list", T | undefined];
};
export declare function useCustomers(params?: CustomersListParams): any;
export declare function useCustomer(id: string | undefined): any;
export declare function useCreateCustomer(): any;
export declare function useUpdateCustomer(id: string): any;
export declare function useDeleteCustomer(): any;
