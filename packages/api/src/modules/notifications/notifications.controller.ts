import type { Response } from 'express';
import { randomUUID } from 'crypto';
import { and, desc, eq, isNull, lte } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const sendMessageSchema = z.object({
  recipientId: z.string().min(1),
  title: z.string().min(1).max(255).optional(),
  body: z.string().min(1).max(2000),
});

function isAdminRole(role: string): boolean {
  const r = role.toUpperCase();
  return r === 'ADMIN' || r === 'SUPER_ADMIN';
}

function isCashierRole(role: string): boolean {
  return role.toUpperCase() === 'CASHIER';
}

function canSendMessage(senderRole: string, recipientRole: string): boolean {
  const senderIsAdmin = isAdminRole(senderRole);
  const recipientIsAdmin = isAdminRole(recipientRole);
  const senderIsCashier = isCashierRole(senderRole);
  const recipientIsCashier = isCashierRole(recipientRole);

  if (senderIsAdmin && recipientIsCashier) return true;
  if (senderIsCashier && recipientIsAdmin) return true;
  if (senderIsAdmin && recipientIsAdmin) return true;
  return false;
}

async function fetchStockAlertItems(tenantId: string) {
  const rows = await db
    .select({
      productId: schema.products.id,
      code: schema.products.code,
      name: schema.products.name,
      stockQuantity: schema.products.stockQuantity,
      stockMin: schema.products.stockMin,
    })
    .from(schema.products)
    .where(
      and(
        eq(schema.products.tenantId, tenantId),
        eq(schema.products.isActive, true),
        lte(schema.products.stockQuantity, schema.products.stockMin),
      ),
    )
    .orderBy(schema.products.stockQuantity)
    .limit(20);

  return rows.map((p) => ({
    id: `stock:${p.productId}`,
    type: 'STOCK_ALERT' as const,
    title: 'Stock bas',
    body: `${p.name} (${p.code}) : ${Number(p.stockQuantity)} restant(s), seuil ${Number(p.stockMin)}`,
    readAt: null as Date | null,
    createdAt: new Date().toISOString(),
    metadata: {
      productId: p.productId,
      code: p.code,
      stockQuantity: Number(p.stockQuantity),
      stockMin: Number(p.stockMin),
    },
    sender: null,
    isRead: false,
  }));
}

export async function listNotifications(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) return res.status(401).json({ error: 'Non authentifié' });

  const [messages, stockAlerts] = await Promise.all([
    db
      .select({
        notification: schema.notifications,
        senderFirstName: schema.users.firstName,
        senderLastName: schema.users.lastName,
        senderRole: schema.users.role,
      })
      .from(schema.notifications)
      .leftJoin(schema.users, eq(schema.notifications.senderId, schema.users.id))
      .where(
        and(
          eq(schema.notifications.tenantId, tenantId),
          eq(schema.notifications.recipientId, userId),
          eq(schema.notifications.type, 'MESSAGE'),
        ),
      )
      .orderBy(desc(schema.notifications.createdAt))
      .limit(50),
    fetchStockAlertItems(tenantId),
  ]);

  const messageItems = messages.map((row) => ({
    id: row.notification.id,
    type: 'MESSAGE' as const,
    title: row.notification.title,
    body: row.notification.body,
    readAt: row.notification.readAt,
    createdAt: row.notification.createdAt,
    metadata: null,
    sender: row.notification.senderId
      ? {
          id: row.notification.senderId,
          firstName: row.senderFirstName ?? '',
          lastName: row.senderLastName ?? '',
          role: row.senderRole ?? '',
        }
      : null,
    isRead: Boolean(row.notification.readAt),
  }));

  const all = [...stockAlerts, ...messageItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const unreadCount =
    stockAlerts.length + messageItems.filter((m) => !m.isRead).length;

  return res.json({ data: all, unreadCount });
}

export async function getUnreadCount(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) return res.status(401).json({ error: 'Non authentifié' });

  const [unreadMessages, stockAlerts] = await Promise.all([
    db
      .select({ id: schema.notifications.id })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.tenantId, tenantId),
          eq(schema.notifications.recipientId, userId),
          eq(schema.notifications.type, 'MESSAGE'),
          isNull(schema.notifications.readAt),
        ),
      ),
    fetchStockAlertItems(tenantId),
  ]);

  return res.json({ unreadCount: unreadMessages.length + stockAlerts.length });
}

export async function listMessageRecipients(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  const senderRole = req.user?.role;
  if (!tenantId || !userId || !senderRole) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const users = await db
    .select({
      id: schema.users.id,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      email: schema.users.email,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(and(eq(schema.users.tenantId, tenantId), eq(schema.users.isActive, true)));

  const recipients = users
    .filter((u) => u.id !== userId && canSendMessage(senderRole, u.role))
    .map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
    }));

  return res.json({ data: recipients });
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  const senderRole = req.user?.role;
  if (!tenantId || !userId || !senderRole) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const parse = sendMessageSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const { recipientId, body } = parse.data;
  const title = parse.data.title?.trim() || 'Message';

  if (recipientId === userId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas vous envoyer un message.' });
  }

  const [recipient] = await db
    .select()
    .from(schema.users)
    .where(
      and(
        eq(schema.users.id, recipientId),
        eq(schema.users.tenantId, tenantId),
        eq(schema.users.isActive, true),
      ),
    )
    .limit(1);

  if (!recipient) {
    return res.status(404).json({ error: 'Destinataire introuvable.' });
  }

  if (!canSendMessage(senderRole, recipient.role)) {
    return res.status(403).json({
      error: 'Vous ne pouvez envoyer des messages qu\'entre administrateur et caissier.',
    });
  }

  const now = new Date();
  const id = randomUUID();

  await db.insert(schema.notifications).values({
    id,
    tenantId,
    recipientId,
    senderId: userId,
    type: 'MESSAGE',
    title,
    body,
    readAt: null,
    createdAt: now,
  });

  return res.status(201).json({
    data: {
      id,
      type: 'MESSAGE',
      title,
      body,
      createdAt: now,
    },
  });
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) return res.status(401).json({ error: 'Non authentifié' });

  const { id } = req.params;
  if (id.startsWith('stock:')) {
    return res.json({ success: true });
  }

  const now = new Date();

  await db
    .update(schema.notifications)
    .set({ readAt: now })
    .where(
      and(
        eq(schema.notifications.id, id),
        eq(schema.notifications.tenantId, tenantId),
        eq(schema.notifications.recipientId, userId),
        isNull(schema.notifications.readAt),
      ),
    );

  return res.json({ success: true });
}

export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) return res.status(401).json({ error: 'Non authentifié' });

  const now = new Date();

  await db
    .update(schema.notifications)
    .set({ readAt: now })
    .where(
      and(
        eq(schema.notifications.tenantId, tenantId),
        eq(schema.notifications.recipientId, userId),
        eq(schema.notifications.type, 'MESSAGE'),
        isNull(schema.notifications.readAt),
      ),
    );

  return res.json({ success: true });
}
