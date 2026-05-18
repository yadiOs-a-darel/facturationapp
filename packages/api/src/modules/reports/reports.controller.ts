import type { Response } from 'express';
import { and, desc, eq, ne, sql } from 'drizzle-orm';

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
