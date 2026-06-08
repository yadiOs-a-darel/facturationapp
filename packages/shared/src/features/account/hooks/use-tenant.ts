import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tenantKeys } from '../../../lib/query';
import { fetchMyTenant, updateMyTenant, uploadMyTenantLogo } from '../api/tenant-client';
import type { TenantUpdatePayload } from '../types';

export function useMyTenant() {
  return useQuery({
    queryKey: tenantKeys.all,
    queryFn: fetchMyTenant,
  });
}

export function useUploadTenantLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadMyTenantLogo(file),
    onSuccess: (data) => {
      queryClient.setQueryData(tenantKeys.all, data);
      toast.success('Logo mis à jour');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (error instanceof Error ? error.message : 'Une erreur est survenue');
      toast.error('Erreur lors de l\'upload du logo', { description: message });
    },
  });
}

export function useUpdateMyTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TenantUpdatePayload) => updateMyTenant(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(tenantKeys.all, data);
      toast.success('Paramètres de l\'entreprise mis à jour');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (error instanceof Error ? error.message : 'Une erreur est survenue');
      toast.error('Erreur lors de la mise à jour', { description: message });
    },
  });
}
