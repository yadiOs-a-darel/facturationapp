import type { InvoicesListParams } from "../types";
export declare const invoiceKeys: {
    detail: (id: string) => readonly ["invoices", "detail", string];
    all: readonly ["invoices"];
    list: <T>(params?: T) => readonly ["invoices", "list", T | undefined];
};
export declare function useInvoices(params?: InvoicesListParams): any;
export declare function useInvoice(id: string | undefined): any;
export declare function useCreateInvoice(): any;
export declare function useUpdateInvoice(id: string): any;
export declare function useDeleteInvoice(): any;
