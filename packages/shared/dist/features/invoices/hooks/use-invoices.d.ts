import type { InvoiceUpsertPayload, InvoicesListParams } from "../types";
export declare const invoiceKeys: {
    detail: (id: string) => readonly ["invoices", "detail", string];
    all: readonly ["invoices"];
    list: <T>(params?: T) => readonly ["invoices", "list", T | undefined];
};
export declare function useInvoices(params?: InvoicesListParams): import("@tanstack/react-query").UseQueryResult<import("../types").InvoicesListResponse, Error>;
export declare function useInvoice(id: string | undefined): import("@tanstack/react-query").UseQueryResult<import("../types").Invoice, Error>;
export declare function useCreateInvoice(): import("@tanstack/react-query").UseMutationResult<import("../types").Invoice, Error, InvoiceUpsertPayload, unknown>;
export declare function useUpdateInvoice(id: string): import("@tanstack/react-query").UseMutationResult<import("../types").Invoice, Error, InvoiceUpsertPayload, unknown>;
export declare function useDeleteInvoice(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
