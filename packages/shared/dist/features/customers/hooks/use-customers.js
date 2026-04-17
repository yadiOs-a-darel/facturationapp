import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersKeys } from "../../../lib/query";
import { fetchCustomers, fetchCustomer, createCustomer, updateCustomer, deleteCustomer, } from "../api/client";
export const customerKeys = {
    ...customersKeys,
    detail: (id) => [...customersKeys.all, 'detail', id],
};
export function useCustomers(params) {
    return useQuery({
        queryKey: customersKeys.list(params),
        queryFn: () => fetchCustomers(params),
    });
}
export function useCustomer(id) {
    return useQuery({
        queryKey: customerKeys.detail(id ?? ''),
        queryFn: () => {
            if (!id)
                throw new Error('Missing customer id');
            return fetchCustomer(id);
        },
        enabled: !!id,
    });
}
export function useCreateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => createCustomer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customersKeys.all });
        },
    });
}
export function useUpdateCustomer(id) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => updateCustomer(id, payload),
        onSuccess: (updatedCustomer) => {
            queryClient.invalidateQueries({ queryKey: customersKeys.all });
            queryClient.setQueryData(customerKeys.detail(id), updatedCustomer);
        },
    });
}
export function useDeleteCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customersKeys.all });
        },
    });
}
