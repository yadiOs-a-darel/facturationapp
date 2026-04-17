import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoicesKeys } from "../../../lib/query";
import {
  fetchInvoices,
  fetchInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../api/client";
import type { InvoiceUpsertPayload, InvoicesListParams } from "../types";

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
    },
  });
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvoiceUpsertPayload) => updateInvoice(id, payload),
    onSuccess: (updatedInvoice) => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      queryClient.setQueryData(invoiceKeys.detail(id), updatedInvoice);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
    },
  });
}