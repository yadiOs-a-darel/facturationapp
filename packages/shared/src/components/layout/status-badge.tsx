import { cn } from "../../lib/utils";
import type { ComponentProps } from "react";
import { Badge, badgeVariants } from "../ui/badge";
import { cva } from "class-variance-authority";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

type Status = InvoiceStatus | StockStatus | string;

const statusConfig: Record<
  string,
  { label: string; variant: ComponentProps<typeof Badge>["variant"] }
> = {
  draft: { label: "Brouillon", variant: "secondary" },
  sent: { label: "Envoyée", variant: "info" },
  paid: { label: "Payée", variant: "success" },
  overdue: { label: "En retard", variant: "destructive" },
  cancelled: { label: "Annulée", variant: "secondary" },
  in_stock: { label: "En stock", variant: "success" },
  low_stock: { label: "Stock faible", variant: "warning" },
  out_of_stock: { label: "Rupture", variant: "destructive" },
  active: { label: "Actif", variant: "success" },
  inactive: { label: "Inactif", variant: "secondary" },
  pending: { label: "En attente", variant: "warning" },
  completed: { label: "Terminé", variant: "success" },
  failed: { label: "Échoué", variant: "destructive" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
  size?: ComponentProps<typeof Badge>["size"];
}

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status?.toLowerCase()] ?? {
    label: status,
    variant: "outline" as const,
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={cn("capitalize", badgeVariants({ variant: config.variant }), className)}
    >
      {config.label}
    </Badge>
  );
}
