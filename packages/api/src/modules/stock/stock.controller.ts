import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, gte, lte, desc, like, inArray } from 'drizzle-orm';
import { buildPaginationMeta, listPaginationSchema } from '../../lib/pagination';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const movementsQuerySchema = listPaginationSchema.extend({
  productId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']).optional(),
  search: z.string().optional(),
});

const alertsQuerySchema = listPaginationSchema;

const stockAdjustmentSchema = z.object({
  productId: z.string(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number(),
  unitCost: z.number().optional(),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

export async function listStockMovements(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = movementsQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }
  const { productId, from, to, type, search, page, limit } = parse.data;

  const conditions = [eq(schema.stockMovements.tenantId, tenantId)];
  if (productId) {
    conditions.push(eq(schema.stockMovements.productId, productId));
  }
  if (type) {
    conditions.push(eq(schema.stockMovements.type, type));
  }
  if (from) {
    conditions.push(gte(schema.stockMovements.createdAt, new Date(from)));
  }
  if (to) {
    conditions.push(lte(schema.stockMovements.createdAt, new Date(to)));
  }
  if (search) {
    const pattern = `%${search}%`;
    const matchingProducts = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(and(eq(schema.products.tenantId, tenantId), like(schema.products.name, pattern)));
    const productIds = matchingProducts.map((p) => p.id);
    if (productIds.length === 0) {
      return res.json({ data: [], meta: buildPaginationMeta(0, page, limit) });
    }
    conditions.push(inArray(schema.stockMovements.productId, productIds));
  }

  const offset = (page - 1) * limit;
  const where = and(...conditions);

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(schema.stockMovements)
      .where(where)
      .orderBy(desc(schema.stockMovements.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ id: schema.stockMovements.id }).from(schema.stockMovements).where(where),
  ]);

  const total = totalRows.length;
  return res.json({ data: rows, meta: buildPaginationMeta(total, page, limit) });
}

export async function listStockAlerts(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = alertsQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }
  const { page, limit } = parse.data;
  const offset = (page - 1) * limit;

  const where = and(
    eq(schema.products.tenantId, tenantId),
    eq(schema.products.isActive, true),
    lte(schema.products.stockQuantity, schema.products.stockMin),
  );

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        productId: schema.products.id,
        code: schema.products.code,
        name: schema.products.name,
        stockQuantity: schema.products.stockQuantity,
        stockMin: schema.products.stockMin,
      })
      .from(schema.products)
      .where(where)
      .orderBy(desc(schema.products.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ id: schema.products.id }).from(schema.products).where(where),
  ]);

  const total = totalRows.length;
  return res.json({ data: rows, meta: buildPaginationMeta(total, page, limit) });
}

export async function adjustStockHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = stockAdjustmentSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const { productId, type, quantity, unitCost, reason, reference } = parse.data;

  const productRows = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.id, productId), eq(schema.products.tenantId, tenantId)))
    .limit(1);

  if (productRows.length === 0) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  const product = productRows[0];

  let newStock = Number(product.stockQuantity) || 0;
  if (type === 'IN') {
    newStock += quantity;
  } else if (type === 'OUT') {
    newStock -= quantity;
  } else if (type === 'ADJUSTMENT') {
    newStock = quantity;
  }

  if (newStock < 0) {
    return res.status(400).json({ error: 'Stock insuffisant' });
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(schema.stockMovements).values({
      id: randomUUID(),
      tenantId,
      productId,
      type,
      quantity: type === 'OUT' ? -quantity : quantity,
      unitCost: unitCost?.toString(),
      reason: reason || null,
      reference: reference || null,
      createdAt: now,
      createdBy: userId,
    });

    await tx
      .update(schema.products)
      .set({ stockQuantity: newStock, updatedAt: now })
      .where(eq(schema.products.id, productId));
  });

  return res.status(201).json({ message: 'Stock mis à jour', newStock });
}

export async function getCurrentStock(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const { productId } = req.params;

  const productRows = await db
    .select({
      id: schema.products.id,
      code: schema.products.code,
      name: schema.products.name,
      stockQuantity: schema.products.stockQuantity,
      stockMin: schema.products.stockMin,
      stockMax: schema.products.stockMax,
      stockLocation: schema.products.stockLocation,
      unit: schema.products.unit,
    })
    .from(schema.products)
    .where(and(eq(schema.products.id, productId), eq(schema.products.tenantId, tenantId)))
    .limit(1);

  if (productRows.length === 0) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  const movements = await db
    .select()
    .from(schema.stockMovements)
    .where(and(eq(schema.stockMovements.productId, productId), eq(schema.stockMovements.tenantId, tenantId)))
    .orderBy(desc(schema.stockMovements.createdAt))
    .limit(10);

  return res.json({
    product: productRows[0],
    recentMovements: movements,
  });
}
