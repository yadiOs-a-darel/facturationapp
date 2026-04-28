import { QueryClient } from "@tanstack/react-query";
declare module "@tanstack/react-query" {
    interface Register {
        mutationMeta: {
            successMessage?: string;
            errorMessage?: string;
            invalidates?: readonly unknown[];
            silentError?: boolean;
        };
    }
}
export declare function createQueryClient(): QueryClient;
export declare const QueryKeys: {
    session: readonly ["session"];
    invoices: readonly ["invoices"];
    invoice: (id: string) => readonly ["invoices", string];
    products: readonly ["products"];
    product: (id: string) => readonly ["products", string];
    stock: readonly ["stock"];
    stockEntry: (id: string) => readonly ["stock", "detail", string];
};
