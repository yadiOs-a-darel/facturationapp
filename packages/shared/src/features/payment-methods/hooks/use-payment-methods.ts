import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentMethodsKeys } from "../../../lib/query";
import {
  fetchPaymentMethods,
  fetchPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../api/client";
import type { PaymentMethod, PaymentMethodUpsertPayload, PaymentMethodsListParams } from "../types";

export const paymentMethodKeys = {
  ...paymentMethodsKeys,
  detail: (id: string) => [...paymentMethodsKeys.all, 'detail', id] as const,
};

export function usePaymentMethods(params?: PaymentMethodsListParams) {
  return useQuery<PaymentMethod[]>({
    queryKey: paymentMethodsKeys.list(params as Record<string, unknown> | undefined),
    queryFn: () => fetchPaymentMethods(),
  });
}

export function usePaymentMethod(id: string | undefined) {
  return useQuery({
    queryKey: paymentMethodKeys.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Missing payment method id');
      return fetchPaymentMethod(id);
    },
    enabled: !!id,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentMethodUpsertPayload) => createPaymentMethod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.all });
      toast.success("Mode de paiement créé avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création du mode de paiement", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}

export function useUpdatePaymentMethod(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentMethodUpsertPayload) => updatePaymentMethod(id, payload),
    onSuccess: (updatedPaymentMethod: any) => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.all });
      queryClient.setQueryData(paymentMethodKeys.detail(id), updatedPaymentMethod);
      toast.success("Mode de paiement mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la mise à jour du mode de paiement", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.all });
      toast.success("Mode de paiement supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression du mode de paiement", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}