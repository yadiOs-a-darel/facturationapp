import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

function serializeUser(user: typeof schema.users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  return res.json(serializeUser(user));
}

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const parse = updateProfileSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  await db
    .update(schema.users)
    .set({ ...parse.data, updatedAt: new Date() })
    .where(eq(schema.users.id, userId));

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  return res.json(serializeUser(user));
}

export async function updatePassword(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const parse = updatePasswordSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  const valid = await bcrypt.compare(parse.data.currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
  }

  const passwordHash = await bcrypt.hash(parse.data.newPassword, 10);

  await db
    .update(schema.users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(schema.users.id, userId));

  return res.json({ success: true });
}
