import type { ComponentProps } from "react";
import { Badge } from "../ui/badge";
type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
type Status = InvoiceStatus | StockStatus | string;
interface StatusBadgeProps {
    status: Status;
    className?: string;
    size?: ComponentProps<typeof Badge>["size"];
}
export declare function StatusBadge({ status, className, size }: StatusBadgeProps): any;
export {};
