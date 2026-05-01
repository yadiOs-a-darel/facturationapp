"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardReport = dashboardReport;
const db_1 = require("../../lib/db");
const drizzle_orm_1 = require("drizzle-orm");
async function dashboardReport(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    // Total sales et nombre de factures
    const invoicesAgg = await db_1.db
        .select({
        total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${db_1.schema.invoices.totalTTC}), 0)`,
        count: (0, drizzle_orm_1.sql) `COUNT(*)`,
    })
        .from(db_1.schema.invoices)
        .where((0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId));
    // Factures impayées
    const unpaidCountResult = await db_1.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(db_1.schema.invoices)
        .where((0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId));
    const unpaidCount = unpaidCountResult.filter((i) => i.totalTTC > i.paidAmount).length;
    // Valeur du stock
    const products = await db_1.db
        .select({
        stockQuantity: db_1.schema.products.stockQuantity,
        purchasePrice: db_1.schema.products.purchasePrice,
    })
        .from(db_1.schema.products)
        .where((0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId));
    const stockValue = products.reduce((sum, p) => sum + Number(p.stockQuantity) * Number(p.purchasePrice), 0);
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
