import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invoicesKeys, reportsKeys } from "../../../lib/query";
import {
  fetchInvoices,
  fetchInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  cancelInvoice,
  recordPayment,
} from "../api/client";
import type { InvoiceUpsertPayload, InvoicesListParams, RecordPaymentPayload } from "../types";

export const invoiceKeys = {
  ...invoicesKeys,
  detail: (id: string) => [...invoicesKeys.all, 'detail', id] as const,
};

export function useInvoices(params?: InvoicesListParams) {
  return useQuery({
    queryKey: invoicesKeys.list(params),
    queryFn: () => fetchInvoices(params),
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Missing invoice id');
      return fetchInvoice(id);
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvoiceUpsertPayload) => createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: reportsKeys.dashboard });
      toast.success("Facture créée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la facture", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvoiceUpsertPayload) => updateInvoice(id, payload),
    onSuccess: (updatedInvoice) => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: reportsKeys.dashboard });
      queryClient.setQueryData(invoiceKeys.detail(id), updatedInvoice);
      toast.success("Facture mise à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de la facture", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: reportsKeys.dashboard });
      toast.success("Facture supprimée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression de la facture", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: reportsKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
      toast.success("Facture annulée");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'annulation", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}

export function useRecordPayment(invoiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) => recordPayment(invoiceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
      toast.success("Paiement enregistré");
    },
    onError: (error) => {
      toast.error("Erreur lors du paiement", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });
}
