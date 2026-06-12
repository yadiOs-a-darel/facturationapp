import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth';
import {
  getUnreadCount,
  listMessageRecipients,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  sendMessage,
} from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware);

notificationsRouter.get('/', listNotifications);
notificationsRouter.get('/unread-count', getUnreadCount);
notificationsRouter.get('/recipients', listMessageRecipients);
notificationsRouter.post('/messages', sendMessage);
notificationsRouter.patch('/read-all', markAllNotificationsRead);
notificationsRouter.patch('/:id/read', markNotificationRead);
