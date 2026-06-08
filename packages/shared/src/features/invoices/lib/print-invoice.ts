import { formatCurrency } from "../../../lib/format";
import { getBrandFontCss, resolveBrandFontKey } from "../../../lib/brand-fonts";
import { resolveUploadUrl } from "../../../lib/uploads";

export interface PrintInvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  taxRate?: number;
  totalTTC: number;
}

export interface PrintInvoiceData {
  number: string;
  type: string;
  status: string;
  issueDate: string;
  dueDate?: string | null;
  isBackdated?: boolean;
  notes?: string | null;
  terms?: string | null;
  paymentMethod?: string | null;
  paymentMethodLabel?: string;
  paymentDate?: string | null;
  paymentRef?: string | null;
  subtotalHT: number;
  discountAmount: number;
  taxAmount: number;
  totalTTC: number;
  paidAmount: number;
  company: {
    name: string;
    legalName?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    taxNumber?: string | null;
    logo?: string | null;
    fontFamily?: string | null;
  };
  customer: {
    denomination: string;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    taxNumber?: string | null;
  };
  items: PrintInvoiceLine[];
}

function formatDateFr(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Brouillon",
    SENT: "Envoyée",
    PARTIAL: "Partiellement payée",
    PAID: "Payée",
    OVERDUE: "En retard",
    CANCELLED: "Annulée",
  };
  return labels[status] ?? status;
}

function resolveLogoForPrint(logo?: string | null): string | undefined {
  return resolveUploadUrl(logo, { absolute: true });
}

export function buildInvoicePrintHtml(data: PrintInvoiceData): string {
  const font = getBrandFontCss(resolveBrandFontKey(data.company.fontFamily));
  const logoSrc = resolveLogoForPrint(data.company.logo);

  const rows = data.items
    .map(
      (item) => `
      <tr>
        <td>${item.description}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${formatCurrency(item.unitPrice)}</td>
        <td class="num">${item.discountRate ?? 0}%</td>
        <td class="num">${item.taxRate ?? 0}%</td>
        <td class="num">${formatCurrency(item.totalTTC)}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Facture ${data.number}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: ${font.body}; color: #111; margin: 0; padding: 32px; font-size: 13px; }
    h1 { margin: 0 0 4px; font-size: 22px; font-family: ${font.heading}; }
    .company-logo { max-height: 64px; max-width: 180px; object-fit: contain; margin-bottom: 12px; display: block; }
    .muted { color: #666; }
    .header { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 32px; }
    .box { border: 1px solid #ddd; border-radius: 8px; padding: 16px; flex: 1; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
    th, td { border-bottom: 1px solid #e5e5e5; padding: 10px 8px; text-align: left; }
    th { background: #f8f8f8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    .num { text-align: right; white-space: nowrap; }
    .totals { margin-left: auto; width: 280px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals .grand { font-size: 16px; font-weight: 700; border-top: 2px solid #111; margin-top: 8px; padding-top: 10px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #f0f0f0; font-size: 11px; font-weight: 600; }
    .badge.paid { background: #dcfce7; color: #166534; }
    .badge.cancelled { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 32px; font-size: 12px; color: #666; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${logoSrc ? `<img src="${logoSrc}" alt="Logo" class="company-logo" />` : ""}
      <h1>${data.company.legalName || data.company.name}</h1>
      <p class="muted">${data.company.name !== data.company.legalName ? data.company.name : ""}</p>
      ${data.company.address ? `<p>${data.company.address}${data.company.city ? `, ${data.company.city}` : ""}</p>` : ""}
      ${data.company.phone ? `<p>Tél : ${data.company.phone}</p>` : ""}
      ${data.company.email ? `<p>${data.company.email}</p>` : ""}
      ${data.company.taxNumber ? `<p>NIF : ${data.company.taxNumber}</p>` : ""}
    </div>
    <div style="text-align:right">
      <h1 style="font-size:28px">FACTURE</h1>
      <p><strong>${data.number}</strong></p>
      <p class="muted">${data.type}</p>
      <span class="badge ${data.status === "PAID" ? "paid" : ""} ${data.status === "CANCELLED" ? "cancelled" : ""}">${statusLabel(data.status)}</span>
      ${data.isBackdated ? '<p class="muted" style="margin-top:8px">Document antidaté</p>' : ""}
    </div>
  </div>

  <div class="header">
    <div class="box">
      <strong>Client</strong>
      <p style="margin:8px 0 4px;font-size:15px">${data.customer.denomination}</p>
      ${data.customer.address ? `<p>${data.customer.address}${data.customer.city ? `, ${data.customer.city}` : ""}</p>` : ""}
      ${data.customer.phone ? `<p>Tél : ${data.customer.phone}</p>` : ""}
      ${data.customer.email ? `<p>${data.customer.email}</p>` : ""}
      ${data.customer.taxNumber ? `<p>NIF : ${data.customer.taxNumber}</p>` : ""}
    </div>
    <div class="box">
      <div class="meta">
        <span>Date d'émission</span><strong>${formatDateFr(data.issueDate)}</strong>
        <span>Date d'échéance</span><strong>${formatDateFr(data.dueDate)}</strong>
        <span>Mode de paiement</span><strong>${data.paymentMethodLabel || data.paymentMethod || "—"}</strong>
        <span>Réf. paiement</span><strong>${data.paymentRef || "—"}</strong>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="num">Qté</th>
        <th class="num">P.U.</th>
        <th class="num">Remise</th>
        <th class="num">TVA</th>
        <th class="num">Total TTC</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Sous-total HT</span><strong>${formatCurrency(data.subtotalHT)}</strong></div>
    <div><span>Remise</span><strong>${formatCurrency(data.discountAmount)}</strong></div>
    <div><span>TVA</span><strong>${formatCurrency(data.taxAmount)}</strong></div>
    <div class="grand"><span>Total TTC</span><strong>${formatCurrency(data.totalTTC)}</strong></div>
    <div><span>Montant payé</span><strong>${formatCurrency(data.paidAmount)}</strong></div>
    <div><span>Reste à payer</span><strong>${formatCurrency(Math.max(0, data.totalTTC - data.paidAmount))}</strong></div>
  </div>

  ${data.notes ? `<div class="footer"><strong>Notes</strong><p>${data.notes}</p></div>` : ""}
  ${data.terms ? `<div class="footer"><strong>Conditions</strong><p>${data.terms}</p></div>` : ""}
</body>
</html>`;
}

export function printInvoice(data: PrintInvoiceData): void {
  const html = buildInvoicePrintHtml(data);
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => {
    win.print();
  };
}

export function downloadInvoicePdf(data: PrintInvoiceData): void {
  printInvoice(data);
}

export function invoiceDetailToPrintData(
  invoice: {
    number: string;
    type: string;
    status: string;
    issueDate: string;
    dueDate?: string | null;
    isBackdated?: boolean;
    notes?: string | null;
    terms?: string | null;
    paymentMethod?: string | null;
    paymentDate?: string | null;
    paymentRef?: string | null;
    subtotalHT: number | string;
    discountAmount: number | string;
    taxAmount: number | string;
    totalTTC: number | string;
    paidAmount: number | string;
    customer?: {
      denomination: string;
      address?: string | null;
      city?: string | null;
      phone?: string | null;
      email?: string | null;
      taxNumber?: string | null;
    };
    tenant?: {
      name: string;
      legalName?: string | null;
      address?: string | null;
      city?: string | null;
      phone?: string | null;
      email?: string | null;
      taxNumber?: string | null;
      logo?: string | null;
      fontFamily?: string | null;
    };
    items?: Array<{
      description: string;
      quantity: number;
      unitPrice: number | string;
      discountRate?: number;
      taxRate?: number;
      totalTTC?: number | string;
    }>;
  },
  paymentMethodLabel?: string,
): PrintInvoiceData {
  return {
    number: invoice.number,
    type: invoice.type,
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    isBackdated: invoice.isBackdated,
    notes: invoice.notes,
    terms: invoice.terms,
    paymentMethod: invoice.paymentMethod,
    paymentMethodLabel,
    paymentDate: invoice.paymentDate,
    paymentRef: invoice.paymentRef,
    subtotalHT: Number(invoice.subtotalHT),
    discountAmount: Number(invoice.discountAmount),
    taxAmount: Number(invoice.taxAmount),
    totalTTC: Number(invoice.totalTTC),
    paidAmount: Number(invoice.paidAmount),
    company: {
      name: invoice.tenant?.name ?? "Entreprise",
      legalName: invoice.tenant?.legalName,
      address: invoice.tenant?.address,
      city: invoice.tenant?.city,
      phone: invoice.tenant?.phone,
      email: invoice.tenant?.email,
      taxNumber: invoice.tenant?.taxNumber,
      logo: invoice.tenant?.logo,
      fontFamily: invoice.tenant?.fontFamily,
    },
    customer: {
      denomination: invoice.customer?.denomination ?? "—",
      address: invoice.customer?.address,
      city: invoice.customer?.city,
      phone: invoice.customer?.phone,
      email: invoice.customer?.email,
      taxNumber: invoice.customer?.taxNumber,
    },
    items: (invoice.items ?? []).map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discountRate: item.discountRate,
      taxRate: item.taxRate,
      totalTTC: Number(item.totalTTC ?? 0),
    })),
  };
}
