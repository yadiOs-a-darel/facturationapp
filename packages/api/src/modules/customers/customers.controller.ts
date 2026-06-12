import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, like, desc, or } from 'drizzle-orm';
import { buildPaginationMeta, listPaginationSchema } from '../../lib/pagination';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const listQuerySchema = listPaginationSchema.extend({
  search: z.string().optional(),
  type: z.string().optional(),
});

const customerPayloadSchema = z.object({
  code: z.string().min(1),
  type: z.enum(['WHOLESALE', 'RETAIL', 'ORGANIZATION', 'MINISTRY', 'OTHER']).optional(),
  denomination: z.string().min(1),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  phone2: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  wilaya: z.string().optional().nullable(),
  country: z.string().optional(),
  taxNumber: z.string().optional().nullable(),
  discountRate: z.number().optional().nullable(),
  creditLimit: z.number().optional().nullable(),
  paymentTermDays: z.number().optional().nullable(),
  currency: z.string().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export async function listCustomers(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = listQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }
  const { search, type, page, limit } = parse.data;

  const conditions = [eq(schema.customers.tenantId, tenantId)];
  if (type) {
    conditions.push(eq(schema.customers.type, type));
  }
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(like(schema.customers.denomination, pattern), like(schema.customers.code, pattern))!,
    );
  }

  const offset = (page - 1) * limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(schema.customers)
      .where(and(...conditions))
      .orderBy(desc(schema.customers.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ id: schema.customers.id })
      .from(schema.customers)
      .where(and(...conditions)),
  ]);

  const total = totalRows.length;

  return res.json({
    data: rows,
    meta: buildPaginationMeta(total, page, limit),
  });
}

export async function getCustomerById(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const { id } = req.params;

  const rows = await db
    .select()
    .from(schema.customers)
    .where(and(eq(schema.customers.id, id), eq(schema.customers.tenantId, tenantId)))
    .limit(1);

  const customer = rows[0];

  if (!customer) {
    return res.status(404).json({ error: 'Client introuvable' });
  }

  return res.json(customer);
}

export async function createCustomerHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = customerPayloadSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const payload = parse.data;

  const now = new Date();

  try {
    const id = randomUUID();
    await db.insert(schema.customers).values({
      id,
      tenantId,
      code: payload.code,
      type: payload.type ?? 'RETAIL',
      denomination: payload.denomination,
      contactName: payload.contactName ?? null,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      phone2: payload.phone2 ?? null,
      address: payload.address ?? null,
      city: payload.city ?? null,
      wilaya: payload.wilaya ?? null,
      country: payload.country ?? 'DZ',
      taxNumber: payload.taxNumber ?? null,
      discountRate: payload.discountRate ?? 0,
      creditLimit: payload.creditLimit ?? 0,
      paymentTermDays: payload.paymentTermDays ?? 30,
      currency: payload.currency ?? 'DZD',
      isActive: payload.isActive ?? true,
      notes: payload.notes ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await db
      .select()
      .from(schema.customers)
      .where(and(eq(schema.customers.id, id), eq(schema.customers.tenantId, tenantId)))
      .limit(1);

    return res.status(201).json(created);
  } catch {
    return res.status(400).json({ error: 'Impossible de créer le client' });
  }
}

export async function updateCustomerHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const parse = customerPayloadSchema.partial().safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const existing = await db
    .select()
    .from(schema.customers)
    .where(and(eq(schema.customers.id, id), eq(schema.customers.tenantId, tenantId)))
    .limit(1);

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Client introuvable' });
  }

  await db
    .update(schema.customers)
    .set(parse.data)
    .where(and(eq(schema.customers.id, id), eq(schema.customers.tenantId, tenantId)));

  const [updated] = await db
    .select()
    .from(schema.customers)
    .where(and(eq(schema.customers.id, id), eq(schema.customers.tenantId, tenantId)))
    .limit(1);

  return res.json(updated);
}

export async function deleteCustomerHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const existing = await db
    .select()
    .from(schema.customers)
    .where(and(eq(schema.customers.id, id), eq(schema.customers.tenantId, tenantId)))
    .limit(1);

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Client introuvable' });
  }

  await db
    .delete(schema.customers)
    .where(and(eq(schema.customers.id, id), eq(schema.customers.tenantId, tenantId)));

  return res.status(204).send();
}

