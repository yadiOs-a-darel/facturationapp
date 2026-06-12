import type { Response } from 'express';
import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { resolveInvoiceStatus } from '../invoices/invoices.helpers';

export async function listPayments(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : undefined;

  const payments = await db
    .select({
      payment: schema.payments,
      invoice: schema.invoices,
      customerName: schema.customers.denomination,
    })
    .from(schema.payments)
    .innerJoin(schema.invoices, eq(schema.payments.invoiceId, schema.invoices.id))
    .leftJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
    .where(
      customerId
        ? and(eq(schema.invoices.tenantId, tenantId), eq(schema.invoices.customerId, customerId))
        : eq(schema.invoices.tenantId, tenantId),
    )
    .orderBy(desc(schema.payments.date))
    .limit(100);

  return res.json({
    data: payments.map((p) => ({
      ...p.payment,
      invoiceNumber: p.invoice.number,
      customerName: p.customerName,
    })),
  });
}

export async function deletePayment(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [payment] = await db
    .select({ payment: schema.payments, invoice: schema.invoices })
    .from(schema.payments)
    .innerJoin(schema.invoices, eq(schema.payments.invoiceId, schema.invoices.id))
    .where(and(eq(schema.payments.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (!payment) return res.status(404).json({ error: 'Paiement introuvable' });

  const now = new Date();
  const invoice = payment.invoice;
  const amount = parseFloat(String(payment.payment.amount));
  const currentPaid = parseFloat(String(invoice.paidAmount)) || 0;
  const newPaid = Math.max(0, currentPaid - amount);
  const totalTTC = parseFloat(String(invoice.totalTTC)) || 0;

  await db.transaction(async (tx) => {
    await tx.delete(schema.payments).where(eq(schema.payments.id, id));
    await tx
      .update(schema.invoices)
      .set({
        paidAmount: String(newPaid.toFixed(2)),
        status: resolveInvoiceStatus({
          baseStatus: invoice.status === 'DRAFT' ? 'DRAFT' : undefined,
          paidAmount: newPaid,
          totalTTC,
          dueDate: invoice.dueDate,
          now,
        }),
        updatedAt: now,
      })
      .where(eq(schema.invoices.id, invoice.id));
  });

  return res.status(204).send();
}

export const paymentsRouter = Router();
paymentsRouter.use(authMiddleware);
paymentsRouter.get('/', listPayments);
paymentsRouter.delete('/:id', requireAdmin, deletePayment);
