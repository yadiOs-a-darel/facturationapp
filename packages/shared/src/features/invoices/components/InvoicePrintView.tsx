import { forwardRef } from "react";
import { Badge } from "../../../components/ui/badge";
import { formatCurrency } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { resolveUploadUrl } from "../../../lib/uploads";
import type { Invoice } from "../types";

export interface InvoiceDetail extends Invoice {
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
}

interface InvoicePrintViewProps {
  invoice: InvoiceDetail;
  paymentMethodLabel?: string;
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

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    PAID: "border-success/40 bg-success/15 text-success-foreground",
    PARTIAL: "border-warning/40 bg-warning/15 text-warning-foreground",
    OVERDUE: "border-destructive/40 bg-destructive/15 text-destructive-foreground",
    SENT: "border-info/40 bg-info/15 text-info-foreground",
    DRAFT: "border-border bg-muted/50 text-muted-foreground",
    CANCELLED: "border-border bg-muted/30 text-muted-foreground",
  };
  return map[status] ?? "border-border bg-muted/40";
}

export const InvoicePrintView = forwardRef<HTMLDivElement, InvoicePrintViewProps>(
  function InvoicePrintView({ invoice, paymentMethodLabel }, ref) {
    const company = invoice.tenant;
    const customer = invoice.customer;
    const remaining = Math.max(0, Number(invoice.totalTTC) - Number(invoice.paidAmount));
    const logoUrl = resolveUploadUrl(company?.logo, { absolute: true });

    return (
      <div
        ref={ref}
        className={cn(
          "invoice-print invoice-document rounded-xl mx-4 mb-4 p-6 sm:p-8",
          "print:mx-0 print:mb-0 print:rounded-none print:p-4 print:shadow-none",
        )}
      >
        <div className="invoice-doc-header flex flex-col gap-6 sm:flex-row sm:justify-between border-b pb-6 mb-6">
          <div>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={company?.name ? `Logo ${company.name}` : "Logo entreprise"}
                className="mb-4 h-16 max-w-[180px] object-contain"
              />
            )}
            <h2 className="text-xl font-bold text-foreground">
              {company?.legalName || company?.name || "Entreprise"}
            </h2>
            {company?.name && company.legalName && company.name !== company.legalName && (
              <p className="text-sm text-muted-foreground">{company.name}</p>
            )}
            {company?.address && (
              <p className="text-sm mt-2 text-foreground/85">
                {company.address}
                {company.city ? `, ${company.city}` : ""}
              </p>
            )}
            {company?.phone && (
              <p className="text-sm text-foreground/80">Tél : {company.phone}</p>
            )}
            {company?.email && (
              <p className="text-sm text-foreground/80">{company.email}</p>
            )}
            {company?.taxNumber && (
              <p className="text-sm text-muted-foreground">NIF : {company.taxNumber}</p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <p className="invoice-doc-title text-3xl font-bold tracking-tight">FACTURE</p>
            <p className="text-lg font-semibold mt-1 text-primary">{invoice.number}</p>
            <p className="text-sm text-muted-foreground">{invoice.type}</p>
            <div className="mt-3 flex sm:justify-end gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn("font-medium", statusBadgeClass(invoice.status))}
              >
                {statusLabel(invoice.status)}
              </Badge>
              {invoice.isBackdated && (
                <Badge variant="secondary" className="bg-muted/60">
                  Antidatée
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="invoice-doc-card rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80 mb-2">
              Client
            </p>
            <p className="font-semibold text-base">{customer?.denomination ?? "Sans client"}</p>
            {customer?.address && (
              <p className="text-sm mt-1 text-foreground/85">
                {customer.address}
                {customer.city ? `, ${customer.city}` : ""}
              </p>
            )}
            {customer?.phone && (
              <p className="text-sm text-foreground/80">Tél : {customer.phone}</p>
            )}
            {customer?.email && (
              <p className="text-sm text-foreground/80">{customer.email}</p>
            )}
          </div>
          <div className="invoice-doc-card rounded-xl border p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Date d'émission
              </p>
              <p className="font-medium mt-0.5">{formatDateFr(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Date d'échéance
              </p>
              <p className="font-medium mt-0.5">{formatDateFr(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Mode de paiement
              </p>
              <p className="font-medium mt-0.5">
                {paymentMethodLabel || invoice.paymentMethod || "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Réf. paiement
              </p>
              <p className="font-medium mt-0.5">{invoice.paymentRef || "—"}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/50 mb-8">
          <table className="invoice-doc-table w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-3 font-medium text-foreground/90">
                  Description
                </th>
                <th className="text-right py-3 px-3 font-medium">Qté</th>
                <th className="text-right py-3 px-3 font-medium">P.U.</th>
                <th className="text-right py-3 px-3 font-medium hidden sm:table-cell">Rem.</th>
                <th className="text-right py-3 px-3 font-medium hidden sm:table-cell">TVA</th>
                <th className="text-right py-3 px-3 font-medium">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items ?? []).map((item, idx) => (
                <tr key={idx} className="border-b transition-colors">
                  <td className="py-3 px-3">{item.description}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{item.quantity}</td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatCurrency(Number(item.unitPrice))}
                  </td>
                  <td className="py-3 px-3 text-right hidden sm:table-cell tabular-nums">
                    {item.discountRate ?? 0}%
                  </td>
                  <td className="py-3 px-3 text-right hidden sm:table-cell tabular-nums">
                    {item.taxRate ?? 0}%
                  </td>
                  <td className="py-3 px-3 text-right font-medium tabular-nums">
                    {formatCurrency(Number(item.totalTTC ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="invoice-doc-totals w-full max-w-xs space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span className="tabular-nums">{formatCurrency(Number(invoice.subtotalHT))}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Remise</span>
              <span className="tabular-nums">
                {formatCurrency(Number(invoice.discountAmount))}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">TVA</span>
              <span className="tabular-nums">{formatCurrency(Number(invoice.taxAmount))}</span>
            </div>
            <div className="flex justify-between gap-4 text-base font-bold border-t border-border/60 pt-2.5 mt-1">
              <span>Total TTC</span>
              <span className="text-primary tabular-nums">
                {formatCurrency(Number(invoice.totalTTC))}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Payé</span>
              <span className="tabular-nums text-success-foreground">
                {formatCurrency(Number(invoice.paidAmount))}
              </span>
            </div>
            <div className="flex justify-between gap-4 font-semibold">
              <span>Reste à payer</span>
              <span
                className={cn(
                  "tabular-nums",
                  remaining > 0 ? "text-warning-foreground" : "text-success-foreground",
                )}
              >
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>
        </div>

        {(invoice.notes || invoice.terms) && (
          <div className="mt-8 pt-6 border-t border-border/50 space-y-4 text-sm">
            {invoice.notes && (
              <div className="invoice-doc-card rounded-lg border p-4">
                <p className="font-semibold mb-1 text-primary/90">Notes</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="invoice-doc-card rounded-lg border p-4">
                <p className="font-semibold mb-1 text-primary/90">Conditions</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
