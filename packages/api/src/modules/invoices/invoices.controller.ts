import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, gte, lte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const listQuerySchema = z.object({
  status: z.string().optional(),
  customerId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  type: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const invoiceItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discountRate: z.number().min(0).max(100).optional().default(0),
  taxRate: z.number().min(0).max(100).optional().default(19),
});

const invoicePayloadSchema = z.object({
  customerId: z.string().min(1),
  type: z
    .enum(['INVOICE', 'PROFORMA', 'QUOTE', 'CREDIT_NOTE', 'DELIVERY_NOTE'])
    .optional()
    .default('INVOICE'),
  issueDate: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  discountAmount: z.number().optional().default(0),
  discountRate: z.number().min(0).max(100).optional().default(0),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1),
});

function computeTotals(items: z.infer<typeof invoiceItemSchema>[]) {
  let subtotalHT = 0;
  let taxAmount = 0;

  for (const item of items) {
    const lineBase = item.quantity * item.unitPrice;
    const lineDiscount = (lineBase * (item.discountRate ?? 0)) / 100;
    const lineHT = lineBase - lineDiscount;
    const lineTax = (lineHT * (item.taxRate ?? 0)) / 100;
    subtotalHT += lineHT;
    taxAmount += lineTax;
  }

  const totalTTC = subtotalHT + taxAmount;

  return { subtotalHT, taxAmount, totalTTC };
}

async function generateInvoiceNumber(tenantId: string) {
  const documentType = 'INVOICE';
  const year = new Date().getFullYear();

  let currentNumber = 1;
  let prefix = `FAC-${year}-`;
  const padding = 4;

  await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(schema.numberingConfig)
      .where(and(eq(schema.numberingConfig.tenantId, tenantId), eq(schema.numberingConfig.documentType, documentType)))
      .limit(1);

    const now = new Date();

    if (existing.length === 0) {
      await tx.insert(schema.numberingConfig).values({
        id: randomUUID(),
        tenantId,
        documentType,
        prefix,
        currentNumber: 1,
        padding,
        createdAt: now,
        updatedAt: now,
      });
      currentNumber = 1;
    } else {
      const cfg = existing[0];
      prefix = cfg.prefix;
      currentNumber = (cfg.currentNumber ?? 0) + 1;
      await tx
        .update(schema.numberingConfig)
        .set({ currentNumber })
        .where(eq(schema.numberingConfig.id, cfg.id));
    }
  });

  const seq = currentNumber.toString().padStart(padding, '0');
  return `${prefix}${seq}`;
}

export async function listInvoices(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = listQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const { status, customerId, from, to, type, page, limit } = parse.data;

  const conditions = [eq(schema.invoices.tenantId, tenantId)];
  if (status) conditions.push(eq(schema.invoices.status, status));
  if (type) conditions.push(eq(schema.invoices.type, type));
  if (customerId) conditions.push(eq(schema.invoices.customerId, customerId));
  if (from) conditions.push(gte(schema.invoices.issueDate, new Date(from)));
  if (to) conditions.push(lte(schema.invoices.issueDate, new Date(to)));

  const offset = (page - 1) * limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(schema.invoices)
      .where(and(...conditions))
      .orderBy(schema.invoices.issueDate)
      .limit(limit)
      .offset(offset),
    db
      .select({ id: schema.invoices.id })
      .from(schema.invoices)
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

export async function getInvoiceById(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (!invoice) {
    return res.status(404).json({ error: 'Facture introuvable' });
  }

  const [customer] = await db
    .select()
    .from(schema.customers)
    .where(and(eq(schema.customers.id, invoice.customerId), eq(schema.customers.tenantId, tenantId)))
    .limit(1);

  const items = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, id));

  const payments = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.invoiceId, id));

  return res.json({ ...invoice, customer, items, payments });
}

export async function createInvoiceHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = invoicePayloadSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const payload = parse.data;

  const number = await generateInvoiceNumber(tenantId);
  const { subtotalHT, taxAmount, totalTTC } = computeTotals(payload.items);

  try {
    let createdInvoice: any;
    const now = new Date();

    await db.transaction(async (tx) => {
      const invoiceId = randomUUID();

      await tx.insert(schema.invoices).values({
        id: invoiceId,
        tenantId,
        customerId: payload.customerId,
        createdById: userId ?? null,
        number,
        type: payload.type,
        issueDate: payload.issueDate ? new Date(payload.issueDate) : now,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        status: 'DRAFT',
        subtotalHT: String(subtotalHT.toFixed(2)),
        discountAmount: String((payload.discountAmount ?? 0).toFixed(2)),
        discountRate: payload.discountRate ?? 0,
        taxAmount: String(taxAmount.toFixed(2)),
        totalTTC: String(totalTTC.toFixed(2)),
        paidAmount: '0',
        notes: payload.notes ?? null,
        terms: payload.terms ?? null,
        createdAt: now,
        updatedAt: now,
      });

      for (const [index, item] of payload.items.entries()) {
        await tx.insert(schema.invoiceItems).values({
          id: randomUUID(),
          invoiceId,
          productId: item.productId ?? null,
          description: item.description,
          quantity: item.quantity,
          unit: 'pcs',
          unitPrice: String(item.unitPrice.toFixed(2)),
          discountRate: item.discountRate ?? 0,
          taxRate: item.taxRate ?? 19,
          totalHT: String((item.quantity * item.unitPrice).toFixed(2)),
          totalTTC: String(
            (item.quantity * item.unitPrice * (1 + (item.taxRate ?? 19) / 100)).toFixed(2),
          ),
          order: index,
        });

        if (item.productId) {
          await tx
            .update(schema.products)
            .set({
              stockQuantity:
                (schema.products.stockQuantity as any) -
                (item.quantity as unknown as number),
            })
            .where(and(eq(schema.products.id, item.productId), eq(schema.products.tenantId, tenantId)));
        }
      }

      const [invoiceRow] = await tx
        .select()
        .from(schema.invoices)
        .where(and(eq(schema.invoices.id, invoiceId), eq(schema.invoices.tenantId, tenantId)))
        .limit(1);

      const items = await tx
        .select()
        .from(schema.invoiceItems)
        .where(eq(schema.invoiceItems.invoiceId, invoiceId));

      createdInvoice = { ...invoiceRow, items };
    });

    return res.status(201).json(createdInvoice);
  } catch {
    return res.status(400).json({ error: 'Impossible de créer la facture' });
  }
}

export async function updateInvoiceHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const existing = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Facture introuvable' });
  }

  const baseSchema = invoicePayloadSchema.partial().omit({ items: true });
  const parse = baseSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const data: any = parse.data;
  if (data.issueDate) data.issueDate = new Date(data.issueDate);
  if (data.dueDate) data.dueDate = new Date(data.dueDate);

  await db
    .update(schema.invoices)
    .set(data)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)));

  const [updated] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  return res.json(updated);
}

export async function deleteInvoiceHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const existing = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);
  if (existing.length === 0) {
    return res.status(404).json({ error: 'Facture introuvable' });
  }

  await db
    .delete(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)));

  return res.status(204).send();
}

