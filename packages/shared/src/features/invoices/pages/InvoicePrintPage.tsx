import { useEffect, useRef } from "react";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { InvoicePrintView } from "../components/InvoicePrintView";
import { useInvoice } from "../hooks/use-invoices";
import { usePaymentMethods } from "../../payment-methods/hooks/use-payment-methods";
import { TenantBrandTheme } from "../../account/components/TenantBrandTheme";
import { usePageTitle } from "../../../hooks/use-page-title";

function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  ).then(() => undefined);
}

export function InvoicePrintPage() {
  const { invoiceId } = useParams({ strict: false }) as { invoiceId: string };
  const search = useSearch({ strict: false }) as { auto?: string };
  const autoPrint = search?.auto === "1";

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const { data: paymentMethods } = usePaymentMethods();
  const printRef = useRef<HTMLDivElement>(null);

  usePageTitle(invoice ? `Impression ${invoice.number}` : "Impression");

  const paymentMethodLabel = invoice?.paymentMethod
    ? paymentMethods?.find((m) => m.code === invoice.paymentMethod)?.label ??
      invoice.paymentMethod
    : undefined;

  useEffect(() => {
    if (!autoPrint || !invoice || !printRef.current) return;

    let cancelled = false;
    (async () => {
      await waitForImages(printRef.current!);
      if (!cancelled) {
        window.print();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoPrint, invoice]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Chargement du document…
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">Document introuvable ou inaccessible.</p>
        <Button asChild variant="outline">
          <Link to="/invoices">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux factures
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <TenantBrandTheme />
      <div className="invoice-print-page min-h-screen bg-muted/30 print:bg-white">
        <div className="print:hidden sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Button asChild variant="ghost" size="sm">
            <Link to="/invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>

        <div ref={printRef} className="mx-auto max-w-4xl py-6 print:py-0 print:max-w-none">
          <InvoicePrintView invoice={invoice} paymentMethodLabel={paymentMethodLabel} />
        </div>
      </div>
    </>
  );
}
