"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.getProductById = getProductById;
exports.createProductHandler = createProductHandler;
exports.updateProductHandler = updateProductHandler;
exports.deleteProductHandler = deleteProductHandler;
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const db_1 = require("../../lib/db");
const listQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().optional(),
    lowStock: zod_1.z
        .union([zod_1.z.string().transform((v) => v === 'true'), zod_1.z.boolean()])
        .optional(),
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(20),
});
const productPayloadSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    barcode: zod_1.z.string().optional().nullable(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().nullable(),
    unit: zod_1.z.string().optional(),
    purchasePrice: zod_1.z.number().nonnegative().optional(),
    sellingPrice: zod_1.z.number().nonnegative().optional(),
    taxRate: zod_1.z.number().min(0).max(100).optional(),
    discountRate: zod_1.z.number().min(0).max(100).optional(),
    stockQuantity: zod_1.z.number().optional(),
    stockMin: zod_1.z.number().optional(),
    stockMax: zod_1.z.number().optional().nullable(),
    stockLocation: zod_1.z.string().optional().nullable(),
    image: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
    isService: zod_1.z.boolean().optional(),
    categoryId: zod_1.z.string().optional().nullable(),
});
async function listProducts(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const parse = listQuerySchema.safeParse(req.query);
    if (!parse.success) {
        return res.status(400).json({ error: 'Paramètres invalides' });
    }
    const { search, categoryId, lowStock, page, limit } = parse.data;
    const conditions = [(0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)];
    if (categoryId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.schema.products.categoryId, categoryId));
    if (search) {
        const pattern = `%${search}%`;
        conditions.push((0, drizzle_orm_1.like)(db_1.schema.products.name, pattern));
    }
    if (lowStock) {
        conditions.push(db_1.schema.products.stockQuantity.lte(db_1.schema.products.stockMin));
    }
    const offset = (page - 1) * limit;
    const [rows, totalRows] = await Promise.all([
        db_1.db
            .select()
            .from(db_1.schema.products)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(db_1.schema.products.createdAt)
            .limit(limit)
            .offset(offset),
        db_1.db
            .select({ id: db_1.schema.products.id })
            .from(db_1.schema.products)
            .where((0, drizzle_orm_1.and)(...conditions)),
    ]);
    const total = totalRows.length;
    const totalPages = Math.ceil(total / limit);
    return res.json({
        data: rows,
        meta: {
            total,
            page,
            perPage: limit,
            totalPages,
        },
    });
}
async function getProductById(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const rows = await db_1.db
        .select()
        .from(db_1.schema.products)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, id), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)))
        .limit(1);
    const product = rows[0];
    if (!product) {
        return res.status(404).json({ error: 'Produit introuvable' });
    }
    return res.json(product);
}
async function createProductHandler(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const parse = productPayloadSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const p = parse.data;
    try {
        const id = (0, crypto_1.randomUUID)();
        await db_1.db.insert(db_1.schema.products).values({
            id,
            tenantId,
            code: p.code,
            barcode: p.barcode ?? null,
            name: p.name,
            description: p.description ?? null,
            unit: p.unit ?? 'pcs',
            purchasePrice: String(p.purchasePrice ?? 0),
            sellingPrice: String(p.sellingPrice ?? 0),
            taxRate: p.taxRate ?? 19,
            discountRate: p.discountRate ?? 0,
            stockQuantity: p.stockQuantity ?? 0,
            stockMin: p.stockMin ?? 0,
            stockMax: p.stockMax ?? null,
            stockLocation: p.stockLocation ?? null,
            image: p.image ?? null,
            isActive: p.isActive ?? true,
            isService: p.isService ?? false,
            categoryId: p.categoryId ?? null,
        });
        const [created] = await db_1.db
            .select()
            .from(db_1.schema.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, id), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)))
            .limit(1);
        return res.status(201).json(created);
    }
    catch {
        return res.status(400).json({ error: 'Impossible de créer le produit' });
    }
}
async function updateProductHandler(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const parse = productPayloadSchema.partial().safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const existing = await db_1.db
        .select()
        .from(db_1.schema.products)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, id), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)))
        .limit(1);
    if (existing.length === 0) {
        return res.status(404).json({ error: 'Produit introuvable' });
    }
    await db_1.db
        .update(db_1.schema.products)
        .set(parse.data)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, id), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)));
    const [updated] = await db_1.db
        .select()
        .from(db_1.schema.products)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, id), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)))
        .limit(1);
    return res.json(updated);
}
async function deleteProductHandler(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const existing = await db_1.db
        .select()
        .from(db_1.schema.products)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, id), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)))
        .limit(1);
    if (existing.length === 0) {
        return res.status(404).json({ error: 'Produit introuvable' });
    }
    await db_1.db
        .delete(db_1.schema.products)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, id), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)));
    return res.status(204).send();
}
