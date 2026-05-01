"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPaymentMethods = listPaymentMethods;
exports.createPaymentMethod = createPaymentMethod;
exports.updatePaymentMethod = updatePaymentMethod;
exports.deletePaymentMethod = deletePaymentMethod;
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const upsertSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    isActive: zod_1.z.boolean().optional(),
});
async function listPaymentMethods(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const methods = await prisma_1.prisma.paymentMethod.findMany({
        where: { tenantId, isActive: true },
        orderBy: { label: 'asc' },
    });
    return res.json({ data: methods });
}
async function createPaymentMethod(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const parse = upsertSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const { code, label, isActive } = parse.data;
    try {
        const created = await prisma_1.prisma.paymentMethod.create({
            data: {
                tenantId,
                code,
                label,
                isActive: isActive ?? true,
            },
        });
        return res.status(201).json(created);
    }
    catch {
        return res.status(400).json({ error: 'Impossible de créer le mode de paiement' });
    }
}
async function updatePaymentMethod(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const existing = await prisma_1.prisma.paymentMethod.findFirst({ where: { id, tenantId } });
    if (!existing) {
        return res.status(404).json({ error: 'Mode de paiement introuvable' });
    }
    const parse = upsertSchema.partial().safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const updated = await prisma_1.prisma.paymentMethod.update({
        where: { id },
        data: parse.data,
    });
    return res.json(updated);
}
async function deletePaymentMethod(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const existing = await prisma_1.prisma.paymentMethod.findFirst({ where: { id, tenantId } });
    if (!existing) {
        return res.status(404).json({ error: 'Mode de paiement introuvable' });
    }
    // Soft delete: désactiver plutôt que supprimer
    await prisma_1.prisma.paymentMethod.update({
        where: { id },
        data: { isActive: false },
    });
    return res.status(204).send();
}
