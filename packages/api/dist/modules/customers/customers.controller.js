"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomers = listCustomers;
exports.getCustomerById = getCustomerById;
exports.createCustomerHandler = createCustomerHandler;
exports.updateCustomerHandler = updateCustomerHandler;
exports.deleteCustomerHandler = deleteCustomerHandler;
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const db_1 = require("../../lib/db");
const listQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(20),
});
const customerPayloadSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    type: zod_1.z.enum(['WHOLESALE', 'RETAIL', 'ORGANIZATION', 'MINISTRY', 'OTHER']).optional(),
    denomination: zod_1.z.string().min(1),
    contactName: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().email().optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
    phone2: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    city: zod_1.z.string().optional().nullable(),
    wilaya: zod_1.z.string().optional().nullable(),
    country: zod_1.z.string().optional(),
    taxNumber: zod_1.z.string().optional().nullable(),
    discountRate: zod_1.z.number().optional().nullable(),
    creditLimit: zod_1.z.number().optional().nullable(),
    paymentTermDays: zod_1.z.number().optional().nullable(),
    currency: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().optional().nullable(),
});
async function listCustomers(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const parse = listQuerySchema.safeParse(req.query);
    if (!parse.success) {
        return res.status(400).json({ error: 'Paramètres invalides' });
    }
    const { search, type, page, limit } = parse.data;
    const conditions = [(0, drizzle_orm_1.eq)(db_1.schema.customers.tenantId, tenantId)];
    if (type) {
        conditions.push((0, drizzle_orm_1.eq)(db_1.schema.customers.type, type));
    }
    if (search) {
        const pattern = `%${search}%`;
        conditions.push((0, drizzle_orm_1.like)(db_1.schema.customers.denomination, pattern));
    }
    const offset = (page - 1) * limit;
    const [rows, totalRows] = await Promise.all([
        db_1.db
            .select()
            .from(db_1.schema.customers)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(db_1.schema.customers.createdAt)
            .limit(limit)
            .offset(offset),
        db_1.db
            .select({ id: db_1.schema.customers.id })
            .from(db_1.schema.customers)
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
async function getCustomerById(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const rows = await db_1.db
        .select()
        .from(db_1.schema.customers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.customers.id, id), (0, drizzle_orm_1.eq)(db_1.schema.customers.tenantId, tenantId)))
        .limit(1);
    const customer = rows[0];
    if (!customer) {
        return res.status(404).json({ error: 'Client introuvable' });
    }
    return res.json(customer);
}
async function createCustomerHandler(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const parse = customerPayloadSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const payload = parse.data;
    const now = new Date();
    try {
        const id = (0, crypto_1.randomUUID)();
        await db_1.db.insert(db_1.schema.customers).values({
            id,
            tenantId,
            code: payload.code,
            type: payload.type ?? 'RETAIL',
            denomination: payload.denomination,
            contactName: payload.contactName ?? null,
            email: payload.email ?? null,
            phone: payload.phone ?? null,
            phone2: payload.phone2 ?? null,
            address: payload.address ?? null,
            city: payload.city ?? null,
            wilaya: payload.wilaya ?? null,
            country: payload.country ?? 'DZ',
            taxNumber: payload.taxNumber ?? null,
            discountRate: payload.discountRate ?? 0,
            creditLimit: payload.creditLimit ?? 0,
            paymentTermDays: payload.paymentTermDays ?? 30,
            currency: payload.currency ?? 'DZD',
            isActive: payload.isActive ?? true,
            notes: payload.notes ?? null,
            createdAt: now,
            updatedAt: now,
        });
        const [created] = await db_1.db
            .select()
            .from(db_1.schema.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.customers.id, id), (0, drizzle_orm_1.eq)(db_1.schema.customers.tenantId, tenantId)))
            .limit(1);
        return res.status(201).json(created);
    }
    catch {
        return res.status(400).json({ error: 'Impossible de créer le client' });
    }
}
async function updateCustomerHandler(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const parse = customerPayloadSchema.partial().safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const existing = await db_1.db
        .select()
        .from(db_1.schema.customers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.customers.id, id), (0, drizzle_orm_1.eq)(db_1.schema.customers.tenantId, tenantId)))
        .limit(1);
    if (existing.length === 0) {
        return res.status(404).json({ error: 'Client introuvable' });
    }
    await db_1.db
        .update(db_1.schema.customers)
        .set(parse.data)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.customers.id, id), (0, drizzle_orm_1.eq)(db_1.schema.customers.tenantId, tenantId)));
    const [updated] = await db_1.db
        .select()
        .from(db_1.schema.customers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.customers.id, id), (0, drizzle_orm_1.eq)(db_1.schema.customers.tenantId, tenantId)))
        .limit(1);
    return res.json(updated);
}
async function deleteCustomerHandler(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const existing = await db_1.db
        .select()
        .from(db_1.schema.customers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.customers.id, id), (0, drizzle_orm_1.eq)(db_1.schema.customers.tenantId, tenantId)))
        .limit(1);
    if (existing.length === 0) {
        return res.status(404).json({ error: 'Client introuvable' });
    }
    await db_1.db
        .delete(db_1.schema.customers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.customers.id, id), (0, drizzle_orm_1.eq)(db_1.schema.customers.tenantId, tenantId)));
    return res.status(204).send();
}
