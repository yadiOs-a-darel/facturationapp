import type { Response } from 'express';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { eq, sql } from 'drizzle-orm';

export async function dashboardReport(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  // Total sales et nombre de factures
  const invoicesAgg = await db
    .select({
      total: sql<number>`COALESCE(SUM(${schema.invoices.totalTTC}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.invoices)
    .where(eq(schema.invoices.tenantId, tenantId));

  // Factures impayées
  const unpaidCountResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.invoices)
    .where(
      eq(schema.invoices.tenantId, tenantId)
    );
  const unpaidCount = unpaidCountResult.filter(
    (i) => (i as any).totalTTC > (i as any).paidAmount
  ).length;

  // Valeur du stock
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

  const totalSales = Number(invoicesAgg[0]?.total ?? 0);
  const totalInvoices = Number(invoicesAgg[0]?.count ?? 0);

  return res.json({
    data: {
      totalSales,
      totalInvoices,
      unpaidInvoices: unpaidCount,
      stockValue,
    },
  });
}

