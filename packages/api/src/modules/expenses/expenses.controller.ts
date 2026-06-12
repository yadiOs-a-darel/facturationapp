import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { buildPaginationMeta, listPaginationSchema } from '../../lib/pagination';

const listQuerySchema = listPaginationSchema.extend({
  from: z.string().optional(),
  to: z.string().optional(),
});

const payloadSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  method: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function listExpenses(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = listQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const { from, to, page, limit } = parse.data;
  const conditions = [eq(schema.expenses.tenantId, tenantId)];
  if (from) conditions.push(gte(schema.expenses.date, new Date(from)));
  if (to) conditions.push(lte(schema.expenses.date, new Date(to)));

  const offset = (page - 1) * limit;
  const where = and(...conditions);

  const [rows, totalRows, amountRows] = await Promise.all([
    db
      .select()
      .from(schema.expenses)
      .where(where)
      .orderBy(desc(schema.expenses.date), desc(schema.expenses.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ id: schema.expenses.id }).from(schema.expenses).where(where),
    db.select({ amount: schema.expenses.amount }).from(schema.expenses).where(where),
  ]);

  const total = totalRows.length;
  const amountTotal = amountRows.reduce((sum, r) => sum + Number(r.amount), 0);

  return res.json({
    data: rows,
    meta: { ...buildPaginationMeta(total, page, limit), amountTotal },
  });
}

export async function createExpense(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = payloadSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  const now = new Date();
  const id = randomUUID();
  const userId = req.user?.userId;

  await db.insert(schema.expenses).values({
    id,
    tenantId,
    ...parse.data,
    date: new Date(parse.data.date),
    createdById: userId ?? null,
    createdAt: now,
  });

  const [created] = await db.select().from(schema.expenses).where(eq(schema.expenses.id, id)).limit(1);
  return res.status(201).json(created);
}

export async function updateExpense(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const parse = payloadSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  const updates: Record<string, unknown> = { ...parse.data };
  if (parse.data.date) {
    updates.date = new Date(parse.data.date);
  }

  await db
    .update(schema.expenses)
    .set(updates)
    .where(and(eq(schema.expenses.id, id), eq(schema.expenses.tenantId, tenantId)));

  const [updated] = await db
    .select()
    .from(schema.expenses)
    .where(and(eq(schema.expenses.id, id), eq(schema.expenses.tenantId, tenantId)))
    .limit(1);

  if (!updated) return res.status(404).json({ error: 'Dépense introuvable' });
  return res.json(updated);
}

export async function deleteExpense(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  await db
    .delete(schema.expenses)
    .where(and(eq(schema.expenses.id, id), eq(schema.expenses.tenantId, tenantId)));

  return res.status(204).send();
}
