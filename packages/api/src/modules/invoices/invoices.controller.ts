import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, gte, lte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import {
  computeTotals,
  insertInvoiceItems,
  restoreStockForItems,
  EDITABLE_INVOICE_STATUSES,
  type InvoiceItemInput,
} from './invoices.helpers';

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

const optionalDateString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null || value === '') return null;
    return value;
  });

const invoicePayloadSchema = z.object({
  customerId: z.string().optional(),
  type: z
    .enum(['INVOICE', 'PROFORMA', 'QUOTE', 'CREDIT_NOTE', 'DELIVERY_NOTE'])
    .optional()
    .default('INVOICE'),
  issueDate: optionalDateString,
  dueDate: optionalDateString,
  discountAmount: z.number().optional().default(0),
  discountRate: z.number().min(0).max(100).optional().default(0),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  paymentRef: z.string().optional().nullable(),
  markAsPaid: z.boolean().optional().default(false),
  isBackdated: z.boolean().optional().default(false),
  items: z.array(invoiceItemSchema).min(1, 'Au moins une ligne est requise'),
});

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
      .where(
        and(
          eq(schema.numberingConfig.tenantId, tenantId),
          eq(schema.numberingConfig.documentType, documentType),
        ),
      )
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

async function resolveCustomerId(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  tenantId: string,
  customerId: string | undefined,
  now: Date,
) {
  if (customerId?.trim()) return customerId;

  const defaultCustomerCode = 'WALKIN';
  let [defaultCustomer] = await tx
    .select()
    .from(schema.customers)
    .where(
      and(
        eq(schema.customers.tenantId, tenantId),
        eq(schema.customers.code, defaultCustomerCode),
      ),
    )
    .limit(1);

  if (!defaultCustomer) {
    [defaultCustomer] = await tx
      .insert(schema.customers)
      .values({
        id: randomUUID(),
        tenantId,
        code: defaultCustomerCode,
        type: 'RETAIL',
        denomination: 'Client Lambda',
        createdAt: now,
        updatedAt: now,
      })
      .returning();
  }

  return defaultCustomer.id;
}

function isDateInPast(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const issue = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  issue.setHours(0, 0, 0, 0);
  return issue < today;
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
    meta: { total, page, perPage: limit, totalPages },
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

  const [tenant] = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, tenantId))
    .limit(1);

  const items = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, id));

  const payments = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.invoiceId, id));

  return res.json({ ...invoice, customer, tenant, items, payments });
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

  if (payload.markAsPaid && !payload.paymentMethod) {
    return res.status(400).json({ error: 'Le mode de paiement est requis pour valider le paiement' });
  }

  const number = await generateInvoiceNumber(tenantId);
  const { subtotalHT, taxAmount, totalTTC } = computeTotals(payload.items as InvoiceItemInput[]);

  try {
    let createdInvoice: Record<string, unknown>;
    const now = new Date();
    const issueDate = payload.issueDate ? new Date(payload.issueDate) : now;
    const backdated =
      payload.isBackdated || (payload.issueDate ? isDateInPast(payload.issueDate) : false);

    const status = payload.markAsPaid ? 'PAID' : 'SENT';
    const paidAmount = payload.markAsPaid ? totalTTC : 0;

    await db.transaction(async (tx) => {
      const customerIdToUse = await resolveCustomerId(tx, tenantId, payload.customerId, now);
      const invoiceId = randomUUID();

      await tx.insert(schema.invoices).values({
        id: invoiceId,
        tenantId,
        customerId: customerIdToUse,
        createdById: userId ?? null,
        number,
        type: payload.type,
        issueDate,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        status,
        subtotalHT: String(subtotalHT.toFixed(2)),
        discountAmount: String((payload.discountAmount ?? 0).toFixed(2)),
        discountRate: payload.discountRate ?? 0,
        taxAmount: String(taxAmount.toFixed(2)),
        totalTTC: String(totalTTC.toFixed(2)),
        paidAmount: String(paidAmount.toFixed(2)),
        notes: payload.notes ?? null,
        terms: payload.terms ?? null,
        paymentMethod: payload.paymentMethod ?? null,
        paymentDate: payload.markAsPaid ? now : null,
        paymentRef: payload.paymentRef ?? null,
        isBackdated: backdated,
        createdAt: now,
        updatedAt: now,
      });

      await insertInvoiceItems(tx, {
        tenantId,
        invoiceId,
        invoiceNumber: number,
        items: payload.items as InvoiceItemInput[],
        userId,
        now,
      });

      if (payload.markAsPaid && payload.paymentMethod) {
        await tx.insert(schema.payments).values({
          id: randomUUID(),
          invoiceId,
          amount: String(totalTTC.toFixed(2)),
          method: payload.paymentMethod,
          reference: payload.paymentRef ?? null,
          date: now,
          notes: 'Paiement à la création',
          createdAt: now,
        });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Impossible de créer la facture';
    return res.status(400).json({ error: message });
  }
}

export async function updateInvoiceHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
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

  if (!EDITABLE_INVOICE_STATUSES.includes(invoice.status as (typeof EDITABLE_INVOICE_STATUSES)[number])) {
    return res.status(400).json({
      error: 'Cette facture ne peut plus être modifiée. Annulez-la si nécessaire.',
    });
  }

  const updateSchema = invoicePayloadSchema.partial();
  const parse = updateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }

  const payload = parse.data;
  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      const itemsToUse =
        payload.items ?? (await tx.select().from(schema.invoiceItems).where(eq(schema.invoiceItems.invoiceId, id)));

      const normalizedItems: InvoiceItemInput[] = (payload.items
        ? payload.items
        : itemsToUse.map((item) => ({
            productId: item.productId ?? undefined,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            discountRate: Number(item.discountRate ?? 0),
            taxRate: Number(item.taxRate ?? 19),
          }))) as InvoiceItemInput[];

      const { subtotalHT, taxAmount, totalTTC } = computeTotals(normalizedItems);

      if (payload.items) {
        await restoreStockForItems(tx, {
          tenantId,
          invoiceId: id,
          invoiceNumber: invoice.number,
          userId,
          now,
        });

        await tx.delete(schema.invoiceItems).where(eq(schema.invoiceItems.invoiceId, id));

        await insertInvoiceItems(tx, {
          tenantId,
          invoiceId: id,
          invoiceNumber: invoice.number,
          items: normalizedItems,
          userId,
          now,
        });
      }

      const issueDate = payload.issueDate ? new Date(payload.issueDate) : invoice.issueDate;
      const backdated =
        payload.isBackdated ??
        (payload.issueDate ? isDateInPast(payload.issueDate) : invoice.isBackdated);

      await tx
        .update(schema.invoices)
        .set({
          customerId: payload.customerId ?? invoice.customerId,
          type: payload.type ?? invoice.type,
          issueDate,
          dueDate:
            payload.dueDate !== undefined
              ? payload.dueDate
                ? new Date(payload.dueDate)
                : null
              : invoice.dueDate,
          subtotalHT: String(subtotalHT.toFixed(2)),
          taxAmount: String(taxAmount.toFixed(2)),
          totalTTC: String(totalTTC.toFixed(2)),
          discountAmount: String((payload.discountAmount ?? Number(invoice.discountAmount)).toFixed(2)),
          discountRate: payload.discountRate ?? invoice.discountRate,
          notes: payload.notes !== undefined ? payload.notes : invoice.notes,
          terms: payload.terms !== undefined ? payload.terms : invoice.terms,
          paymentMethod:
            payload.paymentMethod !== undefined ? payload.paymentMethod : invoice.paymentMethod,
          isBackdated: backdated,
          updatedAt: now,
        })
        .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)));
    });

    const [updated] = await db
      .select()
      .from(schema.invoices)
      .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
      .limit(1);

    const items = await db
      .select()
      .from(schema.invoiceItems)
      .where(eq(schema.invoiceItems.invoiceId, id));

    return res.json({ ...updated, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Impossible de mettre à jour la facture';
    return res.status(400).json({ error: message });
  }
}

export async function cancelInvoiceHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
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

  if (invoice.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Facture déjà annulée' });
  }

  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      await restoreStockForItems(tx, {
        tenantId,
        invoiceId: id,
        invoiceNumber: invoice.number,
        userId,
        now,
      });

      await tx
        .update(schema.invoices)
        .set({ status: 'CANCELLED', updatedAt: now })
        .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)));
    });

    const [updated] = await db
      .select()
      .from(schema.invoices)
      .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
      .limit(1);

    return res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Impossible d\'annuler la facture';
    return res.status(400).json({ error: message });
  }
}

export async function deleteInvoiceHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
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

  if (invoice.status === 'PAID' || invoice.status === 'PARTIAL') {
    return res.status(400).json({
      error: 'Une facture payée ne peut pas être supprimée. Utilisez l\'annulation.',
    });
  }

  if (invoice.status === 'CANCELLED') {
    await db.delete(schema.invoices).where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)));
    return res.status(204).send();
  }

  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      await restoreStockForItems(tx, {
        tenantId,
        invoiceId: id,
        invoiceNumber: invoice.number,
        userId,
        now,
      });

      await tx.delete(schema.invoiceItems).where(eq(schema.invoiceItems.invoiceId, id));
      await tx.delete(schema.payments).where(eq(schema.payments.invoiceId, id));
      await tx.delete(schema.invoices).where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)));
    });

    return res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Impossible de supprimer la facture';
    return res.status(400).json({ error: message });
  }
}
