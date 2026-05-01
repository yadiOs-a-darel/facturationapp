"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInvoices = listInvoices;
exports.getInvoiceById = getInvoiceById;
exports.createInvoiceHandler = createInvoiceHandler;
exports.updateInvoiceHandler = updateInvoiceHandler;
exports.deleteInvoiceHandler = deleteInvoiceHandler;
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const db_1 = require("../../lib/db");
const listQuerySchema = zod_1.z.object({
    status: zod_1.z.string().optional(),
    customerId: zod_1.z.string().optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(20),
});
const invoiceItemSchema = zod_1.z.object({
    productId: zod_1.z.string().optional(),
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().nonnegative(),
    discountRate: zod_1.z.number().min(0).max(100).optional().default(0),
    taxRate: zod_1.z.number().min(0).max(100).optional().default(19),
});
const invoicePayloadSchema = zod_1.z.object({
    customerId: zod_1.z.string().min(1),
    type: zod_1.z
        .enum(['INVOICE', 'PROFORMA', 'QUOTE', 'CREDIT_NOTE', 'DELIVERY_NOTE'])
        .optional()
        .default('INVOICE'),
    issueDate: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().optional().nullable(),
    discountAmount: zod_1.z.number().optional().default(0),
    discountRate: zod_1.z.number().min(0).max(100).optional().default(0),
    notes: zod_1.z.string().optional().nullable(),
    terms: zod_1.z.string().optional().nullable(),
    items: zod_1.z.array(invoiceItemSchema).min(1),
});
function computeTotals(items) {
    let subtotalHT = 0;
    let taxAmount = 0;
    for (const item of items) {
        const lineBase = item.quantity * item.unitPrice;
        const lineDiscount = (lineBase * (item.discountRate ?? 0)) / 100;
        const lineHT = lineBase - lineDiscount;
        const lineTax = (lineHT * (item.taxRate ?? 0)) / 100;
        subtotalHT += lineHT;
        taxAmount += lineTax;
    }
    const totalTTC = subtotalHT + taxAmount;
    return { subtotalHT, taxAmount, totalTTC };
}
async function generateInvoiceNumber(tenantId) {
    const documentType = 'INVOICE';
    const year = new Date().getFullYear();
    let currentNumber = 1;
    let prefix = `FAC-${year}-`;
    const padding = 4;
    await db_1.db.transaction(async (tx) => {
        const existing = await tx
            .select()
            .from(db_1.schema.numberingConfig)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.numberingConfig.tenantId, tenantId), (0, drizzle_orm_1.eq)(db_1.schema.numberingConfig.documentType, documentType)))
            .limit(1);
        const now = new Date();
        if (existing.length === 0) {
            await tx.insert(db_1.schema.numberingConfig).values({
                id: (0, crypto_1.randomUUID)(),
                tenantId,
                documentType,
                prefix,
                currentNumber: 1,
                padding,
                createdAt: now,
                updatedAt: now,
            });
            currentNumber = 1;
        }
        else {
            const cfg = existing[0];
            prefix = cfg.prefix;
            currentNumber = (cfg.currentNumber ?? 0) + 1;
            await tx
                .update(db_1.schema.numberingConfig)
                .set({ currentNumber })
                .where((0, drizzle_orm_1.eq)(db_1.schema.numberingConfig.id, cfg.id));
        }
    });
    const seq = currentNumber.toString().padStart(padding, '0');
    return `${prefix}${seq}`;
}
async function listInvoices(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const parse = listQuerySchema.safeParse(req.query);
    if (!parse.success) {
        return res.status(400).json({ error: 'Paramètres invalides' });
    }
    const { status, customerId, from, to, type, page, limit } = parse.data;
    const conditions = [(0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)];
    if (status)
        conditions.push((0, drizzle_orm_1.eq)(db_1.schema.invoices.status, status));
    if (type)
        conditions.push((0, drizzle_orm_1.eq)(db_1.schema.invoices.type, type));
    if (customerId)
        conditions.push((0, drizzle_orm_1.eq)(db_1.schema.invoices.customerId, customerId));
    if (from)
        conditions.push((0, drizzle_orm_1.gte)(db_1.schema.invoices.issueDate, new Date(from)));
    if (to)
        conditions.push((0, drizzle_orm_1.lte)(db_1.schema.invoices.issueDate, new Date(to)));
    const offset = (page - 1) * limit;
    const [rows, totalRows] = await Promise.all([
        db_1.db
            .select()
            .from(db_1.schema.invoices)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(db_1.schema.invoices.issueDate)
            .limit(limit)
            .offset(offset),
        db_1.db
            .select({ id: db_1.schema.invoices.id })
            .from(db_1.schema.invoices)
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
async function getInvoiceById(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const [invoice] = await db_1.db
        .select()
        .from(db_1.schema.invoices)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, id), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)))
        .limit(1);
    if (!invoice) {
        return res.status(404).json({ error: 'Facture introuvable' });
    }
    const [customer] = await db_1.db
        .select()
        .from(db_1.schema.customers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.customers.id, invoice.customerId), (0, drizzle_orm_1.eq)(db_1.schema.customers.tenantId, tenantId)))
        .limit(1);
    const items = await db_1.db
        .select()
        .from(db_1.schema.invoiceItems)
        .where((0, drizzle_orm_1.eq)(db_1.schema.invoiceItems.invoiceId, id));
    const payments = await db_1.db
        .select()
        .from(db_1.schema.payments)
        .where((0, drizzle_orm_1.eq)(db_1.schema.payments.invoiceId, id));
    return res.json({ ...invoice, customer, items, payments });
}
async function createInvoiceHandler(req, res) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const parse = invoicePayloadSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const payload = parse.data;
    const number = await generateInvoiceNumber(tenantId);
    const { subtotalHT, taxAmount, totalTTC } = computeTotals(payload.items);
    try {
        let createdInvoice;
        const now = new Date();
        await db_1.db.transaction(async (tx) => {
            const invoiceId = (0, crypto_1.randomUUID)();
            await tx.insert(db_1.schema.invoices).values({
                id: invoiceId,
                tenantId,
                customerId: payload.customerId,
                createdById: userId ?? null,
                number,
                type: payload.type,
                issueDate: payload.issueDate ? new Date(payload.issueDate) : now,
                dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
                status: 'DRAFT',
                subtotalHT: String(subtotalHT.toFixed(2)),
                discountAmount: String((payload.discountAmount ?? 0).toFixed(2)),
                discountRate: payload.discountRate ?? 0,
                taxAmount: String(taxAmount.toFixed(2)),
                totalTTC: String(totalTTC.toFixed(2)),
                paidAmount: '0',
                notes: payload.notes ?? null,
                terms: payload.terms ?? null,
                createdAt: now,
                updatedAt: now,
            });
            for (const [index, item] of payload.items.entries()) {
                await tx.insert(db_1.schema.invoiceItems).values({
                    id: (0, crypto_1.randomUUID)(),
                    invoiceId,
                    productId: item.productId ?? null,
                    description: item.description,
                    quantity: item.quantity,
                    unit: 'pcs',
                    unitPrice: String(item.unitPrice.toFixed(2)),
                    discountRate: item.discountRate ?? 0,
                    taxRate: item.taxRate ?? 19,
                    totalHT: String((item.quantity * item.unitPrice).toFixed(2)),
                    totalTTC: String((item.quantity * item.unitPrice * (1 + (item.taxRate ?? 19) / 100)).toFixed(2)),
                    order: index,
                });
                if (item.productId) {
                    await tx
                        .update(db_1.schema.products)
                        .set({
                        stockQuantity: db_1.schema.products.stockQuantity -
                            item.quantity,
                    })
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.products.id, item.productId), (0, drizzle_orm_1.eq)(db_1.schema.products.tenantId, tenantId)));
                }
            }
            const [invoiceRow] = await tx
                .select()
                .from(db_1.schema.invoices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, invoiceId), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)))
                .limit(1);
            const items = await tx
                .select()
                .from(db_1.schema.invoiceItems)
                .where((0, drizzle_orm_1.eq)(db_1.schema.invoiceItems.invoiceId, invoiceId));
            createdInvoice = { ...invoiceRow, items };
        });
        return res.status(201).json(createdInvoice);
    }
    catch {
        return res.status(400).json({ error: 'Impossible de créer la facture' });
    }
}
async function updateInvoiceHandler(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const existing = await db_1.db
        .select()
        .from(db_1.schema.invoices)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, id), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)))
        .limit(1);
    if (existing.length === 0) {
        return res.status(404).json({ error: 'Facture introuvable' });
    }
    const baseSchema = invoicePayloadSchema.partial().omit({ items: true });
    const parse = baseSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const data = parse.data;
    if (data.issueDate)
        data.issueDate = new Date(data.issueDate);
    if (data.dueDate)
        data.dueDate = new Date(data.dueDate);
    await db_1.db
        .update(db_1.schema.invoices)
        .set(data)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, id), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)));
    const [updated] = await db_1.db
        .select()
        .from(db_1.schema.invoices)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, id), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)))
        .limit(1);
    return res.json(updated);
}
async function deleteInvoiceHandler(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const existing = await db_1.db
        .select()
        .from(db_1.schema.invoices)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, id), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)))
        .limit(1);
    if (existing.length === 0) {
        return res.status(404).json({ error: 'Facture introuvable' });
    }
    await db_1.db
        .delete(db_1.schema.invoices)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, id), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)));
    return res.status(204).send();
}
