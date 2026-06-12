import type { Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { generateDocumentNumber } from '../../lib/numbering';
import { logAudit } from '../../lib/audit';
import { sendEmail, buildInvoiceEmailHtml, isEmailConfigured } from '../../lib/email';
import {
  computeTotals,
  insertInvoiceItems,
  restoreStockForItems,
  resolveInvoiceStatus,
  computeDueDate,
  type InvoiceItemInput,
} from './invoices.helpers';

function itemsFromDb(rows: (typeof schema.invoiceItems.$inferSelect)[]): InvoiceItemInput[] {
  return rows.map((item) => ({
    productId: item.productId ?? undefined,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    discountRate: Number(item.discountRate ?? 0),
    taxRate: Number(item.taxRate ?? 19),
  }));
}

export async function sendInvoiceHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (!invoice) return res.status(404).json({ error: 'Document introuvable' });
  if (invoice.status !== 'DRAFT') {
    return res.status(400).json({ error: 'Seuls les brouillons peuvent être envoyés' });
  }

  const items = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, id));

  const now = new Date();
  const paidAmount = parseFloat(String(invoice.paidAmount)) || 0;
  const totalTTC = parseFloat(String(invoice.totalTTC)) || 0;
  const status = resolveInvoiceStatus({
    paidAmount,
    totalTTC,
    dueDate: invoice.dueDate,
    now,
  });

  try {
    const { applyStockOut, applyStockIn, shouldApplyStock } = await import('./invoices.helpers');
    const stockMode = shouldApplyStock(invoice.type);

    await db.transaction(async (tx) => {
      if (stockMode) {
        for (const item of items) {
          if (!item.productId) continue;
          if (stockMode === 'OUT') {
            await applyStockOut(tx, {
              tenantId,
              productId: item.productId,
              quantity: Number(item.quantity),
              reference: id,
              reason: `Envoi ${invoice.number}`,
              userId,
              now,
            });
          } else {
            await applyStockIn(tx, {
              tenantId,
              productId: item.productId,
              quantity: Number(item.quantity),
              reference: id,
              reason: `Envoi avoir ${invoice.number}`,
              userId,
              now,
            });
          }
        }
      }

      await tx
        .update(schema.invoices)
        .set({ status, sentAt: now, updatedAt: now })
        .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)));
    });

    await logAudit({
      tenantId,
      userId,
      action: 'SEND',
      resource: 'Invoice',
      resourceId: id,
    });

    const [updated] = await db
      .select()
      .from(schema.invoices)
      .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
      .limit(1);

    return res.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Impossible d\'envoyer le document';
    return res.status(400).json({ error: message });
  }
}

export async function convertToInvoiceHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [source] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (!source) return res.status(404).json({ error: 'Document introuvable' });
  if (!['QUOTE', 'PROFORMA'].includes(source.type)) {
    return res.status(400).json({ error: 'Seuls devis et proformas peuvent être convertis' });
  }

  const sourceItems = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, id));

  const number = await generateDocumentNumber(tenantId, 'INVOICE');
  const items = itemsFromDb(sourceItems);
  const { subtotalHT, taxAmount, totalTTC } = computeTotals(items);
  const now = new Date();
  const invoiceId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(schema.invoices).values({
      id: invoiceId,
      tenantId,
      customerId: source.customerId,
      customerName: source.customerName,
      createdById: userId ?? null,
      number,
      type: 'INVOICE',
      issueDate: now,
      dueDate: source.dueDate,
      status: 'DRAFT',
      subtotalHT: String(subtotalHT.toFixed(2)),
      discountAmount: source.discountAmount,
      discountRate: source.discountRate,
      taxAmount: String(taxAmount.toFixed(2)),
      totalTTC: String(totalTTC.toFixed(2)),
      paidAmount: '0',
      notes: source.notes,
      terms: source.terms,
      sourceInvoiceId: id,
      isBackdated: false,
      createdAt: now,
      updatedAt: now,
    });

    for (const [index, item] of items.entries()) {
      const lineBase = item.quantity * item.unitPrice;
      const lineDiscount = (lineBase * (item.discountRate ?? 0)) / 100;
      const lineHT = lineBase - lineDiscount;
      const lineTax = (lineHT * (item.taxRate ?? 19)) / 100;
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
        totalHT: String(lineHT.toFixed(2)),
        totalTTC: String((lineHT + lineTax).toFixed(2)),
        order: index,
      });
    }
  });

  await logAudit({
    tenantId,
    userId,
    action: 'CONVERT',
    resource: 'Invoice',
    resourceId: invoiceId,
    newData: { sourceInvoiceId: id },
  });

  const [created] = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.id, invoiceId))
    .limit(1);

  return res.status(201).json(created);
}

export async function createCreditNoteHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [source] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (!source) return res.status(404).json({ error: 'Facture introuvable' });
  if (source.type !== 'INVOICE') {
    return res.status(400).json({ error: 'Un avoir ne peut être créé que depuis une facture' });
  }
  if (source.status === 'CANCELLED' || source.status === 'DRAFT') {
    return res.status(400).json({ error: 'Facture non éligible pour un avoir' });
  }

  const sourceItems = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, id));

  const number = await generateDocumentNumber(tenantId, 'CREDIT_NOTE');
  const items = itemsFromDb(sourceItems);
  const { subtotalHT, taxAmount, totalTTC } = computeTotals(items);
  const now = new Date();
  const creditNoteId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(schema.invoices).values({
      id: creditNoteId,
      tenantId,
      customerId: source.customerId,
      customerName: source.customerName,
      createdById: userId ?? null,
      number,
      type: 'CREDIT_NOTE',
      issueDate: now,
      dueDate: null,
      status: 'SENT',
      subtotalHT: String(subtotalHT.toFixed(2)),
      discountAmount: source.discountAmount,
      discountRate: source.discountRate,
      taxAmount: String(taxAmount.toFixed(2)),
      totalTTC: String(totalTTC.toFixed(2)),
      paidAmount: '0',
      notes: `Avoir sur facture ${source.number}`,
      sourceInvoiceId: id,
      sentAt: now,
      isBackdated: false,
      createdAt: now,
      updatedAt: now,
    });

    await insertInvoiceItems(tx, {
      tenantId,
      invoiceId: creditNoteId,
      invoiceNumber: number,
      documentType: 'CREDIT_NOTE',
      items,
      userId,
      now,
      applyStock: true,
    });
  });

  const [created] = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.id, creditNoteId))
    .limit(1);

  return res.status(201).json(created);
}

export async function sendInvoiceEmailHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [tenant] = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, tenantId))
    .limit(1);

  if (!isEmailConfigured(tenant)) {
    return res.status(503).json({
      error: 'Service email non configuré. Configurez le SMTP dans Administration → Email.',
    });
  }

  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (!invoice) return res.status(404).json({ error: 'Facture introuvable' });

  const [customer] = invoice.customerId
    ? await db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.id, invoice.customerId))
        .limit(1)
    : [undefined];

  if (!customer?.email) {
    return res.status(400).json({ error: 'Le client n\'a pas d\'adresse email' });
  }

  const html = buildInvoiceEmailHtml({
    companyName: tenant?.name ?? 'GestFacturation',
    invoiceNumber: invoice.number,
    totalTTC: String(invoice.totalTTC),
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : null,
  });

  await sendEmail({
    to: customer.email,
    subject: `Facture ${invoice.number} - ${tenant?.name ?? ''}`,
    html,
    from: tenant?.smtpFrom ?? tenant?.email ?? undefined,
    tenant,
  });

  return res.json({ success: true, sentTo: customer.email });
}

export { computeDueDate };
