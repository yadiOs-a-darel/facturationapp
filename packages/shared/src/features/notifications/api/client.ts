import { apiClient } from '../../../lib/api-client';
import type { MessageRecipient, NotificationItem, SendMessagePayload } from '../types';

export async function fetchNotifications() {
  const { data } = await apiClient.get<{ data: NotificationItem[]; unreadCount: number }>(
    '/notifications',
  );
  return data;
}

export async function fetchUnreadNotificationCount() {
  const { data } = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
  return data;
}

export async function fetchMessageRecipients() {
  const { data } = await apiClient.get<{ data: MessageRecipient[] }>('/notifications/recipients');
  return data;
}

export async function sendNotificationMessage(payload: SendMessagePayload) {
  const { data } = await apiClient.post('/notifications/messages', payload);
  return data;
}

export async function markNotificationAsRead(id: string) {
  const { data } = await apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`);
  return data;
}

export async function markAllNotificationsAsRead() {
  const { data } = await apiClient.patch('/notifications/read-all');
  return data;
}
