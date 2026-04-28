import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, like } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const listQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  lowStock: z
    .union([z.string().transform((v) => v === 'true'), z.boolean()])
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const productPayloadSchema = z.object({
  code: z.string().min(1),
  barcode: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  unit: z.string().optional(),
  purchasePrice: z.number().nonnegative().optional(),
  sellingPrice: z.number().nonnegative().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discountRate: z.number().min(0).max(100).optional(),
  stockQuantity: z.number().optional(),
  stockMin: z.number().optional(),
  stockMax: z.number().optional().nullable(),
  stockLocation: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isService: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
});

export async function listProducts(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = listQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const { search, categoryId, lowStock, page, limit } = parse.data;

  const conditions = [eq(schema.products.tenantId, tenantId)];
  if (categoryId) conditions.push(eq(schema.products.categoryId, categoryId));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(like(schema.products.name, pattern));
  }
  if (lowStock) {
    conditions.push(schema.products.stockQuantity.lte(schema.products.stockMin as any));
  }

  const offset = (page - 1) * limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(schema.products)
      .where(and(...conditions))
      .orderBy(schema.products.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(and(...conditions)),
  ]);

  const total = totalRows.length;
  const totalPages = Math.ceil(total / limit);

  return res.json({
    data: rows,
    meta: {
      total,
      page,
      perPage: limit,
      totalPages,
    },
  });
}

export async function getProductById(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const { id } = req.params;
  const rows = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.id, id), eq(schema.products.tenantId, tenantId)))
    .limit(1);

  const product = rows[0];
  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }
  return res.json(product);
}

export async function createProductHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = productPayloadSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const p = parse.data;

  const now = new Date();

  try {
    const id = randomUUID();
    await db.insert(schema.products).values({
      id,
      tenantId,
      code: p.code,
      barcode: p.barcode ?? null,
      name: p.name,
      description: p.description ?? null,
      unit: p.unit ?? 'pcs',
      purchasePrice: String(p.purchasePrice ?? 0),
      sellingPrice: String(p.sellingPrice ?? 0),
      taxRate: p.taxRate ?? 19,
      discountRate: p.discountRate ?? 0,
      stockQuantity: p.stockQuantity ?? 0,
      stockMin: p.stockMin ?? 0,
      stockMax: p.stockMax ?? null,
      stockLocation: p.stockLocation ?? null,
      image: p.image ?? null,
      isActive: p.isActive ?? true,
      isService: p.isService ?? false,
      categoryId: p.categoryId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await db
      .select()
      .from(schema.products)
      .where(and(eq(schema.products.id, id), eq(schema.products.tenantId, tenantId)))
      .limit(1);

    return res.status(201).json(created);
  } catch {
    return res.status(400).json({ error: 'Impossible de créer le produit' });
  }
}

export async function updateProductHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const parse = productPayloadSchema.partial().safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const existing = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.id, id), eq(schema.products.tenantId, tenantId)))
    .limit(1);

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  await db
    .update(schema.products)
    .set(parse.data)
    .where(and(eq(schema.products.id, id), eq(schema.products.tenantId, tenantId)));

  const [updated] = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.id, id), eq(schema.products.tenantId, tenantId)))
    .limit(1);

  return res.json(updated);
}

export async function deleteProductHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const existing = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.id, id), eq(schema.products.tenantId, tenantId)))
    .limit(1);

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  await db
    .delete(schema.products)
    .where(and(eq(schema.products.id, id), eq(schema.products.tenantId, tenantId)));

  return res.status(204).send();
}

