import { type DefaultOptions, MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiRequestError } from "../api/client";

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

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
};

export function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: queryConfig,
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => {
        const { successMessage, invalidates } = mutation.meta ?? {};
        if (invalidates) {
          queryClient.invalidateQueries({ queryKey: invalidates });
        }
        if (successMessage) {
          toast.success(successMessage);
        }
      },
      onError: (error, _vars, _ctx, mutation) => {
        const { errorMessage, silentError } = mutation.meta ?? {};
        if (silentError) return;
        const message =
          errorMessage ??
          (error instanceof ApiRequestError ? error.message : "Une erreur est survenue");
        toast.error(message);
      },
    }),
  });
  return queryClient;
}

export const QueryKeys = {
  session: ["session"] as const,
  invoices: ["invoices"] as const,
  invoice: (id: string) => ["invoices", id] as const,
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,
  stock: ["stock"] as const,
  stockEntry: (id: string) => ["stock", "detail", id] as const,
};