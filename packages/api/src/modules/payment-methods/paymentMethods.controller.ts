import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import type { AuthenticatedRequest } from '../../middleware/auth';

const upsertSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  isActive: z.boolean().optional(),
});

export async function listPaymentMethods(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const methods = await prisma.paymentMethod.findMany({
    where: { tenantId, isActive: true },
    orderBy: { label: 'asc' },
  });

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

  try {
    const created = await prisma.paymentMethod.create({
      data: {
        tenantId,
        code,
        label,
        isActive: isActive ?? true,
      },
    });
    return res.status(201).json(created);
  } catch {
    return res.status(400).json({ error: 'Impossible de créer le mode de paiement' });
  }
}

export async function updatePaymentMethod(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const existing = await prisma.paymentMethod.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return res.status(404).json({ error: 'Mode de paiement introuvable' });
  }

  const parse = upsertSchema.partial().safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const updated = await prisma.paymentMethod.update({
    where: { id },
    data: parse.data,
  });

  return res.json(updated);
}

export async function deletePaymentMethod(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const existing = await prisma.paymentMethod.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return res.status(404).json({ error: 'Mode de paiement introuvable' });
  }

  // Soft delete: désactiver plutôt que supprimer
  await prisma.paymentMethod.update({
    where: { id },
    data: { isActive: false },
  });

  return res.status(204).send();
}

