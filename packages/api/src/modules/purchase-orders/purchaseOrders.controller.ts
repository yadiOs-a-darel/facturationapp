import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, desc } from 'drizzle-orm';
import { buildPaginationMeta, listPaginationSchema } from '../../lib/pagination';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { generateDocumentNumber } from '../../lib/numbering';

const itemSchema = z.object({
  productId: z.string(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().optional().default(19),
});

const payloadSchema = z.object({
  supplierId: z.string(),
  orderDate: z.string().optional(),
  expectedDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1),
});

function computePoTotals(items: z.infer<typeof itemSchema>[]) {
  let subtotalHT = 0;
  let taxAmount = 0;
  for (const item of items) {
    const lineHT = item.quantity * item.unitPrice;
    const lineTax = (lineHT * (item.taxRate ?? 19)) / 100;
    subtotalHT += lineHT;
    taxAmount += lineTax;
  }
  return { subtotalHT, taxAmount, totalTTC: subtotalHT + taxAmount };
}

export async function listPurchaseOrders(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = listPaginationSchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const { page, limit } = parse.data;
  const offset = (page - 1) * limit;
  const where = eq(schema.purchaseOrders.tenantId, tenantId);

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(schema.purchaseOrders)
      .where(where)
      .orderBy(desc(schema.purchaseOrders.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ id: schema.purchaseOrders.id }).from(schema.purchaseOrders).where(where),
  ]);

  const total = totalRows.length;
  return res.json({ data: rows, meta: buildPaginationMeta(total, page, limit) });
}

export async function getPurchaseOrder(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [po] = await db
    .select()
    .from(schema.purchaseOrders)
    .where(and(eq(schema.purchaseOrders.id, id), eq(schema.purchaseOrders.tenantId, tenantId)))
    .limit(1);

  if (!po) return res.status(404).json({ error: 'Bon de commande introuvable' });

  const items = await db
    .select()
    .from(schema.purchaseOrderItems)
    .where(eq(schema.purchaseOrderItems.purchaseOrderId, id));

  return res.json({ ...po, items });
}

export async function createPurchaseOrder(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = payloadSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  const number = await generateDocumentNumber(tenantId, 'PURCHASE_ORDER');
  const { subtotalHT, taxAmount, totalTTC } = computePoTotals(parse.data.items);
  const now = new Date();
  const id = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(schema.purchaseOrders).values({
      id,
      tenantId,
      supplierId: parse.data.supplierId,
      number,
      status: 'DRAFT',
      orderDate: parse.data.orderDate ? new Date(parse.data.orderDate) : now,
      expectedDate: parse.data.expectedDate ? new Date(parse.data.expectedDate) : null,
      subtotalHT: String(subtotalHT.toFixed(2)),
      taxAmount: String(taxAmount.toFixed(2)),
      totalTTC: String(totalTTC.toFixed(2)),
      notes: parse.data.notes ?? null,
      createdAt: now,
      updatedAt: now,
    });

    for (const item of parse.data.items) {
      const lineHT = item.quantity * item.unitPrice;
      await tx.insert(schema.purchaseOrderItems).values({
        id: randomUUID(),
        purchaseOrderId: id,
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        receivedQty: 0,
        unitPrice: String(item.unitPrice.toFixed(2)),
        taxRate: item.taxRate ?? 19,
        totalHT: String(lineHT.toFixed(2)),
      });
    }
  });

  const [row] = await db.select().from(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id)).limit(1);
  return res.status(201).json(row);
}

export async function receivePurchaseOrder(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [po] = await db
    .select()
    .from(schema.purchaseOrders)
    .where(and(eq(schema.purchaseOrders.id, id), eq(schema.purchaseOrders.tenantId, tenantId)))
    .limit(1);

  if (!po) return res.status(404).json({ error: 'Bon de commande introuvable' });
  if (po.status === 'RECEIVED') {
    return res.status(400).json({ error: 'Bon de commande déjà réceptionné' });
  }

  const items = await db
    .select()
    .from(schema.purchaseOrderItems)
    .where(eq(schema.purchaseOrderItems.purchaseOrderId, id));

  const now = new Date();
  const { applyStockIn } = await import('../invoices/invoices.helpers');

  await db.transaction(async (tx) => {
    for (const item of items) {
      const qty = Number(item.quantity) - Number(item.receivedQty ?? 0);
      if (qty <= 0) continue;

      await applyStockIn(tx, {
        tenantId,
        productId: item.productId,
        quantity: qty,
        reference: id,
        reason: `Réception BC ${po.number}`,
        userId,
        now,
      });

      await tx
        .update(schema.purchaseOrderItems)
        .set({ receivedQty: Number(item.quantity) })
        .where(eq(schema.purchaseOrderItems.id, item.id));
    }

    await tx
      .update(schema.purchaseOrders)
      .set({ status: 'RECEIVED', receivedDate: now, updatedAt: now })
      .where(eq(schema.purchaseOrders.id, id));
  });

  const [updated] = await db.select().from(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, id)).limit(1);
  return res.json(updated);
}
