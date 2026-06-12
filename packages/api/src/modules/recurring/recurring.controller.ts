import type { Response } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { generateDocumentNumber } from '../../lib/numbering';
import { computeTotals, insertInvoiceItems, type InvoiceItemInput } from '../invoices/invoices.helpers';

const itemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discountRate: z.number().optional().default(0),
  taxRate: z.number().optional().default(19),
});

const payloadSchema = z.object({
  customerId: z.string().optional().nullable(),
  label: z.string().min(1),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  nextRunAt: z.string(),
  items: z.array(itemSchema).min(1),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

function addFrequency(date: Date, frequency: string): Date {
  const next = new Date(date);
  if (frequency === 'WEEKLY') next.setDate(next.getDate() + 7);
  else if (frequency === 'MONTHLY') next.setMonth(next.getMonth() + 1);
  else next.setFullYear(next.getFullYear() + 1);
  return next;
}

export async function listRecurring(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const rows = await db
    .select()
    .from(schema.recurringInvoices)
    .where(eq(schema.recurringInvoices.tenantId, tenantId));

  return res.json({
    data: rows.map((r) => ({
      ...r,
      items: JSON.parse(r.itemsJson) as InvoiceItemInput[],
    })),
  });
}

export async function createRecurring(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = payloadSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Données invalides' });

  const now = new Date();
  const id = randomUUID();

  await db.insert(schema.recurringInvoices).values({
    id,
    tenantId,
    customerId: parse.data.customerId ?? null,
    label: parse.data.label,
    frequency: parse.data.frequency,
    nextRunAt: new Date(parse.data.nextRunAt),
    itemsJson: JSON.stringify(parse.data.items),
    notes: parse.data.notes ?? null,
    terms: parse.data.terms ?? null,
    isActive: parse.data.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  });

  const [row] = await db
    .select()
    .from(schema.recurringInvoices)
    .where(eq(schema.recurringInvoices.id, id))
    .limit(1);

  return res.status(201).json(row);
}

export async function runRecurring(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [recurring] = await db
    .select()
    .from(schema.recurringInvoices)
    .where(and(eq(schema.recurringInvoices.id, id), eq(schema.recurringInvoices.tenantId, tenantId)))
    .limit(1);

  if (!recurring || !recurring.isActive) {
    return res.status(404).json({ error: 'Facture récurrente introuvable ou inactive' });
  }

  const items = JSON.parse(recurring.itemsJson) as InvoiceItemInput[];
  const number = await generateDocumentNumber(tenantId, 'INVOICE');
  const { subtotalHT, taxAmount, totalTTC } = computeTotals(items);
  const now = new Date();
  const invoiceId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(schema.invoices).values({
      id: invoiceId,
      tenantId,
      customerId: recurring.customerId,
      createdById: userId ?? null,
      number,
      type: 'INVOICE',
      issueDate: now,
      dueDate: null,
      status: 'DRAFT',
      subtotalHT: String(subtotalHT.toFixed(2)),
      discountAmount: '0',
      discountRate: 0,
      taxAmount: String(taxAmount.toFixed(2)),
      totalTTC: String(totalTTC.toFixed(2)),
      paidAmount: '0',
      notes: recurring.notes,
      terms: recurring.terms,
      isBackdated: false,
      createdAt: now,
      updatedAt: now,
    });

    await insertInvoiceItems(tx, {
      tenantId,
      invoiceId,
      invoiceNumber: number,
      documentType: 'INVOICE',
      items,
      userId,
      now,
      applyStock: false,
    });

    await tx
      .update(schema.recurringInvoices)
      .set({
        lastRunAt: now,
        nextRunAt: addFrequency(now, recurring.frequency),
        updatedAt: now,
      })
      .where(eq(schema.recurringInvoices.id, id));
  });

  const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, invoiceId)).limit(1);
  return res.status(201).json(invoice);
}

export async function deleteRecurring(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  await db
    .delete(schema.recurringInvoices)
    .where(and(eq(schema.recurringInvoices.id, id), eq(schema.recurringInvoices.tenantId, tenantId)));

  return res.status(204).send();
}
