import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db, schema } from './db';

export const DOCUMENT_TYPE_PREFIXES: Record<string, string> = {
  INVOICE: 'FAC',
  QUOTE: 'DEV',
  CREDIT_NOTE: 'AV',
  PROFORMA: 'PRO',
  DELIVERY_NOTE: 'BL',
  PURCHASE_ORDER: 'BC',
};

export function defaultPrefix(documentType: string): string {
  const base = DOCUMENT_TYPE_PREFIXES[documentType] ?? 'DOC';
  const year = new Date().getFullYear();
  return `${base}-${year}-`;
}

export async function generateDocumentNumber(
  tenantId: string,
  documentType: string,
): Promise<string> {
  let currentNumber = 1;
  let prefix = defaultPrefix(documentType);
  const padding = 4;

  await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(schema.numberingConfig)
      .where(
        and(
          eq(schema.numberingConfig.tenantId, tenantId),
          eq(schema.numberingConfig.documentType, documentType),
        ),
      )
      .limit(1);

    const now = new Date();

    if (existing.length === 0) {
      await tx.insert(schema.numberingConfig).values({
        id: randomUUID(),
        tenantId,
        documentType,
        prefix,
        currentNumber: 1,
        padding,
        createdAt: now,
        updatedAt: now,
      });
      currentNumber = 1;
    } else {
      const cfg = existing[0];
      prefix = cfg.prefix;
      currentNumber = (cfg.currentNumber ?? 0) + 1;
      await tx
        .update(schema.numberingConfig)
        .set({ currentNumber, updatedAt: now })
        .where(eq(schema.numberingConfig.id, cfg.id));
    }
  });

  const pad = padding;
  const seq = currentNumber.toString().padStart(pad, '0');
  return `${prefix}${seq}`;
}

export async function ensureDefaultNumberingConfigs(tenantId: string) {
  const now = new Date();
  for (const documentType of Object.keys(DOCUMENT_TYPE_PREFIXES)) {
    const existing = await db
      .select({ id: schema.numberingConfig.id })
      .from(schema.numberingConfig)
      .where(
        and(
          eq(schema.numberingConfig.tenantId, tenantId),
          eq(schema.numberingConfig.documentType, documentType),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.numberingConfig).values({
        id: randomUUID(),
        tenantId,
        documentType,
        prefix: defaultPrefix(documentType),
        currentNumber: 0,
        padding: 4,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}
