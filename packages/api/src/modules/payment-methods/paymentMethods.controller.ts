import type { Response } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const upsertSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  isActive: z.boolean().optional(),
});

const DEFAULT_PAYMENT_METHODS = [
  { code: 'CASH', label: 'Espèces' },
  { code: 'CARD', label: 'Carte bancaire' },
  { code: 'TRANSFER', label: 'Virement' },
  { code: 'CHECK', label: 'Chèque' },
] as const;

async function ensureDefaultPaymentMethods(tenantId: string) {
  const existing = await db
    .select({ id: schema.paymentMethods.id })
    .from(schema.paymentMethods)
    .where(eq(schema.paymentMethods.tenantId, tenantId))
    .limit(1);

  if (existing.length > 0) return;

  const now = new Date();
  await db.insert(schema.paymentMethods).values(
    DEFAULT_PAYMENT_METHODS.map((method) => ({
      id: randomUUID(),
      tenantId,
      code: method.code,
      label: method.label,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })),
  );
}

export async function listPaymentMethods(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  await ensureDefaultPaymentMethods(tenantId);

  const methods = await db
    .select()
    .from(schema.paymentMethods)
    .where(and(eq(schema.paymentMethods.tenantId, tenantId), eq(schema.paymentMethods.isActive, true)))
    .orderBy(schema.paymentMethods.label);

  return res.json({ data: methods });
}

export async function createPaymentMethod(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = upsertSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const { code, label, isActive } = parse.data;
  const now = new Date();

  try {
    await db.insert(schema.paymentMethods).values({
      id: randomUUID(),
      tenantId,
      code,
      label,
      isActive: isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await db
      .select()
      .from(schema.paymentMethods)
      .where(and(eq(schema.paymentMethods.tenantId, tenantId), eq(schema.paymentMethods.code, code)))
      .limit(1);

    return res.status(201).json(created);
  } catch {
    return res.status(400).json({ error: 'Impossible de créer le mode de paiement' });
  }
}

export async function updatePaymentMethod(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(schema.paymentMethods)
    .where(and(eq(schema.paymentMethods.id, id), eq(schema.paymentMethods.tenantId, tenantId)))
    .limit(1);

  if (!existing) {
    return res.status(404).json({ error: 'Mode de paiement introuvable' });
  }

  const parse = upsertSchema.partial().safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const now = new Date();
  await db
    .update(schema.paymentMethods)
    .set({ ...parse.data, updatedAt: now })
    .where(eq(schema.paymentMethods.id, id));

  const [updated] = await db
    .select()
    .from(schema.paymentMethods)
    .where(eq(schema.paymentMethods.id, id))
    .limit(1);

  return res.json(updated);
}

export async function deletePaymentMethod(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(schema.paymentMethods)
    .where(and(eq(schema.paymentMethods.id, id), eq(schema.paymentMethods.tenantId, tenantId)))
    .limit(1);

  if (!existing) {
    return res.status(404).json({ error: 'Mode de paiement introuvable' });
  }

  await db
    .update(schema.paymentMethods)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(schema.paymentMethods.id, id));

  return res.status(204).send();
}
