"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentHandler = createPaymentHandler;
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const db_1 = require("../../lib/db");
const createPaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    methodCode: zod_1.z.string().min(1),
    reference: zod_1.z.string().optional().nullable(),
    date: zod_1.z.string().optional(), // ISO string
    notes: zod_1.z.string().optional().nullable(),
});
async function createPaymentHandler(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id: invoiceId } = req.params;
    const parse = createPaymentSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const { amount, methodCode, reference, date, notes } = parse.data;
    const [invoice] = await db_1.db
        .select()
        .from(db_1.schema.invoices)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, invoiceId), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)))
        .limit(1);
    if (!invoice) {
        return res.status(404).json({ error: 'Facture introuvable' });
    }
    if (invoice.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Impossible de payer une facture annulée' });
    }
    const [method] = await db_1.db
        .select()
        .from(db_1.schema.paymentMethods)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.paymentMethods.tenantId, tenantId), (0, drizzle_orm_1.eq)(db_1.schema.paymentMethods.code, methodCode), (0, drizzle_orm_1.eq)(db_1.schema.paymentMethods.isActive, true)))
        .limit(1);
    if (!method) {
        return res.status(400).json({ error: 'Mode de paiement invalide' });
    }
    const paymentDate = date ? new Date(date) : new Date();
    let result;
    await db_1.db.transaction(async (tx) => {
        const paymentId = (0, crypto_1.randomUUID)();
        await tx.insert(db_1.schema.payments).values({
            id: paymentId,
            invoiceId,
            amount: String(amount.toFixed(2)),
            method: method.code,
            reference: reference ?? null,
            date: paymentDate,
            notes: notes ?? null,
        });
        const currentPaid = parseFloat(String(invoice.paidAmount)) || 0;
        const invoiceTotal = parseFloat(String(invoice.totalTTC)) || 0;
        const newPaidAmount = currentPaid + amount;
        let newStatus = invoice.status;
        if (newPaidAmount >= invoiceTotal) {
            newStatus = 'PAID';
        }
        else if (newPaidAmount > 0) {
            newStatus = 'PARTIAL';
        }
        await tx
            .update(db_1.schema.invoices)
            .set({
            paidAmount: String(newPaidAmount.toFixed(2)),
            status: newStatus,
            paymentMethod: method.code,
            paymentDate,
            paymentRef: reference ?? invoice.paymentRef,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, invoiceId), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)));
        const [payment] = await tx
            .select()
            .from(db_1.schema.payments)
            .where((0, drizzle_orm_1.eq)(db_1.schema.payments.id, paymentId))
            .limit(1);
        const [updatedInvoice] = await tx
            .select()
            .from(db_1.schema.invoices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.invoices.id, invoiceId), (0, drizzle_orm_1.eq)(db_1.schema.invoices.tenantId, tenantId)))
            .limit(1);
        result = { payment, invoice: updatedInvoice };
    });
    return res.status(201).json(result);
}
