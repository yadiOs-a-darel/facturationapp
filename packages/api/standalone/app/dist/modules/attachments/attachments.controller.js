"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInvoiceAttachments = listInvoiceAttachments;
exports.uploadInvoiceAttachment = uploadInvoiceAttachment;
exports.deleteAttachment = deleteAttachment;
const prisma_1 = require("../../lib/prisma");
async function listInvoiceAttachments(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const invoice = await prisma_1.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) {
        return res.status(404).json({ error: 'Facture introuvable' });
    }
    const attachments = await prisma_1.prisma.attachment.findMany({
        where: { tenantId, resource: 'Invoice', resourceId: id },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ data: attachments });
}
async function uploadInvoiceAttachment(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'Aucun fichier reçu' });
    }
    const invoice = await prisma_1.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) {
        return res.status(404).json({ error: 'Facture introuvable' });
    }
    const url = `/uploads/${file.filename}`;
    const attachment = await prisma_1.prisma.attachment.create({
        data: {
            tenantId,
            resource: 'Invoice',
            resourceId: id,
            fileName: file.originalname,
            url,
            mimeType: file.mimetype,
        },
    });
    return res.status(201).json(attachment);
}
async function deleteAttachment(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId)
        return res.status(401).json({ error: 'Non authentifié' });
    const { id } = req.params;
    const existing = await prisma_1.prisma.attachment.findFirst({ where: { id, tenantId } });
    if (!existing) {
        return res.status(404).json({ error: 'Pièce jointe introuvable' });
    }
    await prisma_1.prisma.attachment.delete({ where: { id } });
    return res.status(204).send();
}
