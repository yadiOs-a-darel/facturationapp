import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, like, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { buildPaginationMeta, listPaginationSchema } from '../../lib/pagination';

const listQuerySchema = listPaginationSchema.extend({
  search: z.string().optional(),
});

const payloadSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  paymentTermDays: z.number().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export async function listSuppliers(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = listQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const { search, page, limit } = parse.data;
  const conditions = [eq(schema.suppliers.tenantId, tenantId)];
  if (search) conditions.push(like(schema.suppliers.name, `%${search}%`));

  const offset = (page - 1) * limit;
  const where = and(...conditions);

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(schema.suppliers)
      .where(where)
      .orderBy(desc(schema.suppliers.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ id: schema.suppliers.id }).from(schema.suppliers).where(where),
  ]);

  const total = totalRows.length;
  return res.json({ data: rows, meta: buildPaginationMeta(total, page, limit) });
}

export async function createSupplier(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = payloadSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  const now = new Date();
  const id = randomUUID();
  await db.insert(schema.suppliers).values({
    id,
    tenantId,
    ...parse.data,
    createdAt: now,
    updatedAt: now,
  });

  const [created] = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id)).limit(1);
  return res.status(201).json(created);
}

export async function updateSupplier(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const parse = payloadSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  await db
    .update(schema.suppliers)
    .set({ ...parse.data, updatedAt: new Date() })
    .where(and(eq(schema.suppliers.id, id), eq(schema.suppliers.tenantId, tenantId)));

  const [updated] = await db
    .select()
    .from(schema.suppliers)
    .where(and(eq(schema.suppliers.id, id), eq(schema.suppliers.tenantId, tenantId)))
    .limit(1);

  if (!updated) return res.status(404).json({ error: 'Fournisseur introuvable' });
  return res.json(updated);
}

export async function deleteSupplier(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  await db
    .delete(schema.suppliers)
    .where(and(eq(schema.suppliers.id, id), eq(schema.suppliers.tenantId, tenantId)));

  return res.status(204).send();
}
