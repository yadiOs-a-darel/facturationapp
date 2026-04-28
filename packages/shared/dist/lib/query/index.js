import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiRequestError } from "../api/client";
const queryConfig = {
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
export function createQueryClient() {
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
                if (silentError)
                    return;
                const message = errorMessage ??
                    (error instanceof ApiRequestError ? error.message : "Une erreur est survenue");
                toast.error(message);
            },
        }),
    });
    return queryClient;
}
export const QueryKeys = {
    session: ["session"],
    invoices: ["invoices"],
    invoice: (id) => ["invoices", id],
    products: ["products"],
    product: (id) => ["products", id],
    stock: ["stock"],
    stockEntry: (id) => ["stock", "detail", id],
};
