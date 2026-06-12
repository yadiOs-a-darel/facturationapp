import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, like } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const payloadSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export async function listCategories(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const conditions = [eq(schema.categories.tenantId, tenantId)];
  if (search) conditions.push(like(schema.categories.name, `%${search}%`));

  const rows = await db
    .select()
    .from(schema.categories)
    .where(and(...conditions))
    .orderBy(schema.categories.name);

  return res.json({ data: rows });
}

export async function createCategory(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = payloadSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  const id = randomUUID();
  await db.insert(schema.categories).values({
    id,
    tenantId,
    name: parse.data.name,
    code: parse.data.code ?? null,
    parentId: parse.data.parentId ?? null,
  });

  const [row] = await db.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1);
  return res.status(201).json(row);
}

export async function updateCategory(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const parse = payloadSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  await db
    .update(schema.categories)
    .set(parse.data)
    .where(and(eq(schema.categories.id, id), eq(schema.categories.tenantId, tenantId)));

  const [row] = await db
    .select()
    .from(schema.categories)
    .where(and(eq(schema.categories.id, id), eq(schema.categories.tenantId, tenantId)))
    .limit(1);

  if (!row) return res.status(404).json({ error: 'Catégorie introuvable' });
  return res.json(row);
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  await db
    .delete(schema.categories)
    .where(and(eq(schema.categories.id, id), eq(schema.categories.tenantId, tenantId)));

  return res.status(204).send();
}
