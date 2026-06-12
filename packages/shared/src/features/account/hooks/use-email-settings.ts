import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  fetchEmailSettings,
  testEmailSettings,
  updateEmailSettings,
  type UpdateEmailSettingsPayload,
} from '../api/email-settings-client';

export const emailSettingsKeys = {
  all: ['email-settings'] as const,
};

export function useEmailSettings() {
  return useQuery({
    queryKey: emailSettingsKeys.all,
    queryFn: fetchEmailSettings,
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEmailSettingsPayload) => updateEmailSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailSettingsKeys.all });
      toast.success('Configuration email enregistrée');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Erreur lors de l\'enregistrement';
      toast.error(message);
    },
  });
}

export function useTestEmailSettings() {
  return useMutation({
    mutationFn: (to?: string) => testEmailSettings(to),
    onSuccess: (data) => {
      toast.success('Email de test envoyé', { description: `Envoyé à ${data.sentTo}` });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Échec du test email';
      toast.error(message);
    },
  });
}
