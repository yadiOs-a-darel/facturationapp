import { QueryClient } from '@tanstack/react-query';
const queryConfig = {
    queries: {
        refetchOnWindowFocus: false,
        staleTime: 2 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error instanceof Error && 'status' in error) {
                const status = error.status;
                if (status >= 400 && status < 500) {
                    return false;
                }
            }
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
};
export function createQueryClient() {
    return new QueryClient({
        defaultOptions: queryConfig,
    });
}
export const sessionKeys = {
    all: ['session'],
};
export const tenantKeys = {
    all: ['tenant'],
};
export const customersKeys = {
    all: ["customers"],
    list: (params) => [...customersKeys.all, "list", params],
    detail: (id) => [...customersKeys.all, "detail", id],
};
export const productsKeys = {
    all: ["products"],
    list: (params) => [...productsKeys.all, "list", params],
    detail: (id) => [...productsKeys.all, "detail", id],
};
export const invoicesKeys = {
    all: ["invoices"],
    list: (params) => [...invoicesKeys.all, "list", params],
    detail: (id) => [...invoicesKeys.all, "detail", id],
};
export const stockKeys = {
    all: ["stock"],
    list: (params) => [...stockKeys.all, "list", params],
    alerts: ["stock", "alerts"],
    detail: (id) => [...stockKeys.all, "detail", id],
};
export const reportsKeys = {
    all: ['reports'],
    dashboard: ['reports', 'dashboard'],
    list: (params) => [...reportsKeys.all, 'list', params],
};
export const paymentMethodsKeys = {
    all: ['paymentMethods'],
    list: (params) => [...paymentMethodsKeys.all, 'list', params],
    detail: (id) => [...paymentMethodsKeys.all, 'detail', id],
};
export const attachmentsKeys = {
    all: ['attachments'],
    list: (params) => [...attachmentsKeys.all, 'list', params],
    detail: (id) => [...attachmentsKeys.all, 'detail', id],
};
