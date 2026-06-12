import { randomUUID } from 'crypto';
import { db, schema } from './db';

export async function logAudit(params: {
  tenantId: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string | null;
}) {
  try {
    await db.insert(schema.auditLogs).values({
      id: randomUUID(),
      tenantId: params.tenantId,
      userId: params.userId ?? null,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId ?? null,
      oldData: params.oldData ? JSON.stringify(params.oldData) : null,
      newData: params.newData ? JSON.stringify(params.newData) : null,
      ipAddress: params.ipAddress ?? null,
      createdAt: new Date(),
    });
  } catch {
    // Audit ne doit pas bloquer les opérations métier
  }
}
