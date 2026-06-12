import type { Response } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { db, schema } from '../../lib/db';
import type { AuthenticatedRequest } from '../../middleware/auth';

export async function listAuditLogs(req: AuthenticatedRequest, res: Response) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Non authentifié' });

  const limit = Math.min(Number(req.query.limit) || 50, 200);

  const rows = await db
    .select()
    .from(schema.auditLogs)
    .where(eq(schema.auditLogs.tenantId, tenantId))
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(limit);

  return res.json({ data: rows });
}
