export const DOCUMENT_TYPE_TITLES: Record<string, string> = {
  INVOICE: "FACTURE",
  QUOTE: "DEVIS",
  PROFORMA: "FACTURE PROFORMA",
  CREDIT_NOTE: "AVOIR",
  DELIVERY_NOTE: "BON DE LIVRAISON",
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  INVOICE: "Facture",
  PROFORMA: "Proforma",
  QUOTE: "Devis",
  CREDIT_NOTE: "Avoir",
  DELIVERY_NOTE: "Bon de livraison",
};

export function getDocumentTypeTitle(type: string): string {
  return DOCUMENT_TYPE_TITLES[type] ?? "DOCUMENT";
}

export function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type;
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PARTIAL: "Partiellement payée",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
};

export function getInvoiceStatusLabel(status: string): string {
  return INVOICE_STATUS_LABELS[status] ?? status;
}
