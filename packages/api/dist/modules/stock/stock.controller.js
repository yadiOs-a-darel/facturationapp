"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStockMovements = listStockMovements;
exports.listStockAlerts = listStockAlerts;
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const movementsQuerySchema = zod_1.z.object({
    productId: zod_1.z.string().optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
});
async function listStockMovements(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const parse = movementsQuerySchema.safeParse(req.query);
    if (!parse.success) {
        return res.status(400).json({ error: 'Paramètres invalides' });
    }
    const { productId, from, to } = parse.data;
    const where = { tenantId };
    if (productId)
        where.productId = productId;
    if (from || to) {
        where.createdAt = {};
        if (from)
            where.createdAt.gte = new Date(from);
        if (to)
            where.createdAt.lte = new Date(to);
    }
    const data = await prisma_1.prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ data });
}
async function listStockAlerts(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const products = await prisma_1.prisma.product.findMany({
        where: {
            tenantId,
            isActive: true,
            stockQuantity: {
                lte: prisma_1.prisma.product.fields.stockMin,
            },
        },
        orderBy: { stockQuantity: 'asc' },
    });
    const data = products.map((p) => ({
        productId: p.id,
        code: p.code,
        name: p.name,
        stockQuantity: p.stockQuantity,
        stockMin: p.stockMin,
    }));
    return res.json({ data });
}
