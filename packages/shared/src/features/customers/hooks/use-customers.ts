import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      toast.success("Client créé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création du client", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
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
      toast.success("Client mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du client", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.all });
      toast.success("Client supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du client", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}
