import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QueryKeys } from '../../../lib/query';
import { fetchMyProfile, updateMyPassword, updateMyProfile } from '../api/profile-client';
import type { PasswordUpdatePayload, ProfileUpdatePayload } from '../types';

export const profileKeys = {
  all: ['profile'] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: fetchMyProfile,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateMyProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.all, data);
      queryClient.setQueryData(QueryKeys.session, (prev: { user: unknown } | null | undefined) =>
        prev ? { user: { ...prev.user as object, firstName: data.firstName, lastName: data.lastName } } : prev,
      );
      toast.success('Profil mis à jour');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (error instanceof Error ? error.message : 'Une erreur est survenue');
      toast.error('Erreur lors de la mise à jour du profil', { description: message });
    },
  });
}

export function useUpdateMyPassword() {
  return useMutation({
    mutationFn: (payload: PasswordUpdatePayload) => updateMyPassword(payload),
    onSuccess: () => {
      toast.success('Mot de passe modifié');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (error instanceof Error ? error.message : 'Une erreur est survenue');
      toast.error('Erreur lors du changement de mot de passe', { description: message });
    },
  });
}
