import type { Response } from 'express';
import { prisma } from '../../lib/prisma';
import type { AuthenticatedRequest } from '../../middleware/auth';

export async function dashboardReport(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const [invoicesAgg, unpaidCount, stockAgg] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        tenantId,
        status: { not: 'CANCELLED' },
      },
      _sum: { totalTTC: true },
      _count: { _all: true },
    }),
    prisma.invoice.count({
      where: {
        tenantId,
        status: { notIn: ['CANCELLED'] },
        totalTTC: { gt: prisma.invoice.fields.paidAmount },
      },
    }),
    prisma.product.aggregate({
      where: { tenantId },
      _sum: {
        stockQuantity: true,
        // we approximate stock value by sum(stockQuantity * purchasePrice) via queryRaw later if needed
      },
    }),
  ]);

  const totalSales = invoicesAgg._sum.totalTTC ?? 0;
  const totalInvoices = invoicesAgg._count._all ?? 0;

  // Stock value approximée: somme(stockQuantity * purchasePrice)
  const products = await prisma.product.findMany({
    where: { tenantId },
    select: { stockQuantity: true, purchasePrice: true },
  });
  const stockValue = products.reduce(
    (sum, p) => sum + p.stockQuantity * p.purchasePrice,
    0,
  );

  return res.json({
    data: {
      totalSales,
      totalInvoices,
      unpaidInvoices: unpaidCount,
      stockValue,
    },
  });
}

