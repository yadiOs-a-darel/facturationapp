import type { Response } from 'express';
import { and, eq, gte, inArray, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db, schema } from '../../lib/db';
import {
  buildCashierDailyEmailHtml,
  isEmailConfigured,
  sendEmail,
} from '../../lib/email';
import type { AuthenticatedRequest } from '../../middleware/auth';

type ActivityType =
  | 'INVOICE'
  | 'DELIVERY_NOTE'
  | 'QUOTE'
  | 'CREDIT_NOTE'
  | 'PAYMENT'
  | 'CANCELLATION'
  | 'EXPENSE'
  | 'DRAFT';

interface DailyActivity {
  id: string;
  type: ActivityType;
  label: string;
  reference: string;
  amount: number | null;
  status: string | null;
  at: string;
  details: string | null;
}

interface CashierSummary {
  userId: string;
  firstName: string;
  lastName: string;
  invoicesCount: number;
  paymentsTotal: number;
  paymentsCount: number;
  cancellationsCount: number;
  deliveryNotesCount: number;
  expensesTotal: number;
  expensesCount: number;
  draftsCount: number;
}

function getDayBounds(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59.999`);
  return { start, end };
}

function invoiceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    INVOICE: 'Facture',
    DELIVERY_NOTE: 'Bon de livraison',
    QUOTE: 'Devis',
    PROFORMA: 'Proforma',
    CREDIT_NOTE: 'Avoir',
  };
  return map[type] ?? type;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'Brouillon',
    SENT: 'En cours',
    PARTIAL: 'Paiement partiel',
    PAID: 'Payée',
    OVERDUE: 'En retard',
    CANCELLED: 'Annulée',
  };
  return map[status] ?? status;
}

function mapInvoiceActivity(
  inv: typeof schema.invoices.$inferSelect,
  customerName: string | null,
  kind: 'created' | 'cancelled',
): DailyActivity {
  const type =
    inv.type === 'DELIVERY_NOTE'
      ? 'DELIVERY_NOTE'
      : inv.type === 'CREDIT_NOTE'
        ? 'CREDIT_NOTE'
        : inv.type === 'QUOTE'
          ? 'QUOTE'
          : inv.status === 'DRAFT'
            ? 'DRAFT'
            : 'INVOICE';

  const label =
    kind === 'cancelled'
      ? 'Annulation'
      : invoiceTypeLabel(inv.type);

  return {
    id: `${kind}-${inv.id}`,
    type: kind === 'cancelled' ? 'CANCELLATION' : type,
    label,
    reference: inv.number,
    amount: Number(inv.totalTTC),
    status: statusLabel(inv.status),
    at: (kind === 'cancelled' ? inv.updatedAt : inv.createdAt).toISOString(),
    details: customerName ? `Client : ${customerName}` : null,
  };
}

async function buildCashierDailyData(tenantId: string, date: string) {
  const { start, end } = getDayBounds(date);

  const cashiers = await db
    .select({
      id: schema.users.id,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
    })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.tenantId, tenantId),
        eq(schema.users.isActive, true),
        eq(schema.users.role, 'CASHIER'),
      ),
    );

  const cashierIds = cashiers.map((c) => c.id);

  if (cashierIds.length === 0) {
    return {
      date,
      cashiers: [],
      totals: {
        invoicesCount: 0,
        paymentsTotal: 0,
        cancellationsCount: 0,
        deliveryNotesCount: 0,
        expensesTotal: 0,
        activityCount: 0,
      },
    };
  }

  const [invoicesCreated, invoicesCancelled, paymentsRows, expensesRows] = await Promise.all([
    db
      .select({
        invoice: schema.invoices,
        customerName: schema.customers.denomination,
      })
      .from(schema.invoices)
      .leftJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
      .where(
        and(
          eq(schema.invoices.tenantId, tenantId),
          inArray(schema.invoices.createdById, cashierIds),
          gte(schema.invoices.createdAt, start),
          lte(schema.invoices.createdAt, end),
        ),
      ),
    db
      .select({
        invoice: schema.invoices,
        customerName: schema.customers.denomination,
      })
      .from(schema.invoices)
      .leftJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
      .where(
        and(
          eq(schema.invoices.tenantId, tenantId),
          eq(schema.invoices.status, 'CANCELLED'),
          inArray(schema.invoices.createdById, cashierIds),
          gte(schema.invoices.updatedAt, start),
          lte(schema.invoices.updatedAt, end),
        ),
      ),
    db
      .select({
        payment: schema.payments,
        invoice: schema.invoices,
        customerName: schema.customers.denomination,
      })
      .from(schema.payments)
      .innerJoin(schema.invoices, eq(schema.payments.invoiceId, schema.invoices.id))
      .leftJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
      .where(
        and(
          eq(schema.invoices.tenantId, tenantId),
          gte(schema.payments.createdAt, start),
          lte(schema.payments.createdAt, end),
          or(
            inArray(schema.payments.createdById, cashierIds),
            and(
              sql`${schema.payments.createdById} IS NULL`,
              inArray(schema.invoices.createdById, cashierIds),
            ),
          ),
        ),
      ),
    db
      .select()
      .from(schema.expenses)
      .where(
        and(
          eq(schema.expenses.tenantId, tenantId),
          gte(schema.expenses.date, start),
          lte(schema.expenses.date, end),
          inArray(schema.expenses.createdById, cashierIds),
        ),
      ),
  ]);

  const activitiesByCashier = new Map<string, DailyActivity[]>();

  for (const id of cashierIds) {
    activitiesByCashier.set(id, []);
  }

  const pushActivity = (userId: string | null | undefined, activity: DailyActivity) => {
    if (!userId || !activitiesByCashier.has(userId)) return;
    activitiesByCashier.get(userId)!.push(activity);
  };

  for (const row of invoicesCreated) {
    const userId = row.invoice.createdById;
    if (!userId) continue;
    pushActivity(userId, mapInvoiceActivity(row.invoice, row.customerName, 'created'));
  }

  for (const row of invoicesCancelled) {
    const userId = row.invoice.createdById;
    if (!userId) continue;
    const already = activitiesByCashier
      .get(userId)
      ?.some((a) => a.id === `cancelled-${row.invoice.id}`);
    if (!already) {
      pushActivity(userId, mapInvoiceActivity(row.invoice, row.customerName, 'cancelled'));
    }
  }

  for (const row of paymentsRows) {
    const userId = row.payment.createdById ?? row.invoice.createdById;
    if (!userId || !cashierIds.includes(userId)) continue;
    pushActivity(userId, {
      id: `payment-${row.payment.id}`,
      type: 'PAYMENT',
      label: 'Paiement reçu',
      reference: row.invoice.number,
      amount: Number(row.payment.amount),
      status: statusLabel(row.invoice.status),
      at: row.payment.createdAt.toISOString(),
      details: [
        row.customerName ? `Client : ${row.customerName}` : null,
        `Mode : ${row.payment.method}`,
        row.payment.reference ? `Réf. ${row.payment.reference}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    });
  }

  for (const exp of expensesRows) {
    const userId = exp.createdById;
    if (!userId || !cashierIds.includes(userId)) continue;
    pushActivity(userId, {
      id: `expense-${exp.id}`,
      type: 'EXPENSE',
      label: 'Dépense',
      reference: exp.title,
      amount: Number(exp.amount),
      status: exp.category,
      at: exp.date.toISOString(),
      details: exp.notes ?? null,
    });
  }

  const cashierReports = cashiers.map((cashier) => {
    const activities = (activitiesByCashier.get(cashier.id) ?? []).sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );

    const summary: CashierSummary = {
      userId: cashier.id,
      firstName: cashier.firstName,
      lastName: cashier.lastName,
      invoicesCount: activities.filter(
        (a) => a.type === 'INVOICE' || a.type === 'DRAFT' || a.type === 'QUOTE',
      ).length,
      paymentsTotal: activities
        .filter((a) => a.type === 'PAYMENT')
        .reduce((s, a) => s + (a.amount ?? 0), 0),
      paymentsCount: activities.filter((a) => a.type === 'PAYMENT').length,
      cancellationsCount: activities.filter((a) => a.type === 'CANCELLATION').length,
      deliveryNotesCount: activities.filter((a) => a.type === 'DELIVERY_NOTE').length,
      expensesTotal: activities
        .filter((a) => a.type === 'EXPENSE')
        .reduce((s, a) => s + (a.amount ?? 0), 0),
      expensesCount: activities.filter((a) => a.type === 'EXPENSE').length,
      draftsCount: activities.filter((a) => a.type === 'DRAFT').length,
    };

    return { ...summary, activities };
  });

  const totals = cashierReports.reduce(
    (acc, c) => ({
      invoicesCount: acc.invoicesCount + c.invoicesCount,
      paymentsTotal: acc.paymentsTotal + c.paymentsTotal,
      cancellationsCount: acc.cancellationsCount + c.cancellationsCount,
      deliveryNotesCount: acc.deliveryNotesCount + c.deliveryNotesCount,
      expensesTotal: acc.expensesTotal + c.expensesTotal,
      activityCount: acc.activityCount + c.activities.length,
    }),
    {
      invoicesCount: 0,
      paymentsTotal: 0,
      cancellationsCount: 0,
      deliveryNotesCount: 0,
      expensesTotal: 0,
      activityCount: 0,
    },
  );

  return { date, cashiers: cashierReports, totals };
}

export async function cashierDailyReport(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const date =
    typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : new Date().toISOString().slice(0, 10);

  const data = await buildCashierDailyData(tenantId, date);
  return res.json(data);
}

const emailSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().email().optional(),
});

export async function emailCashierDailyReport(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) return res.status(401).json({ error: 'Non authentifié' });

  const parse = emailSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Date invalide' });

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

  const reportData = await buildCashierDailyData(tenantId, parse.data.date);

  let to = parse.data.to;
  if (!to) {
    const [admin] = await db
      .select({ email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    to = admin?.email;
  }

  if (!to) {
    return res.status(400).json({ error: 'Aucune adresse email de destination' });
  }

  const html = buildCashierDailyEmailHtml({
    companyName: tenant?.name ?? 'GestFacturation',
    date: reportData.date,
    cashiers: reportData.cashiers,
    totals: reportData.totals,
  });

  await sendEmail({
    to,
    subject: `Journal caisse — ${reportData.date} — ${tenant?.name ?? ''}`,
    html,
    tenant,
  });

  return res.json({ success: true, sentTo: to });
}
