/** Classes partagées — thème nuit pour factures (écran). */
export const invoiceSelectClass =
  "invoice-field flex h-9 w-full rounded-lg border border-border/70 bg-muted/80 px-3 py-2 text-sm text-foreground shadow-inner " +
  "transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/40";

export const invoiceDateClass = invoiceSelectClass;

export const invoicePanelClass =
  "rounded-xl border border-border/50 bg-muted/25 p-4 shadow-sm";

export const invoiceItemCardClass =
  "rounded-xl border border-border/45 bg-card/90 p-4 mb-4 shadow-sm";

export const invoiceItemsSectionClass =
  "rounded-xl border border-border/50 bg-muted/15 p-4";

export const invoiceSummaryClass =
  "rounded-lg border border-border/50 bg-card/80 p-3 text-sm space-y-1 shadow-inner";

export const invoicePaymentPanelClass =
  "md:col-span-2 space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-muted/40 to-card/60 p-4 shadow-sm";
