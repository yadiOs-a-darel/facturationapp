import type { Response } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { ensureDefaultNumberingConfigs } from '../../lib/numbering';

export async function listNumberingConfigs(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  await ensureDefaultNumberingConfigs(tenantId);

  const rows = await db
    .select()
    .from(schema.numberingConfig)
    .where(eq(schema.numberingConfig.tenantId, tenantId));

  return res.json({ data: rows });
}

const updateSchema = z.object({
  prefix: z.string().min(1).optional(),
  padding: z.number().int().min(1).max(10).optional(),
  currentNumber: z.number().int().min(0).optional(),
});

export async function updateNumberingConfig(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const parse = updateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  await db
    .update(schema.numberingConfig)
    .set({ ...parse.data, updatedAt: new Date() })
    .where(and(eq(schema.numberingConfig.id, id), eq(schema.numberingConfig.tenantId, tenantId)));

  const [row] = await db
    .select()
    .from(schema.numberingConfig)
    .where(and(eq(schema.numberingConfig.id, id), eq(schema.numberingConfig.tenantId, tenantId)))
    .limit(1);

  if (!row) return res.status(404).json({ error: 'Configuration introuvable' });
  return res.json(row);
}
