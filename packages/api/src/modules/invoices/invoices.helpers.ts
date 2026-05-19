import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { schema } from '../../lib/db';

export type InvoiceItemInput = {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  taxRate?: number;
};

export function computeTotals(items: InvoiceItemInput[]) {
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

  return { subtotalHT, taxAmount, totalTTC: subtotalHT + taxAmount };
}

export function computeLineTotals(item: InvoiceItemInput) {
  const lineBase = item.quantity * item.unitPrice;
  const lineDiscount = (lineBase * (item.discountRate ?? 0)) / 100;
  const lineHT = lineBase - lineDiscount;
  const lineTax = (lineHT * (item.taxRate ?? 19)) / 100;
  return { lineHT, lineTTC: lineHT + lineTax };
}

type DbTx = Parameters<Parameters<typeof import('../../lib/db').db.transaction>[0]>[0];

export async function insertInvoiceItems(
  tx: DbTx,
  params: {
    tenantId: string;
    invoiceId: string;
    invoiceNumber: string;
    items: InvoiceItemInput[];
    userId?: string | null;
    now: Date;
  },
) {
  const { tenantId, invoiceId, invoiceNumber, items, userId, now } = params;

  for (const [index, item] of items.entries()) {
    const { lineHT, lineTTC } = computeLineTotals(item);

    await tx.insert(schema.invoiceItems).values({
      id: randomUUID(),
      invoiceId,
      productId: item.productId ?? null,
      description: item.description,
      quantity: item.quantity,
      unit: 'pcs',
      unitPrice: String(item.unitPrice.toFixed(2)),
      discountRate: item.discountRate ?? 0,
      taxRate: item.taxRate ?? 19,
      totalHT: String(lineHT.toFixed(2)),
      totalTTC: String(lineTTC.toFixed(2)),
      order: index,
    });

    if (item.productId) {
      await applyStockOut(tx, {
        tenantId,
        productId: item.productId,
        quantity: item.quantity,
        reference: invoiceId,
        reason: `Facture ${invoiceNumber}`,
        userId,
        now,
      });
    }
  }
}

export async function applyStockOut(
  tx: DbTx,
  params: {
    tenantId: string;
    productId: string;
    quantity: number;
    reference: string;
    reason: string;
    userId?: string | null;
    now: Date;
  },
) {
  const { tenantId, productId, quantity, reference, reason, userId, now } = params;

  const [product] = await tx
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.id, productId), eq(schema.products.tenantId, tenantId)))
    .limit(1);

  if (!product || product.isService) return;

  const currentStock = Number(product.stockQuantity) || 0;
  const newStock = currentStock - quantity;

  if (newStock < 0) {
    throw new Error('Stock insuffisant');
  }

  await tx.insert(schema.stockMovements).values({
    id: randomUUID(),
    tenantId,
    productId,
    type: 'OUT',
    quantity: -quantity,
    reason,
    reference,
    createdAt: now,
    createdBy: userId ?? null,
  });

  await tx
    .update(schema.products)
    .set({ stockQuantity: newStock, updatedAt: now })
    .where(eq(schema.products.id, productId));
}

export async function restoreStockForItems(
  tx: DbTx,
  params: {
    tenantId: string;
    invoiceId: string;
    invoiceNumber: string;
    userId?: string | null;
    now: Date;
  },
) {
  const items = await tx
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, params.invoiceId));

  for (const item of items) {
    if (!item.productId) continue;

    const [product] = await tx
      .select()
      .from(schema.products)
      .where(
        and(eq(schema.products.id, item.productId), eq(schema.products.tenantId, params.tenantId)),
      )
      .limit(1);

    if (!product || product.isService) continue;

    const qty = Number(item.quantity) || 0;
    const newStock = (Number(product.stockQuantity) || 0) + qty;

    await tx.insert(schema.stockMovements).values({
      id: randomUUID(),
      tenantId: params.tenantId,
      productId: item.productId,
      type: 'RETURN',
      quantity: qty,
      reason: `Annulation facture ${params.invoiceNumber}`,
      reference: params.invoiceId,
      createdAt: params.now,
      createdBy: params.userId ?? null,
    });

    await tx
      .update(schema.products)
      .set({ stockQuantity: newStock, updatedAt: params.now })
      .where(eq(schema.products.id, item.productId));
  }
}

export const EDITABLE_INVOICE_STATUSES = ['DRAFT', 'SENT', 'PARTIAL', 'OVERDUE'] as const;

const EPSILON = 0.01;

export function isPastDue(dueDate: Date | string | null | undefined, now = new Date()): boolean {
  if (!dueDate) return false;
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  return dueDay < today;
}

export function resolveInvoiceStatus(params: {
  paidAmount: number;
  totalTTC: number;
  dueDate?: Date | string | null;
  now?: Date;
}): string {
  const { paidAmount, totalTTC, dueDate, now = new Date() } = params;
  const remaining = Math.max(0, totalTTC - paidAmount);
  const overdue = remaining > EPSILON && isPastDue(dueDate, now);

  if (totalTTC <= EPSILON) {
    return paidAmount > EPSILON ? 'PAID' : 'SENT';
  }
  if (paidAmount >= totalTTC - EPSILON) return 'PAID';
  if (paidAmount > EPSILON) return overdue ? 'OVERDUE' : 'PARTIAL';
  return overdue ? 'OVERDUE' : 'SENT';
}
