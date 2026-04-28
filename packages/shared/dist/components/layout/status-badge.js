import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../../lib/utils";
import { Badge, badgeVariants } from "../ui/badge";
const statusConfig = {
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
export function StatusBadge({ status, className, size = "sm" }) {
    const config = statusConfig[status?.toLowerCase()] ?? {
        label: status,
        variant: "outline",
    };
    return (_jsx(Badge, { variant: config.variant, size: size, className: cn("capitalize", badgeVariants({ variant: config.variant }), className), children: config.label }));
}
