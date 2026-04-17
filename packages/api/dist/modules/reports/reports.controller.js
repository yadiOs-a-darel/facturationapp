"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardReport = dashboardReport;
const prisma_1 = require("../../lib/prisma");
async function dashboardReport(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const [invoicesAgg, unpaidCount, stockAgg] = await Promise.all([
        prisma_1.prisma.invoice.aggregate({
            where: {
                tenantId,
                status: { not: 'CANCELLED' },
            },
            _sum: { totalTTC: true },
            _count: { _all: true },
        }),
        prisma_1.prisma.invoice.count({
            where: {
                tenantId,
                status: { notIn: ['CANCELLED'] },
                totalTTC: { gt: prisma_1.prisma.invoice.fields.paidAmount },
            },
        }),
        prisma_1.prisma.product.aggregate({
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
    const products = await prisma_1.prisma.product.findMany({
        where: { tenantId },
        select: { stockQuantity: true, purchasePrice: true },
    });
    const stockValue = products.reduce((sum, p) => sum + p.stockQuantity * p.purchasePrice, 0);
    return res.json({
        data: {
            totalSales,
            totalInvoices,
            unpaidInvoices: unpaidCount,
            stockValue,
        },
    });
}
