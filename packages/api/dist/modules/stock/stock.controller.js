"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStockMovements = listStockMovements;
exports.listStockAlerts = listStockAlerts;
exports.adjustStockHandler = adjustStockHandler;
exports.getCurrentStock = getCurrentStock;
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const db_1 = require("../../lib/db");
const movementsQuerySchema = zod_1.z.object({
    productId: zod_1.z.string().optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
});
const stockAdjustmentSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    type: zod_1.z.enum(['IN', 'OUT', 'ADJUSTMENT']),
    quantity: zod_1.z.number(),
    unitCost: zod_1.z.number().optional(),
    reason: zod_1.z.string().optional(),
    reference: zod_1.z.string().optional(),
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
    const conditions = [(0, drizzle_orm_1.eq)(db_1.schema.stockMovements.tenantId, tenantId)];
    if (productId) {
        conditions.push((0, drizzle_orm_1.eq)(db_1.schema.stockMovements.productId, productId));
    }
    if (from) {
        conditions.push((0, drizzle_orm_1.gte)(db_1.schema.stockMovements.createdAt, new Date(from)));
    }
    if (to) {
        conditions.push((0, drizzle_orm_1.lte)(db_1.schema.stockMovements.createdAt, new Date(to)));
    }
    const rows = await db_1.db
        .select()
        .from(db_1.schema.stockMovements)
        .where((0, drizzle_orm_1.and)(...conditions))
        .orderBy((0, drizzle_orm_1.desc)(db_1.schema.stockMovements.createdAt));
    return res.json({ data: rows });
}
async function listStockAlerts(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const rows = await db_1.db
        .select({
        productId: db_1.schema.products.id,
        code: db_1.schema.products.code,
        name: db_1.schema.products.name,
        stockQuantity: db_1.schema.products.stockQuantity,
        stockMin: db_1.schema.products.stockMin,
    })
        .from(db_1.schema.products)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId), (0, drizzle_orm_1.eq)(db_1.schema.products.isActive, true), (0, drizzle_orm_1.lte)(db_1.schema.products.stockQuantity, db_1.schema.products.stockMin)))
        .orderBy(db_1.schema.products.stockQuantity);
    return res.json({ data: rows });
}
async function adjustStockHandler(req, res) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const parse = stockAdjustmentSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const { productId, type, quantity, unitCost, reason, reference } = parse.data;
    const productRows = await db_1.db
        .select()
        .from(db_1.schema.products)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, productId), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)))
        .limit(1);
    if (productRows.length === 0) {
        return res.status(404).json({ error: 'Produit introuvable' });
    }
    const product = productRows[0];
    let newStock = Number(product.stockQuantity) || 0;
    if (type === 'IN') {
        newStock += quantity;
    }
    else if (type === 'OUT') {
        newStock -= quantity;
    }
    else if (type === 'ADJUSTMENT') {
        newStock = quantity;
    }
    if (newStock < 0) {
        return res.status(400).json({ error: 'Stock insuffisant' });
    }
    const now = new Date();
    await db_1.db.transaction(async (tx) => {
        await tx.insert(db_1.schema.stockMovements).values({
            id: (0, crypto_1.randomUUID)(),
            tenantId,
            productId,
            type,
            quantity: type === 'OUT' ? -quantity : quantity,
            unitCost: unitCost?.toString(),
            reason: reason || null,
            reference: reference || null,
            createdAt: now,
            createdBy: userId,
        });
        await tx
            .update(db_1.schema.products)
            .set({ stockQuantity: newStock, updatedAt: now })
            .where((0, drizzle_orm_1.eq)(db_1.schema.products.id, productId));
    });
    return res.status(201).json({ message: 'Stock mis à jour', newStock });
}
async function getCurrentStock(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { productId } = req.params;
    const productRows = await db_1.db
        .select({
        id: db_1.schema.products.id,
        code: db_1.schema.products.code,
        name: db_1.schema.products.name,
        stockQuantity: db_1.schema.products.stockQuantity,
        stockMin: db_1.schema.products.stockMin,
        stockMax: db_1.schema.products.stockMax,
        stockLocation: db_1.schema.products.stockLocation,
        unit: db_1.schema.products.unit,
    })
        .from(db_1.schema.products)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, productId), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)))
        .limit(1);
    if (productRows.length === 0) {
        return res.status(404).json({ error: 'Produit introuvable' });
    }
    const movements = await db_1.db
        .select()
        .from(db_1.schema.stockMovements)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.stockMovements.productId, productId), (0, drizzle_orm_1.eq)(db_1.schema.stockMovements.tenantId, tenantId)))
        .orderBy((0, drizzle_orm_1.desc)(db_1.schema.stockMovements.createdAt))
        .limit(10);
    return res.json({
        product: productRows[0],
        recentMovements: movements,
    });
}
