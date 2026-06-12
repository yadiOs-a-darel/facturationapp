import type { Response } from 'express';
import { and, desc, eq, gte, lte, ne, sql } from 'drizzle-orm';

import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

export async function dashboardReport(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const [invoicesAgg] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${schema.invoices.totalTTC}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.invoices)
    .where(and(eq(schema.invoices.tenantId, tenantId), ne(schema.invoices.status, 'CANCELLED')));

  const [unpaidAgg] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.invoices)
    .where(
      and(
        eq(schema.invoices.tenantId, tenantId),
        ne(schema.invoices.status, 'CANCELLED'),
        ne(schema.invoices.status, 'PAID'),
        sql`CAST(${schema.invoices.paidAmount} AS DECIMAL(12,2)) < CAST(${schema.invoices.totalTTC} AS DECIMAL(12,2))`,
      ),
    );

  const products = await db
    .select({
      stockQuantity: schema.products.stockQuantity,
      purchasePrice: schema.products.purchasePrice,
    })
    .from(schema.products)
    .where(eq(schema.products.tenantId, tenantId));

  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.stockQuantity) * Number(p.purchasePrice),
    0,
  );

  const recentInvoices = await db
    .select({
      id: schema.invoices.id,
      number: schema.invoices.number,
      status: schema.invoices.status,
      totalTTC: schema.invoices.totalTTC,
      issueDate: schema.invoices.issueDate,
      customerName: schema.customers.denomination,
    })
    .from(schema.invoices)
    .innerJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
    .where(eq(schema.invoices.tenantId, tenantId))
    .orderBy(desc(schema.invoices.issueDate))
    .limit(5);

  const stockAlerts = await db
    .select({
      productId: schema.products.id,
      code: schema.products.code,
      name: schema.products.name,
      stockQuantity: schema.products.stockQuantity,
      stockMin: schema.products.stockMin,
    })
    .from(schema.products)
    .where(
      and(
        eq(schema.products.tenantId, tenantId),
        eq(schema.products.isActive, true),
        sql`${schema.products.stockQuantity} <= ${schema.products.stockMin}`,
      ),
    )
    .orderBy(schema.products.stockQuantity)
    .limit(5);

  return res.json({
    data: {
      totalSales: Number(invoicesAgg?.total ?? 0),
      totalInvoices: Number(invoicesAgg?.count ?? 0),
      unpaidInvoices: Number(unpaidAgg?.count ?? 0),
      stockValue,
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        totalTTC: Number(inv.totalTTC),
        issueDate: inv.issueDate,
        customerName: inv.customerName,
      })),
      stockAlerts: stockAlerts.map((p) => ({
        productId: p.productId,
        code: p.code,
        name: p.name,
        stockQuantity: Number(p.stockQuantity),
        stockMin: Number(p.stockMin),
      })),
    },
  });
}

export async function salesReport(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const from = req.query.from ? new Date(String(req.query.from)) : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();

  const rows = await db
    .select({
      id: schema.invoices.id,
      number: schema.invoices.number,
      type: schema.invoices.type,
      status: schema.invoices.status,
      issueDate: schema.invoices.issueDate,
      totalTTC: schema.invoices.totalTTC,
      paidAmount: schema.invoices.paidAmount,
      customerName: schema.customers.denomination,
    })
    .from(schema.invoices)
    .leftJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
    .where(
      and(
        eq(schema.invoices.tenantId, tenantId),
        eq(schema.invoices.type, 'INVOICE'),
        ne(schema.invoices.status, 'CANCELLED'),
        gte(schema.invoices.issueDate, from),
        lte(schema.invoices.issueDate, to),
      ),
    )
    .orderBy(desc(schema.invoices.issueDate));

  const totalSales = rows.reduce((s, r) => s + Number(r.totalTTC), 0);
  const totalPaid = rows.reduce((s, r) => s + Number(r.paidAmount), 0);

  return res.json({
    data: rows.map((r) => ({
      ...r,
      totalTTC: Number(r.totalTTC),
      paidAmount: Number(r.paidAmount),
    })),
    meta: { totalSales, totalPaid, count: rows.length, from, to },
  });
}

export async function vatReport(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const from = req.query.from ? new Date(String(req.query.from)) : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();

  const invoices = await db
    .select({
      subtotalHT: schema.invoices.subtotalHT,
      taxAmount: schema.invoices.taxAmount,
      totalTTC: schema.invoices.totalTTC,
      number: schema.invoices.number,
      issueDate: schema.invoices.issueDate,
    })
    .from(schema.invoices)
    .where(
      and(
        eq(schema.invoices.tenantId, tenantId),
        eq(schema.invoices.type, 'INVOICE'),
        ne(schema.invoices.status, 'CANCELLED'),
        ne(schema.invoices.status, 'DRAFT'),
        gte(schema.invoices.issueDate, from),
        lte(schema.invoices.issueDate, to),
      ),
    );

  const totalHT = invoices.reduce((s, i) => s + Number(i.subtotalHT), 0);
  const totalVAT = invoices.reduce((s, i) => s + Number(i.taxAmount), 0);
  const totalTTC = invoices.reduce((s, i) => s + Number(i.totalTTC), 0);

  return res.json({
    data: invoices.map((i) => ({
      number: i.number,
      issueDate: i.issueDate,
      subtotalHT: Number(i.subtotalHT),
      taxAmount: Number(i.taxAmount),
      totalTTC: Number(i.totalTTC),
    })),
    meta: { totalHT, totalVAT, totalTTC, from, to },
  });
}

export async function receivablesReport(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const rows = await db
    .select({
      id: schema.invoices.id,
      number: schema.invoices.number,
      status: schema.invoices.status,
      dueDate: schema.invoices.dueDate,
      totalTTC: schema.invoices.totalTTC,
      paidAmount: schema.invoices.paidAmount,
      customerName: schema.customers.denomination,
    })
    .from(schema.invoices)
    .leftJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
    .where(
      and(
        eq(schema.invoices.tenantId, tenantId),
        eq(schema.invoices.type, 'INVOICE'),
        ne(schema.invoices.status, 'CANCELLED'),
        ne(schema.invoices.status, 'DRAFT'),
        ne(schema.invoices.status, 'PAID'),
      ),
    )
    .orderBy(schema.invoices.dueDate);

  const data = rows.map((r) => {
    const remaining = Number(r.totalTTC) - Number(r.paidAmount);
    return {
      ...r,
      totalTTC: Number(r.totalTTC),
      paidAmount: Number(r.paidAmount),
      remaining,
    };
  });

  const totalDue = data.reduce((s, r) => s + r.remaining, 0);
  return res.json({ data, meta: { totalDue, count: data.length } });
}

export async function exportSalesCsv(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const from = req.query.from ? new Date(String(req.query.from)) : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();

  const rows = await db
    .select({
      number: schema.invoices.number,
      issueDate: schema.invoices.issueDate,
      status: schema.invoices.status,
      totalTTC: schema.invoices.totalTTC,
      paidAmount: schema.invoices.paidAmount,
      customerName: schema.customers.denomination,
    })
    .from(schema.invoices)
    .leftJoin(schema.customers, eq(schema.invoices.customerId, schema.customers.id))
    .where(
      and(
        eq(schema.invoices.tenantId, tenantId),
        eq(schema.invoices.type, 'INVOICE'),
        gte(schema.invoices.issueDate, from),
        lte(schema.invoices.issueDate, to),
      ),
    );

  const header = 'Numéro;Date;Client;Statut;Total TTC;Payé\n';
  const lines = rows
    .map(
      (r) =>
        `${r.number};${new Date(r.issueDate).toISOString().slice(0, 10)};${r.customerName ?? ''};${r.status};${r.totalTTC};${r.paidAmount}`,
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ventes.csv"');
  return res.send(`\uFEFF${header}${lines}`);
}
