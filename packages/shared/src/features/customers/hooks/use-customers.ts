import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersKeys } from "../../../lib/query";
import {
  fetchCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/client";
import type { CustomerUpsertPayload, CustomersListParams } from "../types";

export const customerKeys = {
  ...customersKeys,
  detail: (id: string) => [...customersKeys.all, 'detail', id] as const,
};

export function useCustomers(params?: CustomersListParams) {
  return useQuery({
    queryKey: customersKeys.list(params),
    queryFn: () => fetchCustomers(params),
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Missing customer id');
      return fetchCustomer(id);
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerUpsertPayload) => createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.all });
    },
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerUpsertPayload) => updateCustomer(id, payload),
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: customersKeys.all });
      queryClient.setQueryData(customerKeys.detail(id), updatedCustomer);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.all });
    },
  });
}