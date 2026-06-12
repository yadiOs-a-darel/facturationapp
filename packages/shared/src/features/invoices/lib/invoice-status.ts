import type { InvoiceStatus } from '../types';

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

/** Statut affiché selon montant payé, total et échéance. */
export function resolveInvoiceStatus(params: {
  baseStatus?: string;
  paidAmount: number;
  totalTTC: number;
  dueDate?: Date | string | null;
  now?: Date;
}): InvoiceStatus {
  const { baseStatus, paidAmount, totalTTC, dueDate, now = new Date() } = params;
  if (baseStatus === 'DRAFT') return 'DRAFT';
  if (baseStatus === 'CANCELLED') return 'CANCELLED';
  const remaining = Math.max(0, totalTTC - paidAmount);
  const overdue = remaining > EPSILON && isPastDue(dueDate, now);

  if (totalTTC <= EPSILON) {
    return paidAmount > EPSILON ? 'PAID' : 'SENT';
  }
  if (paidAmount >= totalTTC - EPSILON) return 'PAID';
  if (paidAmount > EPSILON) return overdue ? 'OVERDUE' : 'PARTIAL';
  return overdue ? 'OVERDUE' : 'SENT';
}

export function getRemainingAmount(totalTTC: number, paidAmount: number): number {
  return Math.max(0, totalTTC - paidAmount);
}

export type InvoiceFormLine = {
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  taxRate?: number;
};

export function computeFormTotalTTC(items: InvoiceFormLine[]): number {
  let total = 0;
  for (const item of items) {
    const lineBase = item.quantity * item.unitPrice;
    const lineDiscount = (lineBase * (item.discountRate ?? 0)) / 100;
    const lineHT = lineBase - lineDiscount;
    const lineTax = (lineHT * (item.taxRate ?? 0)) / 100;
    total += lineHT + lineTax;
  }
  return Math.round(total * 100) / 100;
}
