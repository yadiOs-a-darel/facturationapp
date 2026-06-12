import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { purchaseOrdersKeys } from '../../../lib/query';
import { createPurchaseOrder, fetchPurchaseOrders, receivePurchaseOrder } from '../api/client';
import type { PurchaseOrderPayload, PurchaseOrdersListParams } from '../types';

export function usePurchaseOrders(params?: PurchaseOrdersListParams) {
  return useQuery({
    queryKey: purchaseOrdersKeys.list(params),
    queryFn: () => fetchPurchaseOrders(params),
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseOrderPayload) => createPurchaseOrder(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: purchaseOrdersKeys.all }); toast.success('Bon de commande créé'); },
  });
}

export function useReceivePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: receivePurchaseOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: purchaseOrdersKeys.all });
      qc.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Réception enregistrée — stock mis à jour');
    },
  });
}
