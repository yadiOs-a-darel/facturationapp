import type { Response } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

export async function listInvoiceAttachments(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (!invoice) return res.status(404).json({ error: 'Facture introuvable' });

  const attachments = await db
    .select()
    .from(schema.attachments)
    .where(
      and(
        eq(schema.attachments.tenantId, tenantId),
        eq(schema.attachments.resource, 'Invoice'),
        eq(schema.attachments.resourceId, id),
      ),
    )
    .orderBy(desc(schema.attachments.createdAt));

  return res.json({ data: attachments });
}

export async function uploadInvoiceAttachment(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;
  const file = (req as AuthenticatedRequest & { file?: Express.Multer.File }).file;

  if (!file) return res.status(400).json({ error: 'Aucun fichier reçu' });

  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.tenantId, tenantId)))
    .limit(1);

  if (!invoice) return res.status(404).json({ error: 'Facture introuvable' });

  const url = `/uploads/${file.filename}`;
  const attachmentId = randomUUID();

  await db.insert(schema.attachments).values({
    id: attachmentId,
    tenantId,
    resource: 'Invoice',
    resourceId: id,
    fileName: file.originalname,
    url,
    mimeType: file.mimetype,
    createdAt: new Date(),
  });

  const [attachment] = await db
    .select()
    .from(schema.attachments)
    .where(eq(schema.attachments.id, attachmentId))
    .limit(1);

  return res.status(201).json(attachment);
}

export async function deleteAttachment(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(schema.attachments)
    .where(and(eq(schema.attachments.id, id), eq(schema.attachments.tenantId, tenantId)))
    .limit(1);

  if (!existing) return res.status(404).json({ error: 'Pièce jointe introuvable' });

  await db.delete(schema.attachments).where(eq(schema.attachments.id, id));
  return res.status(204).send();
}
