import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoicesKeys } from "../../../lib/query";
import { fetchInvoices, fetchInvoice, createInvoice, updateInvoice, deleteInvoice, } from "../api/client";
export const invoiceKeys = {
    ...invoicesKeys,
    detail: (id) => [...invoicesKeys.all, 'detail', id],
};
export function useInvoices(params) {
    return useQuery({
        queryKey: invoicesKeys.list(params),
        queryFn: () => fetchInvoices(params),
    });
}
export function useInvoice(id) {
    return useQuery({
        queryKey: invoiceKeys.detail(id ?? ''),
        queryFn: () => {
            if (!id)
                throw new Error('Missing invoice id');
            return fetchInvoice(id);
        },
        enabled: !!id,
    });
}
export function useCreateInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => createInvoice(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
        },
    });
}
export function useUpdateInvoice(id) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => updateInvoice(id, payload),
        onSuccess: (updatedInvoice) => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
            queryClient.setQueryData(invoiceKeys.detail(id), updatedInvoice);
        },
    });
}
export function useDeleteInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteInvoice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
        },
    });
}
