import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { notificationsKeys } from '../../../lib/query';
import {
  fetchMessageRecipients,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  sendNotificationMessage,
} from '../api/client';
import type { SendMessagePayload } from '../types';

export function useNotifications() {
  return useQuery({
    queryKey: notificationsKeys.list,
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationsKeys.unreadCount,
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useMessageRecipients() {
  return useQuery({
    queryKey: notificationsKeys.recipients,
    queryFn: fetchMessageRecipients,
    staleTime: 60_000,
  });
}

export function useSendNotificationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => sendNotificationMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success('Message envoyé');
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Impossible d\'envoyer le message';
      toast.error(message);
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}
