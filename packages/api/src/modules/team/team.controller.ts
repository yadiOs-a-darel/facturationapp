import type { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'CASHIER']).default('CASHIER'),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(['ADMIN', 'CASHIER']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

function serializeUser(user: typeof schema.users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export async function listTeamUsers(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.tenantId, tenantId))
    .orderBy(schema.users.createdAt);

  return res.json({ data: rows.map(serializeUser) });
}

export async function createTeamUser(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = createUserSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  const [tenant] = await db.select().from(schema.tenants).where(eq(schema.tenants.id, tenantId)).limit(1);
  const allUsers = await db.select().from(schema.users).where(eq(schema.users.tenantId, tenantId));
  if (tenant && allUsers.length >= tenant.maxUsers) {
    return res.status(403).json({ error: 'Limite d\'utilisateurs atteinte pour votre abonnement' });
  }

  const existing = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.tenantId, tenantId), eq(schema.users.email, parse.data.email)))
    .limit(1);

  if (existing.length > 0) {
    return res.status(400).json({ error: 'Cet email est déjà utilisé' });
  }

  const now = new Date();
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(parse.data.password, 10);

  await db.insert(schema.users).values({
    id,
    tenantId,
    email: parse.data.email,
    passwordHash,
    firstName: parse.data.firstName,
    lastName: parse.data.lastName,
    phone: parse.data.phone ?? null,
    role: parse.data.role,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return res.status(201).json(serializeUser(user));
}

async function getTeamMember(tenantId: string, id: string) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.id, id), eq(schema.users.tenantId, tenantId)))
    .limit(1);
  return user;
}

export async function updateTeamUser(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const currentUserId = req.user?.userId;
  if (!tenantId || !currentUserId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const parse = updateUserSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  const target = await getTeamMember(tenantId, id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable' });

  if (target.role === 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Le super administrateur ne peut pas être modifié' });
  }

  if (id === currentUserId && parse.data.isActive === false) {
    return res.status(400).json({ error: 'Vous ne pouvez pas bloquer votre propre compte' });
  }

  const updates: Record<string, unknown> = {
    firstName: parse.data.firstName,
    lastName: parse.data.lastName,
    phone: parse.data.phone,
    role: parse.data.role,
    isActive: parse.data.isActive,
    updatedAt: new Date(),
  };

  if (parse.data.password) {
    updates.passwordHash = await bcrypt.hash(parse.data.password, 10);
  }

  for (const key of Object.keys(updates)) {
    if (updates[key] === undefined) delete updates[key];
  }

  await db
    .update(schema.users)
    .set(updates)
    .where(and(eq(schema.users.id, id), eq(schema.users.tenantId, tenantId)));

  const [user] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.id, id), eq(schema.users.tenantId, tenantId)))
    .limit(1);

  return res.json(serializeUser(user!));
}

export async function deleteTeamUser(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const currentUserId = req.user?.userId;
  if (!tenantId || !currentUserId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  if (id === currentUserId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
  }

  const target = await getTeamMember(tenantId, id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable' });

  if (target.role === 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Le super administrateur ne peut pas être supprimé' });
  }

  await db
    .delete(schema.users)
    .where(and(eq(schema.users.id, id), eq(schema.users.tenantId, tenantId)));

  return res.status(204).send();
}
