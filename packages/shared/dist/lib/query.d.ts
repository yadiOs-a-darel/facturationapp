import { QueryClient } from '@tanstack/react-query';
export declare function createQueryClient(): QueryClient;
export declare const QueryKeys: {
    session: readonly ["session"];
    invoices: readonly ["invoices"];
    invoice: (id: string) => readonly ["invoices", string];
    products: readonly ["products"];
    product: (id: string) => readonly ["products", string];
    stock: readonly ["stock"];
    stockEntry: (id: string) => readonly ["stock", "detail", string];
    customers: readonly ["customers"];
    customer: (id: string) => readonly ["customers", string];
};
export declare const sessionKeys: {
    all: readonly ["session"];
};
export declare const tenantKeys: {
    all: readonly ["tenant"];
    detail: (id: string) => readonly ["tenant", "detail", string];
};
export declare const customersKeys: {
    all: readonly ["customers"];
    list: <T>(params?: T) => readonly ["customers", "list", T | undefined];
    detail: (id: string) => readonly ["customers", "detail", string];
};
export declare const productsKeys: {
    all: readonly ["products"];
    list: <T>(params?: T) => readonly ["products", "list", T | undefined];
    detail: (id: string) => readonly ["products", "detail", string];
};
export declare const invoicesKeys: {
    all: readonly ["invoices"];
    list: <T>(params?: T) => readonly ["invoices", "list", T | undefined];
    detail: (id: string) => readonly ["invoices", "detail", string];
};
export declare const stockKeys: {
    all: readonly ["stock"];
    list: <T>(params?: T) => readonly ["stock", "list", T | undefined];
    alerts: readonly ["stock", "alerts"];
    detail: (id: string) => readonly ["stock", "detail", string];
};
export declare const reportsKeys: {
    all: readonly ["reports"];
    dashboard: readonly ["reports", "dashboard"];
    list: (params?: Record<string, unknown>) => readonly ["reports", "list", Record<string, unknown> | undefined];
};
export declare const paymentMethodsKeys: {
    all: readonly ["paymentMethods"];
    list: (params?: Record<string, unknown>) => readonly ["paymentMethods", "list", Record<string, unknown> | undefined];
    detail: (id: string) => readonly ["paymentMethods", "detail", string];
};
export declare const attachmentsKeys: {
    all: readonly ["attachments"];
    list: (params?: Record<string, unknown>) => readonly ["attachments", "list", Record<string, unknown> | undefined];
    detail: (id: string) => readonly ["attachments", "detail", string];
};
