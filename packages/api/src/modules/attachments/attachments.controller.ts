import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';

export async function listInvoiceAttachments(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const { id } = req.params;

  const invoice = await prisma.invoice.findFirst({ where: { id, tenantId } });
  if (!invoice) {
    return res.status(404).json({ error: 'Facture introuvable' });
  }

  const attachments = await prisma.attachment.findMany({
    where: { tenantId, resource: 'Invoice', resourceId: id },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ data: attachments });
}

export async function uploadInvoiceAttachment(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const { id } = req.params;
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!file) {
    return res.status(400).json({ error: 'Aucun fichier reçu' });
  }

  const invoice = await prisma.invoice.findFirst({ where: { id, tenantId } });
  if (!invoice) {
    return res.status(404).json({ error: 'Facture introuvable' });
  }

  const url = `/uploads/${file.filename}`;

  const attachment = await prisma.attachment.create({
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

export async function deleteAttachment(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const { id } = req.params;

  const existing = await prisma.attachment.findFirst({ where: { id, tenantId } });
  if (!existing) {
    return res.status(404).json({ error: 'Pièce jointe introuvable' });
  }

  await prisma.attachment.delete({ where: { id } });

  return res.status(204).send();
}

