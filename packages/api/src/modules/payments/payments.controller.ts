import type { Response } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

const createPaymentSchema = z.object({
  amount: z.number().positive(),
  methodCode: z.string().min(1),
  reference: z.string().optional().nullable(),
  date: z.string().optional(), // ISO string
  notes: z.string().optional().nullable(),
});

export async function createPaymentHandler(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const { id: invoiceId } = req.params;

  const parse = createPaymentSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
  }
  const { amount, methodCode, reference, date, notes } = parse.data;

  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, invoiceId), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (!invoice) {
    return res.status(404).json({ error: 'Facture introuvable' });
  }
  if (invoice.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Impossible de payer une facture annulée' });
  }

  const [method] = await db
    .select()
    .from(schema.paymentMethods)
    .where(
      and(
        eq(schema.paymentMethods.tenantId, tenantId),
        eq(schema.paymentMethods.code, methodCode),
        eq(schema.paymentMethods.isActive, true),
      ),
    )
    .limit(1);

  if (!method) {
    return res.status(400).json({ error: 'Mode de paiement invalide' });
  }

  const now = new Date();
  const paymentDate = date ? new Date(date) : now;

  let result: any;

  await db.transaction(async (tx) => {
    const paymentId = randomUUID();
    await tx.insert(schema.payments).values({
      id: paymentId,
      invoiceId,
      amount: String(amount.toFixed(2)),
      method: method.code,
      reference: reference ?? null,
      date: paymentDate,
      notes: notes ?? null,
      createdAt: now,
    });

    const currentPaid = parseFloat(String(invoice.paidAmount)) || 0;
    const invoiceTotal = parseFloat(String(invoice.totalTTC)) || 0;
    const newPaidAmount = currentPaid + amount;

    let newStatus = invoice.status;
    if (newPaidAmount >= invoiceTotal) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL';
    }

    await tx
      .update(schema.invoices)
      .set({
        paidAmount: String(newPaidAmount.toFixed(2)),
        status: newStatus,
        paymentMethod: method.code,
        paymentDate,
        paymentRef: reference ?? invoice.paymentRef,
      })
      .where(and(eq(schema.invoices.id, invoiceId), eq(schema.invoices.tenantId, tenantId)));

    const [payment] = await tx
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.id, paymentId))
      .limit(1);

    const [updatedInvoice] = await tx
      .select()
      .from(schema.invoices)
      .where(and(eq(schema.invoices.id, invoiceId), eq(schema.invoices.tenantId, tenantId)))
      .limit(1);

    result = { payment, invoice: updatedInvoice };
  });

  return res.status(201).json(result);
}

