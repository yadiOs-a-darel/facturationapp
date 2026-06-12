export type NotificationType = 'MESSAGE' | 'STOCK_ALERT';

export interface NotificationSender {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  metadata: {
    productId?: string;
    code?: string;
    stockQuantity?: number;
    stockMin?: number;
  } | null;
  sender: NotificationSender | null;
  isRead: boolean;
}

export interface MessageRecipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface SendMessagePayload {
  recipientId: string;
  title?: string;
  body: string;
}
