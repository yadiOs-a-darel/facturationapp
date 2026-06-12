import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { suppliersKeys } from '../../../lib/query';
import { createSupplier, deleteSupplier, fetchSuppliers, updateSupplier } from '../api/client';
import type { SupplierPayload, SuppliersListParams } from '../types';

export function useSuppliers(params?: SuppliersListParams) {
  return useQuery({
    queryKey: suppliersKeys.list(params),
    queryFn: () => fetchSuppliers(params),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: suppliersKeys.all });
      toast.success('Fournisseur créé');
    },
  });
}

export function useUpdateSupplier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SupplierPayload>) => updateSupplier(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: suppliersKeys.all });
      toast.success('Fournisseur mis à jour');
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: suppliersKeys.all });
      toast.success('Fournisseur supprimé');
    },
  });
}
