import { forwardRef } from "react";
import { Badge } from "../../../components/ui/badge";
import { formatCurrency } from "../../../lib/format";
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

export const InvoicePrintView = forwardRef<HTMLDivElement, InvoicePrintViewProps>(
  function InvoicePrintView({ invoice, paymentMethodLabel }, ref) {
    const company = invoice.tenant;
    const customer = invoice.customer;
    const remaining = Math.max(0, Number(invoice.totalTTC) - Number(invoice.paidAmount));

    return (
      <div
        ref={ref}
        className="invoice-print bg-white text-foreground p-8 print:p-4 print:shadow-none"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between border-b pb-6 mb-6">
          <div>
            <h2 className="text-xl font-bold">{company?.legalName || company?.name || "Entreprise"}</h2>
            {company?.name && company.legalName && company.name !== company.legalName && (
              <p className="text-sm text-muted-foreground">{company.name}</p>
            )}
            {company?.address && (
              <p className="text-sm mt-2">
                {company.address}
                {company.city ? `, ${company.city}` : ""}
              </p>
            )}
            {company?.phone && <p className="text-sm">Tél : {company.phone}</p>}
            {company?.email && <p className="text-sm">{company.email}</p>}
            {company?.taxNumber && <p className="text-sm">NIF : {company.taxNumber}</p>}
          </div>
          <div className="text-left sm:text-right">
            <p className="text-3xl font-bold tracking-tight">FACTURE</p>
            <p className="text-lg font-semibold mt-1">{invoice.number}</p>
            <p className="text-sm text-muted-foreground">{invoice.type}</p>
            <div className="mt-2 flex sm:justify-end gap-2">
              <Badge variant="outline">{statusLabel(invoice.status)}</Badge>
              {invoice.isBackdated && <Badge variant="secondary">Antidatée</Badge>}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="rounded-lg border p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Client</p>
            <p className="font-semibold text-base">{customer?.denomination ?? "—"}</p>
            {customer?.address && (
              <p className="text-sm mt-1">
                {customer.address}
                {customer.city ? `, ${customer.city}` : ""}
              </p>
            )}
            {customer?.phone && <p className="text-sm">Tél : {customer.phone}</p>}
            {customer?.email && <p className="text-sm">{customer.email}</p>}
          </div>
          <div className="rounded-lg border p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Date d'émission</p>
              <p className="font-medium">{formatDateFr(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date d'échéance</p>
              <p className="font-medium">{formatDateFr(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mode de paiement</p>
              <p className="font-medium">{paymentMethodLabel || invoice.paymentMethod || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Réf. paiement</p>
              <p className="font-medium">{invoice.paymentRef || "—"}</p>
            </div>
          </div>
        </div>

        <table className="w-full text-sm border-collapse mb-8">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-2 font-medium">Description</th>
              <th className="text-right py-3 px-2 font-medium">Qté</th>
              <th className="text-right py-3 px-2 font-medium">P.U.</th>
              <th className="text-right py-3 px-2 font-medium hidden sm:table-cell">Rem.</th>
              <th className="text-right py-3 px-2 font-medium hidden sm:table-cell">TVA</th>
              <th className="text-right py-3 px-2 font-medium">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items ?? []).map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-3 px-2">{item.description}</td>
                <td className="py-3 px-2 text-right">{item.quantity}</td>
                <td className="py-3 px-2 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                <td className="py-3 px-2 text-right hidden sm:table-cell">{item.discountRate ?? 0}%</td>
                <td className="py-3 px-2 text-right hidden sm:table-cell">{item.taxRate ?? 0}%</td>
                <td className="py-3 px-2 text-right font-medium">
                  {formatCurrency(Number(item.totalTTC ?? 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span>{formatCurrency(Number(invoice.subtotalHT))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remise</span>
              <span>{formatCurrency(Number(invoice.discountAmount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA</span>
              <span>{formatCurrency(Number(invoice.taxAmount))}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Total TTC</span>
              <span>{formatCurrency(Number(invoice.totalTTC))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payé</span>
              <span>{formatCurrency(Number(invoice.paidAmount))}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Reste à payer</span>
              <span>{formatCurrency(remaining)}</span>
            </div>
          </div>
        </div>

        {(invoice.notes || invoice.terms) && (
          <div className="mt-8 pt-6 border-t space-y-4 text-sm">
            {invoice.notes && (
              <div>
                <p className="font-semibold mb-1">Notes</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="font-semibold mb-1">Conditions</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
