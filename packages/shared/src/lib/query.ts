import { QueryClient, type DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

export const sessionKeys = {
  all: ['session'] as const,
};

export const tenantKeys = {
  all: ['tenant'] as const,
};

export const customersKeys = {
  all: ["customers"] as const,
  list: <T>(params?: T) => [...customersKeys.all, "list", params] as const,
  detail: (id: string) => [...customersKeys.all, "detail", id] as const,
};

export const productsKeys = {
  all: ["products"] as const,
  list: <T>(params?: T) => [...productsKeys.all, "list", params] as const,
  detail: (id: string) => [...productsKeys.all, "detail", id] as const,
};

export const invoicesKeys = {
  all: ["invoices"] as const,
  list: <T>(params?: T) => [...invoicesKeys.all, "list", params] as const,
  detail: (id: string) => [...invoicesKeys.all, "detail", id] as const,
};

export const stockKeys = {
  all: ["stock"] as const,
  list: <T>(params?: T) => [...stockKeys.all, "list", params] as const,
  alerts: ["stock", "alerts"] as const,
  detail: (id: string) => [...stockKeys.all, "detail", id] as const,
};

export const reportsKeys = {
  all: ['reports'] as const,
  dashboard: ['reports', 'dashboard'] as const,
  list: (params?: Record<string, unknown>) => [...reportsKeys.all, 'list', params] as const,
};

export const paymentMethodsKeys = {
  all: ['paymentMethods'] as const,
  list: (params?: Record<string, unknown>) => [...paymentMethodsKeys.all, 'list', params] as const,
  detail: (id: string) => [...paymentMethodsKeys.all, 'detail', id] as const,
};

export const attachmentsKeys = {
  all: ['attachments'] as const,
  list: (params?: Record<string, unknown>) => [...attachmentsKeys.all, 'list', params] as const,
  detail: (id: string) => [...attachmentsKeys.all, 'detail', id] as const,
};

