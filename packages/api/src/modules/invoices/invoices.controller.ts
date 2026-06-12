import type { Response } from 'express';
import { z } from 'zod';
import { and, eq, gte, lte, desc, like, or, inArray, lt, gt, isNull, not, notInArray, sql } from 'drizzle-orm';
import { buildPaginationMeta, listPaginationSchema } from '../../lib/pagination';
import { randomUUID } from 'crypto';

import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { generateDocumentNumber } from '../../lib/numbering';
import { logAudit } from '../../lib/audit';
import {
  computeTotals,
  insertInvoiceItems,
  restoreStockForItems,
  EDITABLE_INVOICE_STATUSES,
  resolveInvoiceStatus,
  computeDueDate,
  type InvoiceItemInput,
} from './invoices.helpers';

const listQuerySchema = listPaginationSchema.extend({
  status: z.string().optional(),
  customerId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
});

function applyInvoiceStatusFilter(status: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (status === 'DRAFT' || status === 'CANCELLED') {
    return eq(schema.invoices.status, status);
  }
  if (status === 'PAID') {
    return and(
      not(eq(schema.invoices.status, 'DRAFT')),
      not(eq(schema.invoices.status, 'CANCELLED')),
      sql`CAST(${schema.invoices.paidAmount} AS DECIMAL(12,2)) >= CAST(${schema.invoices.totalTTC} AS DECIMAL(12,2))`,
    );
  }
  if (status === 'PARTIAL') {
    return and(
      gt(schema.invoices.paidAmount, 0),
      sql`CAST(${schema.invoices.paidAmount} AS DECIMAL(12,2)) < CAST(${schema.invoices.totalTTC} AS DECIMAL(12,2))`,
    );
  }
  if (status === 'OVERDUE') {
    return and(
      notInArray(schema.invoices.status, ['DRAFT', 'CANCELLED']),
      lt(schema.invoices.dueDate, today),
      sql`CAST(${schema.invoices.paidAmount} AS DECIMAL(12,2)) < CAST(${schema.invoices.totalTTC} AS DECIMAL(12,2))`,
    );
  }
  if (status === 'SENT') {
    return and(
      not(eq(schema.invoices.status, 'DRAFT')),
      not(eq(schema.invoices.status, 'CANCELLED')),
      eq(schema.invoices.paidAmount, 0),
      or(isNull(schema.invoices.dueDate), gte(schema.invoices.dueDate, today)),
    );
  }
  return eq(schema.invoices.status, status);
}

const optionalDateString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null || value === '') return null;
    return value;
  });

const optionalId = z
  .union([z.string(), z.literal(''), z.null()])
  .optional()
  .transform((value) => {
    if (value == null || value === '') return undefined;
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

const invoiceItemSchema = z.object({
  productId: optionalId,
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discountRate: z.number().min(0).max(100).optional().default(0),
  taxRate: z.number().min(0).max(100).optional().default(19),
});

const invoicePayloadSchema = z.object({
  customerId: optionalId,
  customerName: z.string().max(255).optional().nullable(),
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
  sendImmediately: z.boolean().optional().default(false),
  initialPaymentAmount: z.number().nonnegative().optional().default(0),
  isBackdated: z.boolean().optional().default(false),
  internalNotes: z.string().optional().nullable(),
  deliveryDate: optionalDateString,
  sourceInvoiceId: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'Au moins une ligne est requise'),
});

function enrichInvoiceRow<T extends { paidAmount: unknown; totalTTC: unknown; dueDate?: Date | null; status: string }>(
  row: T,
  now = new Date(),
): T & { status: string } {
  if (row.status === 'DRAFT' || row.status === 'CANCELLED') {
    return { ...row, status: row.status };
  }
  return {
    ...row,
    status: resolveInvoiceStatus({
      paidAmount: parseFloat(String(row.paidAmount)) || 0,
      totalTTC: parseFloat(String(row.totalTTC)) || 0,
      dueDate: row.dueDate,
      now,
    }),
  };
}

function resolveInitialPaymentAmount(
  payload: { markAsPaid?: boolean; initialPaymentAmount?: number },
  totalTTC: number,
): number {
  let amount = payload.initialPaymentAmount ?? 0;
  if (payload.markAsPaid && amount <= 0) {
    amount = totalTTC;
  }
  return Math.round(amount * 100) / 100;
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

  const { status, customerId, from, to, type, search, page, limit } = parse.data;

  const conditions = [eq(schema.invoices.tenantId, tenantId)];
  if (status) conditions.push(applyInvoiceStatusFilter(status));
  if (type) conditions.push(eq(schema.invoices.type, type));
  if (customerId) conditions.push(eq(schema.invoices.customerId, customerId));
  if (from) conditions.push(gte(schema.invoices.issueDate, new Date(from)));
  if (to) conditions.push(lte(schema.invoices.issueDate, new Date(to)));
  if (search) {
    const pattern = `%${search}%`;
    const matchingCustomers = await db
      .select({ id: schema.customers.id })
      .from(schema.customers)
      .where(and(eq(schema.customers.tenantId, tenantId), like(schema.customers.denomination, pattern)));
    const customerIds = matchingCustomers.map((c) => c.id);
    conditions.push(
      or(
        like(schema.invoices.number, pattern),
        like(schema.invoices.customerName, pattern),
        customerIds.length > 0 ? inArray(schema.invoices.customerId, customerIds) : sql`false`,
      )!,
    );
  }

  const offset = (page - 1) * limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(schema.invoices)
      .where(and(...conditions))
      .orderBy(desc(schema.invoices.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ id: schema.invoices.id })
      .from(schema.invoices)
      .where(and(...conditions)),
  ]);

  const total = totalRows.length;

  const now = new Date();
  return res.json({
    data: rows.map((row) => enrichInvoiceRow(row, now)),
    meta: buildPaginationMeta(total, page, limit),
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

  const [customer] = invoice.customerId
    ? await db
        .select()
        .from(schema.customers)
        .where(
          and(eq(schema.customers.id, invoice.customerId), eq(schema.customers.tenantId, tenantId)),
        )
        .limit(1)
    : [undefined];

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

  const enriched = enrichInvoiceRow(invoice);
  const customerForResponse =
    customer ??
    (invoice.customerName
      ? {
          denomination: invoice.customerName,
          address: null,
          city: null,
          phone: null,
          email: null,
          taxNumber: null,
        }
      : null);
  return res.json({ ...enriched, customer: customerForResponse, tenant, items, payments });
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

  const number = await generateDocumentNumber(tenantId, payload.type);
  const { subtotalHT, taxAmount, totalTTC } = computeTotals(payload.items as InvoiceItemInput[]);
  const paidAmount = resolveInitialPaymentAmount(payload, totalTTC);

  if (paidAmount > 0 && !payload.paymentMethod) {
    return res.status(400).json({ error: 'Le mode de paiement est requis lors d\'un paiement' });
  }
  if (paidAmount > totalTTC + 0.01) {
    return res.status(400).json({ error: 'Le montant versé ne peut pas dépasser le total TTC' });
  }

  let customerDiscount = 0;
  let paymentTermDays = 30;
  if (payload.customerId) {
    const [customer] = await db
      .select()
      .from(schema.customers)
      .where(
        and(eq(schema.customers.id, payload.customerId), eq(schema.customers.tenantId, tenantId)),
      )
      .limit(1);
    if (customer) {
      customerDiscount = Number(customer.discountRate) || 0;
      paymentTermDays = customer.paymentTermDays ?? 30;
    }
  }

  try {
    let createdInvoice: Record<string, unknown>;
    const now = new Date();
    const issueDate = payload.issueDate ? new Date(payload.issueDate) : now;
    const dueDate = payload.dueDate
      ? new Date(payload.dueDate)
      : payload.type === 'INVOICE'
        ? computeDueDate(issueDate, paymentTermDays)
        : null;
    const backdated =
      payload.isBackdated || (payload.issueDate ? isDateInPast(payload.issueDate) : false);

    const asDraft = !payload.sendImmediately && !payload.markAsPaid && paidAmount <= 0;
    const status = asDraft
      ? 'DRAFT'
      : resolveInvoiceStatus({ paidAmount, totalTTC, dueDate, now });

    await db.transaction(async (tx) => {
      const customerIdToUse = payload.customerId?.trim() || null;
      const customerNameToUse =
        customerIdToUse ? null : payload.customerName?.trim() || null;
      const invoiceId = randomUUID();

      await tx.insert(schema.invoices).values({
        id: invoiceId,
        tenantId,
        customerId: customerIdToUse,
        customerName: customerNameToUse,
        createdById: userId ?? null,
        number,
        type: payload.type,
        issueDate,
        dueDate,
        status,
        subtotalHT: String(subtotalHT.toFixed(2)),
        discountAmount: String((payload.discountAmount ?? 0).toFixed(2)),
        discountRate: payload.discountRate ?? customerDiscount,
        taxAmount: String(taxAmount.toFixed(2)),
        totalTTC: String(totalTTC.toFixed(2)),
        paidAmount: String(paidAmount.toFixed(2)),
        notes: payload.notes ?? null,
        internalNotes: payload.internalNotes ?? null,
        deliveryDate: payload.deliveryDate ? new Date(payload.deliveryDate) : null,
        terms: payload.terms ?? null,
        paymentMethod: paidAmount > 0 ? payload.paymentMethod ?? null : null,
        paymentDate: paidAmount > 0 ? now : null,
        paymentRef: paidAmount > 0 ? payload.paymentRef ?? null : null,
        sourceInvoiceId: payload.sourceInvoiceId ?? null,
        sentAt: asDraft ? null : now,
        isBackdated: backdated,
        createdAt: now,
        updatedAt: now,
      });

      await insertInvoiceItems(tx, {
        tenantId,
        invoiceId,
        invoiceNumber: number,
        documentType: payload.type,
        items: payload.items as InvoiceItemInput[],
        userId,
        now,
        applyStock: !asDraft,
      });

      if (paidAmount > 0 && payload.paymentMethod) {
        await tx.insert(schema.payments).values({
          id: randomUUID(),
          invoiceId,
          createdById: userId ?? null,
          amount: String(paidAmount.toFixed(2)),
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

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE',
      resource: 'Invoice',
      resourceId: (createdInvoice as { id: string }).id,
    });

    return res.status(201).json(createdInvoice);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Impossible de créer la facture';
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
          documentType: payload.type ?? invoice.type,
          items: normalizedItems,
          userId,
          now,
          applyStock: invoice.status !== 'DRAFT',
        });
      }

      const issueDate = payload.issueDate ? new Date(payload.issueDate) : invoice.issueDate;
      const backdated =
        payload.isBackdated ??
        (payload.issueDate ? isDateInPast(payload.issueDate) : invoice.isBackdated);

      await tx
        .update(schema.invoices)
        .set({
          customerId:
            payload.customerId !== undefined
              ? payload.customerId?.trim() || null
              : invoice.customerId,
          customerName:
            payload.customerId !== undefined
              ? payload.customerId?.trim()
                ? null
                : payload.customerName?.trim() || null
              : payload.customerName !== undefined
                ? payload.customerName?.trim() || null
                : invoice.customerName,
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
  } catch {
    return res.status(400).json({ error: 'Impossible de mettre à jour la facture' });
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
  } catch {
    return res.status(400).json({ error: 'Impossible d\'annuler la facture' });
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
  } catch {
    return res.status(400).json({ error: 'Impossible de supprimer la facture' });
  }
}
